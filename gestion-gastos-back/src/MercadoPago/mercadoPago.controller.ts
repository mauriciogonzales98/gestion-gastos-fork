import { Request, Response } from 'express';
import { MercadoPagoImportService } from '../Services/mercadoPagoImport.service.js';

const importService = new MercadoPagoImportService();

// Test connection
export const testConnection = async (req: Request, res: Response) => {
  try {
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const result = await importService.importMovements(startDate, endDate);
    
    res.json({
      success: true,
      connection: 'OK',
      testData: result
    });

  } catch (error: any) {
    res.status(500).json({
      success: false,
      connection: 'FAILED',
      error: error.message
    });
  }
};

// Import movements
export const importMovements = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.body;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        error: 'startDate and endDate are required'
      });
    }

    const result = await importService.importMovements(startDate, endDate);
    
    res.status(result.success ? 200 : 400).json(result);

  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get import history
export const getImportHistory = async (req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      data: []
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};