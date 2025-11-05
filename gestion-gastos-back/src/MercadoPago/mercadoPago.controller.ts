// mercadoPago.controller.ts
import { Request, Response, NextFunction } from "express";
import { orm } from "../shared/db/orm.js";
import { User } from "../User/user.entity.js";
import { Operation } from "../Operation/operation.entity.js";
import { Wallet } from "../Wallet/wallet.entity.js";
import { Category } from "../Category/category.entity.js";
import { generatePKCE, getCodeVerifier, deleteCodeVerifier } from '../utils/pkce.utils.js';

const em = orm.em;

async function initiateOAuth(req: Request, res: Response) {
  try {
    const firebaseUser = (req as any).firebaseUser;
    const userId = firebaseUser.uid;

    // Generar PKCE (ya lo tienes bien)
    const { codeVerifier, codeChallenge } = generatePKCE(userId);

    // Construir URL de autorización con PKCE
    const authUrl = new URL('https://auth.mercadopago.com/authorization');
    authUrl.searchParams.append('client_id', process.env.MP_CLIENT_ID!);
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('platform_id', 'mp');
    authUrl.searchParams.append('state', userId);
    authUrl.searchParams.append('redirect_uri', process.env.MP_REDIRECT_URI!);
    authUrl.searchParams.append('code_challenge', codeChallenge);
    authUrl.searchParams.append('code_challenge_method', 'S256');

    console.log('🔵 === OAUTH CON PKCE ===');
    console.log('🔵 User ID:', userId);
    console.log('🔵 Code Verifier:', codeVerifier); // Solo para debug
    console.log('🔵 Code Challenge:', codeChallenge);
    console.log('🔵 Auth URL:', authUrl.toString());

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
    console.log('🔵 OAuth Callback - INICIO');
    const { code, state: userId } = req.query;

    console.log('🟡 Datos recibidos:', { code, userId });

    if (!code || !userId) {
      console.error('❌ Faltan parámetros:', { code, userId });
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/configuracion?mp_error=missing_parameters`);
    }

    // Obtener el code_verifier usando el userId
    const codeVerifier = getCodeVerifier(userId as string);
    
    if (!codeVerifier) {
      console.error('❌ No se encontró code_verifier para userId:', userId);
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/configuracion?mp_error=session_expired`);
    }

    console.log('🟡 Code Verifier encontrado:', codeVerifier);

    // Hacer el token exchange CON PKCE
    const tokenBody = new URLSearchParams();
    tokenBody.append('grant_type', 'authorization_code');
    tokenBody.append('client_id', process.env.MP_CLIENT_ID!);
    tokenBody.append('client_secret', process.env.MP_CLIENT_SECRET!);
    tokenBody.append('code', code as string);
    tokenBody.append('redirect_uri', process.env.MP_REDIRECT_URI!);
    tokenBody.append('code_verifier', codeVerifier);

    console.log('🟡 Enviando token request con PKCE...');
    console.log('🟡 Client ID:', process.env.MP_CLIENT_ID);
    console.log('🟡 Redirect URI:', process.env.MP_REDIRECT_URI);
    console.log('🟡 Code length:', (code as string).length);
    console.log('🟡 Code Verifier length:', codeVerifier.length);

    const tokenResponse = await fetch('https://api.mercadopago.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: tokenBody
    });

    console.log('🟡 Status:', tokenResponse.status);
    console.log('🟡 Headers:', Object.fromEntries(tokenResponse.headers.entries()));
    
    const tokenData = await tokenResponse.json();
    console.log('🟡 Respuesta completa:', JSON.stringify(tokenData, null, 2));

    if (!tokenResponse.ok) {
      console.error('❌ Error en token exchange:', tokenData);
      
      // Limpiar el code_verifier en caso de error
      deleteCodeVerifier(userId as string);
      
      throw new Error(tokenData.error_description || tokenData.message || `Error ${tokenResponse.status}`);
    }

    // Si llegamos aquí, ¡funcionó! Limpiar el code_verifier
    deleteCodeVerifier(userId as string);

    console.log('✅ Token exchange EXITOSO con PKCE');
    console.log('✅ Access Token:', tokenData.access_token?.substring(0, 20) + '...');
    console.log('✅ Refresh Token:', tokenData.refresh_token?.substring(0, 20) + '...');
    console.log('✅ User ID MP:', tokenData.user_id);

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
    console.log('✅ Tokens guardados exitosamente');

    return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/configuracion?mp_success=true`);

  } catch (error: any) {
    console.error('❌ OAuth callback error:', error);
    
    // Limpiar code_verifier en caso de error
    if (req.query.state) {
      deleteCodeVerifier(req.query.state as string);
    }
    
    return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/configuracion?mp_error=${encodeURIComponent(error.message)}`);
  }
}

