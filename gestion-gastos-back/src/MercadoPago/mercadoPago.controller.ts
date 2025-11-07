import { Request, Response, NextFunction } from "express";
import { orm } from "../shared/db/orm.js";
import { User } from "../User/user.entity.js";
import { Operation, OperationType } from "../Operation/operation.entity.js";
import { Wallet } from "../Wallet/wallet.entity.js";
import { Category } from "../Category/category.entity.js";
import { generatePKCE, getCodeVerifier, deleteCodeVerifier } from '../utils/pkce.utils.js';

const em = orm.em;

async function initiateOAuth(req: Request, res: Response) {
  try {
    const firebaseUser = (req as any).firebaseUser;
    const userId = firebaseUser.uid;

    // Generar PKCE 
    const { codeVerifier, codeChallenge } = generatePKCE(userId);

    const authUrl = new URL('https://auth.mercadopago.com/authorization');
    authUrl.searchParams.append('client_id', process.env.MP_CLIENT_ID!);
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('platform_id', 'mp');
    authUrl.searchParams.append('state', userId);
    authUrl.searchParams.append('redirect_uri', process.env.MP_REDIRECT_URI!);
    authUrl.searchParams.append('code_challenge', codeChallenge);
    authUrl.searchParams.append('code_challenge_method', 'S256');


    return res.status(200).json({
      success: true,
      message: "URL de autorización generada",
      data: { authUrl: authUrl.toString() },
    });
  } catch (error: any) {
    console.error('❌ Error en initiateOAuth:', error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

async function oauthCallback(req: Request, res: Response) {
  try {

    const { code, state: userId } = req.query;

    if (!code || !userId) {
      console.error('❌ Faltan parámetros:', { code, userId });
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/configuracion?mp_error=missing_parameters`);
    }

    const codeVerifier = getCodeVerifier(userId as string);
    
    if (!codeVerifier) {
      console.error('❌ No se encontró code_verifier para userId:', userId);
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/configuracion?mp_error=session_expired`);
    }

    const tokenBody = new URLSearchParams();
    tokenBody.append('grant_type', 'authorization_code');
    tokenBody.append('client_id', process.env.MP_CLIENT_ID!);
    tokenBody.append('client_secret', process.env.MP_CLIENT_SECRET!);
    tokenBody.append('code', code as string);
    tokenBody.append('redirect_uri', process.env.MP_REDIRECT_URI!);
    tokenBody.append('code_verifier', codeVerifier);

    const tokenResponse = await fetch('https://api.mercadopago.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: tokenBody
    });

    
    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error('❌ Error en token exchange:', tokenData);
      
      deleteCodeVerifier(userId as string);
      
      throw new Error(tokenData.error_description || tokenData.message || `Error ${tokenResponse.status}`);
    }

    deleteCodeVerifier(userId as string);

    // Buscar y actualizar usuario
    const user = await em.findOne(User, { id: userId as string });
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    // Actualizar tokens
    user.updateMercadoPagoTokens(
      tokenData.access_token,
      tokenData.refresh_token,
      tokenData.expires_in || 21600,
      tokenData.user_id
    );

    await em.flush();
    console.log(' Tokens guardados exitosamente');

    return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/Profile?mp_success=true`);

  } catch (error: any) {
    console.error('❌ OAuth callback error:', error);
    
    // Limpiar code_verifier en caso de error
    if (req.query.state) {
      deleteCodeVerifier(req.query.state as string);
    }
    
    return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/Profile?mp_error=${encodeURIComponent(error.message)}`);
  }
}

