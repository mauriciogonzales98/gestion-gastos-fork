// export class MercadoPagoService {
  
//   public async syncUserMovements(userId: string) {
//     try {
//       // 1. Obtener tokens del usuario desde tu DB
//       const userTokens = await this.getUserTokens(userId);
      
//       if (!userTokens) {
//         throw new Error('User not connected to Mercado Pago');
//       }

//       // 2. Obtener movimientos de Mercado Pago
//       const movements = await this.fetchMovements(userTokens.mp_access_token);
      
//       // 3. Procesar y guardar en tu base de datos
//       const savedMovements = await this.processAndSaveMovements(userId, movements);
      
//       return savedMovements;
      
//     } catch (error) {
//       console.error('Sync error:', error);
//       throw error;
//     }
//   }

//   private async fetchMovements(accessToken: string) {
//     const today = new Date();
//     const thirtyDaysAgo = new Date(today.setDate(today.getDate() - 30));
    
//     const response = await fetch(`https://api.mercadopago.com/v1/payments/search?date_created.from=${thirtyDaysAgo.toISOString()}&sort=date_created&criteria=desc`, {
//       headers: {
//         'Authorization': `Bearer ${accessToken}`
//       }
//     });

//     if (!response.ok) {
//       throw new Error('Failed to fetch movements');
//     }

//     return await response.json();
//   }

//   private async processAndSaveMovements(userId: string, mpMovements: any) {
//     const processedMovements = [];
    
//     for (const movement of mpMovements.results) {
//       // Mapear movimiento de MP a tu esquema
//       const processedMovement = {
//         user_id: userId,
//         external_id: movement.id,
//         amount: movement.transaction_amount,
//         type: movement.transaction_amount > 0 ? 'income' : 'expense',
//         description: movement.description || 'Movimiento MP',
//         category: this.mapMPCategory(movement),
//         date: new Date(movement.date_created),
//         payment_method: movement.payment_method_id,
//         status: movement.status,
//         sync_source: 'mercado_pago'
//       };
      
//       // Guardar en tu base de datos
//       const saved = await this.saveMovement(processedMovement);
//       processedMovements.push(saved);
//     }
    
//     return processedMovements;
//   }

//   private mapMPCategory(movement: any): string {
//     // Mapear categorías de MP a tus categorías
//     const categoryMap: { [key: string]: string } = {
//       'account_funding': 'income',
//       'payment': 'expense',
//       'transfer': 'transfer',
//       'withdrawal': 'withdrawal'
//     };
    
//     return categoryMap[movement.payment_type_id] || 'other';
//   }
// }