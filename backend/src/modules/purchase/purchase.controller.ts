import { Request, Response } from 'express';
import * as purchaseService from './purchase.service';
import { successResponse, errorResponse } from '../../utils/response';

/**
 * List all purchase orders
 */
export const getAllPurchaseOrders = async (req: Request, res: Response) => {
  try {
    const orders = await purchaseService.listAll();
    return successResponse(res, orders, 'Purchase orders listed successfully');
  } catch (error: any) {
    return errorResponse(res, 'Error listing purchase orders', 500, error.message);
  }
};

/**
 * Get purchase order by ID
 */
export const getPurchaseOrderById = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  try {
    const order = await purchaseService.findById(id);
    if (!order) {
      return errorResponse(res, 'Purchase order not found', 404);
    }
    return successResponse(res, order, 'Purchase order fetched successfully');
  } catch (error: any) {
    return errorResponse(res, 'Error fetching purchase order', 500, error.message);
  }
};

/**
 * Create a new purchase order
 */
export const createPurchaseOrder = async (req: Request, res: Response) => {
  try {
    const order = await purchaseService.create(req.body);
    return successResponse(res, order, 'Purchase order created successfully', 201);
  } catch (error: any) {
    return errorResponse(res, 'Error creating purchase order', 500, error.message);
  }
};

/**
 * Cancel (Delete) purchase order
 */
export const deletePurchaseOrder = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  try {
    await purchaseService.cancel(id);
    return successResponse(res, null, 'Purchase order cancelled successfully');
  } catch (error: any) {
    // This could be logic error (insufficient stock) or general error
    return errorResponse(res, 'Error cancelling purchase order', 400, error.message);
  }
};