async function syncMovements(req: Request, res: Response) {
  try {
    const firebaseUser = (req as any).firebaseUser;
    const userId = firebaseUser.uid;

    console.log('🔵 === INICIANDO SINCRONIZACIÓN ===');
    console.log('🔵 User ID:', userId);

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

    console.log('🟡 Token válido, expira:', user.mpTokenExpiresAt);

    // Obtener movimientos de Mercado Pago
    console.log('🟡 Obteniendo movimientos de MP...');
    const movements = await fetchMovementsFromMP(user.mpAccessToken!);
    
    console.log('✅ Movimientos obtenidos:', movements?.length || 0);

    // Procesar y guardar movimientos
    const savedMovements = await processAndSaveMovements(userId, movements);

    // Marcar última sincronización
    user.markLastSync();
    await em.flush();

    console.log('✅ Sincronización completada exitosamente');

    return res.status(200).json({
      success: true,
      message: "Movimientos sincronizados exitosamente",
      data: {
        imported: savedMovements.length,
        movements: savedMovements,
        lastSyncAt: user.lastSyncAt,
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

    // Usar el método helper
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
    // ✅ URL CORRECTA - Sin parámetros de fecha
    const url = `https://api.mercadopago.com/v1/payments/search?sort=date_created&criteria=desc&limit=100`;
    
    console.log('🟡 === FETCHING MOVEMENTS FROM MP ===');
    console.log('🟡 URL:', url);
    console.log('🟡 Access Token:', accessToken.substring(0, 20) + '...');
    console.log('🟡 Nota: MP devuelve automáticamente últimos 12 meses');

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('🟡 Response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Error response:', errorData);
      throw new Error(`Error al obtener movimientos: ${errorData.message || response.statusText}`);
    }

    const data = await response.json();
    console.log('🟡 Response data:', {
      resultsCount: data.results?.length || 0,
      total: data.paging?.total
    });

    // ✅ Filtrar solo pagos aprobados/completados
    const filteredResults = (data.results || []).filter((payment:any) => 
      payment.status === 'approved' || payment.status === 'completed'
    );

    console.log('🟡 Pagos filtrados (aprobados/completados):', filteredResults.length);

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

  for (const payment of mpMovements) {
    try {
      // Verificar si el pago ya existe
      if (payment.id) {
        const existingOperation = await em.findOne(Operation, {
          user: { id: userId },
          externalId: payment.id.toString()
        });

        if (existingOperation) {
          console.log(`Pago ${payment.id} ya existe, omitiendo`);
          continue;
        }
      }

      // Determinar tipo y monto
      const amount = Math.abs(payment.transaction_amount || payment.amount || 0);
      const type = (payment.transaction_amount > 0 || payment.amount > 0) ? 'income' : 'expense';

      // Crear descripción
      const description = payment.description || 
                         payment.payment_method_id || 
                         payment.title ||
                         'Pago Mercado Pago';

      // Crear operation
      const operation = em.create(Operation, {
        amount: amount,
        description: description,
        date: new Date(payment.date_created || payment.date_approved || payment.created_date),
        type: type,
        wallet: defaultWallet,
        category: defaultCategory,
        user: user,
        externalId: payment.id?.toString(),
        syncSource: 'mercado_pago',
        paymentMethod: payment.payment_method_id,
        status: payment.status
      });

      await em.persistAndFlush(operation);
      
      savedOperations.push({
        id: operation.id,
        amount: operation.amount,
        description: operation.description,
        type: operation.type,
        date: operation.date,
        externalId: operation.externalId
      });

      console.log(`✅ Pago importado: ${description} - $${amount} (${type})`);

    } catch (error) {
      console.error(`Error procesando pago ${payment.id}:`, error);
    }
  }

  return savedOperations;
}

// En mercadoPago.controller.ts - agregar esta función
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

    console.log('🔧 Configuración MP:', config);

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

// En mercadoPago.controller.ts
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

    console.log('🔍 Verificación OAuth:', config);

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

// En mercadoPago.controller.ts - agregar esta función
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

    console.log('🔵 === CONEXIÓN DIRECTA CON client_credentials ===');
    console.log('🔵 User ID:', userId);
    console.log('🔵 Client ID:', process.env.MP_CLIENT_ID);
    console.log('🔵 Client Secret length:', process.env.MP_CLIENT_SECRET?.length);

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

    console.log('🟡 Status response:', tokenResponse.status);
    console.log('🟡 Response headers:', Object.fromEntries(tokenResponse.headers.entries()));
    
    const tokenData = await tokenResponse.json();
    console.log('🟡 Response data:', JSON.stringify(tokenData, null, 2));

    if (!tokenResponse.ok) {
      console.error('❌ Error en conexión directa:', tokenData);
      throw new Error(tokenData.error_description || tokenData.message || `Error HTTP ${tokenResponse.status}`);
    }

    // Validar respuesta
    if (!tokenData.access_token) {
      throw new Error('No se recibió access_token en la respuesta');
    }

    console.log('✅ Conexión directa EXITOSA');
    console.log('✅ Access Token recibido:', tokenData.access_token.substring(0, 20) + '...');
    console.log('✅ Token type:', tokenData.token_type);
    console.log('✅ Expires in:', tokenData.expires_in);
    console.log('✅ Scope:', tokenData.scope);
    console.log('✅ User ID:', tokenData.user_id);

    // Buscar y actualizar usuario
    const user = await em.findOne(User, { id: userId });
    if (!user) {
      throw new Error('Usuario no encontrado en la base de datos');
    }

    // Actualizar tokens en el usuario
    user.updateMercadoPagoTokens(
      tokenData.access_token,
      tokenData.refresh_token, // Puede ser undefined en client_credentials
      tokenData.expires_in || 21600,
      tokenData.user_id
    );

    await em.flush();
    console.log('✅ Tokens guardados en base de datos');

    return res.status(200).json({
      success: true,
      message: "Cuenta de Mercado Pago conectada exitosamente",
      data: { 
        connected: true,
        accessToken: tokenData.access_token.substring(0, 20) + '...', // Solo para debug
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

    console.log('🔵 === VERIFICANDO TOKEN MP ===');
    console.log('🔵 Token:', user.mpAccessToken.substring(0, 20) + '...');

    // Probar el token obteniendo información del usuario
    const response = await fetch('https://api.mercadopago.com/users/me', {
      headers: {
        'Authorization': `Bearer ${user.mpAccessToken}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('🟡 Response status:', response.status);
    
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
    console.log('✅ User info obtenida:', userInfo);

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

// Función para probar obtener pagos específicamente
// En mercadoPago.controller.ts - REEMPLAZA la función formatDateForMP
function formatDateForMP(date: Date): string {
  // FORZAR 2024 temporalmente para probar
  const correctedDate = new Date(date);
  correctedDate.setFullYear(2024); // ← Forzar año 2024
  
  const year = correctedDate.getFullYear();
  const month = String(correctedDate.getMonth() + 1).padStart(2, '0');
  const day = String(correctedDate.getDate()).padStart(2, '0');
  
  console.log(`🟡 Fecha original: ${date.toISOString()}`);
  console.log(`🟡 Fecha corregida: ${year}-${month}-${day}`);
  
  return `${year}-${month}-${day}`;
}


// También actualiza la función testPayments para usar fechas reales del pasado
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

    console.log('🔵 === TESTEANDO ENDPOINT DE PAGOS ===');
    
    // ✅ USAR FECHAS REALES DEL PASADO - CORREGIDO
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    // Formatear fechas correctamente
    const fromDate = formatDateForMP(thirtyDaysAgo);
    const toDate = formatDateForMP(today);
    
    // URL con fechas reales
    const testUrl = `https://api.mercadopago.com/v1/payments/search?range=date_created&begin_date=${fromDate}&end_date=${toDate}&sort=date_created&criteria=desc&limit=10`;
    
    console.log('🟡 Test URL:', testUrl);
    console.log('🟡 From Date (corregido):', fromDate);
    console.log('🟡 To Date (corregido):', toDate);
    console.log('🟡 Token:', user.mpAccessToken.substring(0, 20) + '...');

    const response = await fetch(testUrl, {
      headers: {
        'Authorization': `Bearer ${user.mpAccessToken}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('🟡 Response status:', response.status);
    
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
    console.log('✅ Payments test successful:', {
      results: paymentsData.results?.length || 0,
      total: paymentsData.paging?.total
    });

    return res.status(200).json({
      success: true,
      message: "Test de pagos exitoso",
      data: {
        paymentsCount: paymentsData.results?.length || 0,
        total: paymentsData.paging?.total,
        sample: paymentsData.results?.slice(0, 3),
        // Para debug adicional
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