async function syncMovements(req: Request, res: Response) {
  try {
    const firebaseUser = (req as any).firebaseUser;
    const userId = firebaseUser.uid;

    // Obtener usuario con token de MP
    const user = await em.findOne(User, { id: userId });
    if (!user) {
      console.error('❌ Usuario no encontrado en DB');
      return res.status(400).json({
        success: false,
        message: "Usuario no encontrado",
      });
    }

    if (!user.isMercadoPagoConnected()) {
      console.error('❌ Usuario no tiene MP conectado o token expirado');
      return res.status(400).json({
        success: false,
        message: "Usuario no tiene cuenta de Mercado Pago conectada o la conexión expiró",
      });
    }

    // Obtener movimientos de Mercado Pago
    const movements = await fetchMovementsFromMP(user.mpAccessToken!);

    // Procesar y guardar movimientos
    const savedMovements = await processAndSaveMovements(userId, movements);

    // Marcar última sincronización
    user.markLastSync();
    await em.flush();

   return res.status(200).json({
  success: true,
  message: "Movimientos sincronizados exitosamente",
  data: {
    imported: savedMovements.length,
    movements: savedMovements,
    lastSyncAt: user.lastSyncAt,
    statistics: {
      incomes: savedMovements.filter(m => m.type === OperationType.INGRESO).length,
      expenses: savedMovements.filter(m => m.type === OperationType.GASTO).length,
      operationTypes: savedMovements.reduce((acc: any, mov) => {
        const opType = mov.operation_type || 'sin_operation_type';
        acc[opType] = (acc[opType] || 0) + 1;
        return acc;
      }, {})
    }
  },
});

  } catch (error: any) {
    console.error('❌ Sync movements error:', error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

async function getConnectionStatus(req: Request, res: Response) {
  try {
    const firebaseUser = (req as any).firebaseUser;

    if (!firebaseUser || !firebaseUser.uid) {
      return res.status(401).json({
        success: false,
        message: "Usuario no autenticado",
      });
    }

    const userId = firebaseUser.uid;

    const user = await em.findOne(User, { id: userId });

    const isConnected = user ? user.isMercadoPagoConnected() : false;

    return res.status(200).json({
      success: true,
      message: "Estado de conexión obtenido",
      data: {
        connected: isConnected,
        expiresAt: user?.mpTokenExpiresAt,
        lastSyncAt: user?.lastSyncAt,
        needsReconnect: user?.mpTokenExpiresAt && new Date() > user.mpTokenExpiresAt,
      },
    });

  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

// Funciones auxiliares
async function fetchMovementsFromMP(accessToken: string): Promise<any[]> {
  try {
    const url = `https://api.mercadopago.com/v1/payments/search?sort=date_created&criteria=desc&limit=100`;

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Error response:', errorData);
      throw new Error(`Error al obtener movimientos: ${errorData.message || response.statusText}`);
    }

    const data = await response.json();

    const filteredResults = (data.results || []).filter((payment:any) => 
      payment.status === 'approved' || payment.status === 'completed'
    );

    return filteredResults;

  } catch (error: any) {
    console.error('❌ Error en fetchMovementsFromMP:', error);
    throw error;
  }
}

async function processAndSaveMovements(userId: string, mpMovements: any[]): Promise<any[]> {
  const user = await em.findOne(User, { id: userId });
  if (!user) throw new Error('Usuario no encontrado');

  const defaultWallet = await em.findOne(Wallet, { user: { id: userId } });
  if (!defaultWallet) throw new Error('No se encontró wallet para el usuario');

  let defaultCategory = await em.findOne(Category, { name: 'Otros' });
  if (!defaultCategory) {
    defaultCategory = await em.findOne(Category, {});
    if (!defaultCategory) throw new Error('No se encontraron categorías');
  }

  const savedOperations: any[] = [];
  let duplicateCount = 0;
  let invalidStatusCount = 0;
  let processedCount = 0;
  let incomeCount = 0;
  let expenseCount = 0;


  for (const payment of mpMovements) {
    try {
      if (payment.id) {
        const existingCount = await em.getConnection().execute(
          'SELECT COUNT(*) as count FROM operation WHERE userid = ? AND external_id = ?',
          [userId, payment.id.toString()]
        );
        
        if (existingCount[0].count > 0) {
          duplicateCount++;
          continue;
        }
      }

      const validStatuses = ['approved', 'completed', 'authorized', 'in_process'];
      if (!validStatuses.includes(payment.status)) {
        invalidStatusCount++;
        continue;
      }

      // Determinar tipo y monto
      const transactionAmount = payment.transaction_amount || payment.amount || 0;
      const amount = Math.abs(transactionAmount);
      
      if (amount === 0) {
        continue;
      }

      let type: OperationType = OperationType.GASTO; 
      let typeReason = 'asumido gasto por defecto';
      const operationType = payment.operation_type || 'sin_operation_type';

      if (payment.operation_type) {
        switch (payment.operation_type) {
          case 'money_transfer':
          case 'account_fund':
          case 'payment_addition':
            type = OperationType.INGRESO;
            typeReason = `operation_type: ${payment.operation_type} (entrada de dinero)`;
            break;
          case 'regular_payment':
          case 'recurring_payment':
          case 'pos_payment':
          case 'cellphone_recharge':
            type = OperationType.GASTO;
            typeReason = `operation_type: ${payment.operation_type} (pago/salida de dinero)`;
            break;
          case 'investment':
          case 'money_exchange':
            type = OperationType.GASTO;
            typeReason = `operation_type: ${payment.operation_type} (asumido gasto)`;
            break;
          default:
            typeReason = `operation_type: ${payment.operation_type} (no reconocido, asumido gasto)`;
        }
      }
      else if (payment.description) {
        const descLower = payment.description.toLowerCase();
        
        const incomeKeywords = [
          'reembolso',
          'devolución',
          'devolucion',
          'transferencia recibida',
          'depósito',
          'deposito',
          'cashin',
          'money_in',
          'ingreso',
          'pago recibido',
          'recibido',
          'refund'
        ];
        
        if (incomeKeywords.some(keyword => descLower.includes(keyword))) {
          type = OperationType.INGRESO;
          typeReason = 'keyword ingreso detectado: ' + payment.description;
        } else {
          typeReason = 'descripción analizada: ' + payment.description;
        }
      }

      if (type === OperationType.INGRESO) {
        incomeCount++;
      } else {
        expenseCount++;
      }

      const description = payment.description || 
                         `Pago MP ${payment.id}`;

      // Fecha del pago
      const paymentDate = new Date(payment.date_created || payment.date_approved || payment.created_date);

      // Crear operation
      const operation = new Operation(
        amount,
        description,
        paymentDate,
        type,
        defaultWallet,
        defaultCategory,
        user
      );
      
      // Establecer propiedades adicionales después de la construcción
      operation.externalId = payment.id?.toString();
      operation.syncSource = 'mercado_pago';
      operation.paymentMethod = payment.payment_method_id;
      operation.status = payment.status;

      await em.persistAndFlush(operation);
      processedCount++;
      
      savedOperations.push({
        id: operation.id,
        amount: operation.amount,
        description: operation.description,
        type: operation.type,
        date: operation.date,
        externalId: operation.externalId,
        status: operation.status,
        operation_type: operationType // Para análisis en frontend
      });

    } catch (error) {
      console.error(`❌ Error procesando pago ${payment.id}:`, error);
    }
  }

  return savedOperations;
}


async function debugConfig(req: Request, res: Response) {
  try {
    const config = {
      MP_CLIENT_ID: process.env.MP_CLIENT_ID ? '✅ Configurado' : '❌ Faltante',
      MP_CLIENT_SECRET: process.env.MP_CLIENT_SECRET ? '✅ Configurado' : '❌ Faltante', 
      MP_ACCESS_TOKEN: process.env.MP_ACCESS_TOKEN ? '✅ Configurado' : '❌ Faltante',
      MP_REDIRECT_URI: process.env.MP_REDIRECT_URI ? '✅ Configurado' : '❌ Faltante',
      clientIdLength: process.env.MP_CLIENT_ID?.length || 0,
      clientSecretLength: process.env.MP_CLIENT_SECRET?.length || 0,
      accessTokenLength: process.env.MP_ACCESS_TOKEN?.length || 0
    };

    return res.status(200).json({
      success: true,
      message: "Configuración de Mercado Pago",
      data: config
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

async function verifyOAuthConfig(req: Request, res: Response) {
  try {
    const config = {
      oauth: {
        clientId: process.env.MP_CLIENT_ID,
        redirectUri: process.env.MP_REDIRECT_URI,
        clientSecretLength: process.env.MP_CLIENT_SECRET?.length,
        hasAllConfig: !!(process.env.MP_CLIENT_ID && process.env.MP_CLIENT_SECRET && process.env.MP_REDIRECT_URI)
      },
      suggestedActions: [
        "1. Verificar que OAuth esté ACTIVADO en el dashboard de MP",
        "2. Verificar que la Redirect URI sea EXACTAMENTE: https://gestiongastos.loca.lt/api/mercado-pago/callback",
        "3. Verificar que no haya espacios extras en la Redirect URI",
        "4. Intentar con credenciales de TEST (MP_CLIENT_SECRET=TEST)"
      ]
    };

    return res.status(200).json({
      success: true,
      message: "Verificación de configuración OAuth",
      data: config
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

async function connectDirectly(req: Request, res: Response) {
  try {
    const firebaseUser = (req as any).firebaseUser;
    
    if (!firebaseUser || !firebaseUser.uid) {
      return res.status(401).json({
        success: false,
        message: "Usuario no autenticado",
      });
    }

    const userId = firebaseUser.uid;

    // Hacer la request directa a MP
    const tokenResponse = await fetch('https://api.mercadopago.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_secret: process.env.MP_CLIENT_SECRET,
        client_id: process.env.MP_CLIENT_ID,
        grant_type: 'client_credentials',
        test_token: 'false'
      })
    });
    
    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error('❌ Error en conexión directa:', tokenData);
      throw new Error(tokenData.error_description || tokenData.message || `Error HTTP ${tokenResponse.status}`);
    }

    // Validar respuesta
    if (!tokenData.access_token) {
      throw new Error('No se recibió access_token en la respuesta');
    }

    // Buscar y actualizar usuario
    const user = await em.findOne(User, { id: userId });
    if (!user) {
      throw new Error('Usuario no encontrado en la base de datos');
    }

    // Actualizar tokens en el usuario
    user.updateMercadoPagoTokens(
      tokenData.access_token,
      tokenData.refresh_token, 
      tokenData.expires_in || 21600,
      tokenData.user_id
    );

    await em.flush();
    console.log('Tokens guardados en base de datos');

    return res.status(200).json({
      success: true,
      message: "Cuenta de Mercado Pago conectada exitosamente",
      data: { 
        connected: true,
        accessToken: tokenData.access_token.substring(0, 20) + '...', 
        tokenType: tokenData.token_type,
        expiresIn: tokenData.expires_in,
        scope: tokenData.scope
      }
    });

  } catch (error: any) {
    console.error('❌ Error en conexión directa:', error);
    return res.status(500).json({
      success: false,
      message: error.message,
      data: { connected: false }
    });
  }
}

// Función para verificar el token y obtener información del usuario
async function verifyToken(req: Request, res: Response) {
  try {
    const firebaseUser = (req as any).firebaseUser;
    const userId = firebaseUser.uid;

    const user = await em.findOne(User, { id: userId });
    if (!user || !user.mpAccessToken) {
      return res.status(400).json({
        success: false,
        message: "Usuario no tiene token de MP",
      });
    }

    const response = await fetch('https://api.mercadopago.com/users/me', {
      headers: {
        'Authorization': `Bearer ${user.mpAccessToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Token validation failed:', errorData);
      
      return res.status(400).json({
        success: false,
        message: `Token inválido: ${errorData.message || response.statusText}`,
        data: errorData
      });
    }

    const userInfo = await response.json();

    return res.status(200).json({
      success: true,
      message: "Token válido",
      data: {
        mpUserId: userInfo.id,
        email: userInfo.email,
        firstName: userInfo.first_name,
        lastName: userInfo.last_name,
        country: userInfo.country_id,
        site: userInfo.site_id
      }
    });

  } catch (error: any) {
    console.error('❌ Token verification error:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

function formatDateForMP(date: Date): string {
  // FORZAR 2024 temporalmente para probar
  const correctedDate = new Date(date);
  correctedDate.setFullYear(2024); // ← Forzar año 2024
  
  const year = correctedDate.getFullYear();
  const month = String(correctedDate.getMonth() + 1).padStart(2, '0');
  const day = String(correctedDate.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}


async function testPayments(req: Request, res: Response) {
  try {
    const firebaseUser = (req as any).firebaseUser;
    const userId = firebaseUser.uid;

    const user = await em.findOne(User, { id: userId });
    if (!user || !user.mpAccessToken) {
      return res.status(400).json({
        success: false,
        message: "Usuario no tiene token de MP",
      });
    }
    
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    // Formatear fechas correctamente
    const fromDate = formatDateForMP(thirtyDaysAgo);
    const toDate = formatDateForMP(today);
    
    // URL con fechas reales
    const testUrl = `https://api.mercadopago.com/v1/payments/search?range=date_created&begin_date=${fromDate}&end_date=${toDate}&sort=date_created&criteria=desc&limit=10`;

    const response = await fetch(testUrl, {
      headers: {
        'Authorization': `Bearer ${user.mpAccessToken}`,
        'Content-Type': 'application/json'
      }
    });

    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Payments test failed:', errorData);
      
      return res.status(400).json({
        success: false,
        message: `Error en pagos: ${errorData.message || response.statusText}`,
        data: errorData
      });
    }

    const paymentsData = await response.json();

    return res.status(200).json({
      success: true,
      message: "Test de pagos exitoso",
      data: {
        paymentsCount: paymentsData.results?.length || 0,
        total: paymentsData.paging?.total,
        sample: paymentsData.results?.slice(0, 3),

        dateRange: {
          from: fromDate,
          to: toDate,
          days: 30
        }
      }
    });

  } catch (error: any) {
    console.error('❌ Payments test error:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
}
export {
  initiateOAuth,
  oauthCallback,
  syncMovements,
  getConnectionStatus,
  debugConfig, verifyOAuthConfig, connectDirectly, verifyToken,
  testPayments
};