// mercadoPago.routes.ts
import { Router } from 'express';
import { 
  initiateOAuth, 
  oauthCallback, 
  syncMovements, 
  getConnectionStatus,
  debugConfig,
  verifyOAuthConfig, 
  connectDirectly, 
  verifyToken, 
  testPayments 
} from './mercadoPago.controller.js';
import firebaseAuthMiddleware from '../Firebase/FirebaseAdmin/firebaseAuthMiddleware.js';

export const mercadoPagoRouter = Router();

// Rutas existentes (mantén estas para compatibilidad)
mercadoPagoRouter.get('/auth/initiate', firebaseAuthMiddleware, initiateOAuth as any);
mercadoPagoRouter.get('/callback', oauthCallback as any);
mercadoPagoRouter.post('/sync', firebaseAuthMiddleware, syncMovements as any);
mercadoPagoRouter.get('/status', firebaseAuthMiddleware, getConnectionStatus as any);
mercadoPagoRouter.get('/debug', debugConfig as any);
mercadoPagoRouter.get('/verify-oauth', verifyOAuthConfig as any);
mercadoPagoRouter.post('/connect-direct', firebaseAuthMiddleware, connectDirectly as any);

// NUEVAS RUTAS - Agrega estas para que coincidan con el frontend
mercadoPagoRouter.get('/initiate-oauth', firebaseAuthMiddleware, initiateOAuth as any);
mercadoPagoRouter.post('/sync-movements', firebaseAuthMiddleware, syncMovements as any);
mercadoPagoRouter.get('/connection-status', firebaseAuthMiddleware, getConnectionStatus as any);
mercadoPagoRouter.post('/connect-directly', firebaseAuthMiddleware, connectDirectly as any);
mercadoPagoRouter.get('/verify-token', firebaseAuthMiddleware, verifyToken as any);
mercadoPagoRouter.get('/test-payments', firebaseAuthMiddleware, testPayments as any);

// Ruta para listar endpoints disponibles
mercadoPagoRouter.get('/list-endpoints', (req, res) => {
  const baseUrl = `${req.protocol}://${req.get('host')}/api/mercado-pago`;
  
  const endpoints = [
    { method: 'GET', path: '/initiate-oauth', description: 'Inicia flujo OAuth' },
    { method: 'GET', path: '/auth/initiate', description: 'Inicia flujo OAuth (alternativa)' },
    { method: 'GET', path: '/connection-status', description: 'Estado de conexión' },
    { method: 'GET', path: '/status', description: 'Estado de conexión (alternativa)' },
    { method: 'POST', path: '/sync-movements', description: 'Sincroniza movimientos' },
    { method: 'POST', path: '/sync', description: 'Sincroniza movimientos (alternativa)' },
    { method: 'POST', path: '/connect-directly', description: 'Conexión directa' },
    { method: 'POST', path: '/connect-direct', description: 'Conexión directa (alternativa)' },
    { method: 'GET', path: '/verify-token', description: 'Verifica token MP' },
    { method: 'GET', path: '/test-payments', description: 'Prueba endpoint pagos' },
    { method: 'GET', path: '/debug', description: 'Configuración debug' },
    { method: 'GET', path: '/verify-oauth', description: 'Verifica OAuth' },
    { method: 'GET', path: '/callback', description: 'Callback OAuth' },
    { method: 'GET', path: '/list-endpoints', description: 'Lista endpoints' }
  ];

  res.json({
    success: true,
    message: "Endpoints disponibles",
    data: {
      baseUrl,
      endpoints
    }
  });
});