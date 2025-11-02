import { MercadoPagoConfig, Payment } from 'mercadopago';
import 'dotenv/config';

export class MercadoPagoImportService {
  private client: MercadoPagoConfig;
  private payment: Payment;

  // constructor() {
  //   this.client = new MercadoPagoConfig({ 
  //     accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN! 
  //   });
  //   this.payment = new Payment(this.client);
  // }

  constructor() {
    const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
    
    // Debug: verificar que el token existe
    console.log('Mercado Pago Access Token:', accessToken ? '✅ Presente' : '❌ Faltante');
    if (!accessToken) {
      console.error('❌ MERCADO_PAGO_ACCESS_TOKEN no está definido en las variables de entorno');
    }

    this.client = new MercadoPagoConfig({ 
      accessToken: accessToken!
    });
    this.payment = new Payment(this.client);

    console.log('🔧 Cliente Mercado Pago configurado');
  }

  async importMovements(startDate: string, endDate: string) {
    try {
      console.log('Buscando movimientos desde', startDate, 'hasta', endDate);

      const paymentsResponse = await this.payment.search({
        options: {
          date_created_from: `${startDate}T00:00:00.000-00:00`,
          date_created_to: `${endDate}T23:59:59.000-00:00`,
          sort: 'date_created',
          criteria: 'desc'
        }
      });

      const payments = paymentsResponse.results || [];
      console.log(`Encontrados ${payments.length} pagos`);

      // Usar tipo any para evitar problemas de tipos
      const movements = payments.map((payment: any) => ({
        externalId: `mp_${payment.id}`,
        type: (payment.operation_type === 'money_in' || payment.payment_type_id === 'account_money') ? 'income' : 'expense',
        amount: Math.abs(payment.transaction_amount || 0),
        description: payment.description || 'Movimiento Mercado Pago',
        date: new Date(payment.date_created),
        category: this.mapCategory(payment),
        paymentMethod: this.getPaymentMethod(payment),
        status: payment.status || 'unknown'
      }));

      return {
        success: true,
        data: movements,
        summary: {
          total: movements.length,
          incomes: movements.filter((m: any) => m.type === 'income').length,
          expenses: movements.filter((m: any) => m.type === 'expense').length
        }
      };

    } catch (error: any) {
      console.error('Error importing from Mercado Pago:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  private mapCategory(payment: any): string {
    const defaultCategories: { [key: string]: string } = {
      'credit_card': 'Compras',
      'debit_card': 'Compras', 
      'account_money': 'Transferencia',
      'ticket': 'Pago en efectivo',
      'bank_transfer': 'Transferencia bancaria'
    };
    
    return defaultCategories[payment.payment_type_id] || 'Otros';
  }

  private getPaymentMethod(payment: any): string {
    const methods: { [key: string]: string } = {
      'credit_card': 'Tarjeta de crédito',
      'debit_card': 'Tarjeta de débito',
      'account_money': 'Saldo MP',
      'ticket': 'Efectivo',
      'bank_transfer': 'Transferencia'
    };
    
    return methods[payment.payment_type_id] || 'Mercado Pago';
  }
}