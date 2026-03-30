import { Request, Response } from 'express';
import * as salesService from './sales.service';
import { successResponse, errorResponse } from '../../utils/response';

/**
 * List all sales orders
 */
export const getAllSalesOrders = async (req: Request, res: Response) => {
  try {
    const orders = await salesService.listAll();
    return successResponse(res, orders, 'Sales history listed successfully');
  } catch (error: any) {
    return errorResponse(res, 'Error listing sales history', 500, error.message);
  }
};

/**
 * Get sales order by ID
 */
export const getSalesOrderById = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  try {
    const order = await salesService.findById(id);
    if (!order) {
      return errorResponse(res, 'Sales order not found', 404);
    }
    return successResponse(res, order, 'Sales order fetched successfully');
  } catch (error: any) {
    return errorResponse(res, 'Error fetching sales order', 500, error.message);
  }
};

/**
 * Create a new sales order (POS)
 */
export const createSalesOrder = async (req: Request, res: Response) => {
  const cashierId = (req.user as any).id;
  try {
    const order = await salesService.create(req.body, cashierId);
    return successResponse(res, order, 'Order created successfully. Stock updated.', 201);
  } catch (error: any) {
    // Handle business logic errors (like insufficient stock) with 400 status
    return errorResponse(res, 'Error creating sales order', 400, error.message);
  }
};
