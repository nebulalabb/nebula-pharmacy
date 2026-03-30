import { Request, Response } from 'express';
import * as inventoryService from './inventory.service';
import { successResponse, errorResponse } from '../../utils/response';

/**
 * List all inventory batches
 */
export const getInventory = async (req: Request, res: Response) => {
  try {
    const batches = await inventoryService.listAllBatches();
    return successResponse(res, batches, 'Inventory batches listed successfully');
  } catch (error: any) {
    return errorResponse(res, 'Error listing inventory batches', 500, error.message);
  }
};

/**
 * Get expiring products
 */
export const getExpiringProducts = async (req: Request, res: Response) => {
  const days = Number(req.query.days) || 30;
  try {
    const batches = await inventoryService.getExpiringBatches(days);
    return successResponse(res, batches, `Products expiring within ${days} days`);
  } catch (error: any) {
    return errorResponse(res, 'Error fetching expiring products', 500, error.message);
  }
};

/**
 * Get low stock products
 */
export const getLowStockProducts = async (req: Request, res: Response) => {
  const threshold = Number(req.query.threshold) || 10;
  try {
    const batches = await inventoryService.getLowStockBatches(threshold);
    return successResponse(res, batches, `Products with stock below ${threshold}`);
  } catch (error: any) {
    return errorResponse(res, 'Error fetching low stock products', 500, error.message);
  }
};

/**
 * Get inventory for a specific product
 */
export const getInventoryByProduct = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  try {
    const batches = await inventoryService.getByProduct(id);
    return successResponse(res, batches, 'Product inventory fetched successfully');
  } catch (error: any) {
    return errorResponse(res, 'Error fetching product inventory', 500, error.message);
  }
};

/**
 * Create a new stock adjustment
 */
export const createAdjustment = async (req: Request, res: Response) => {
  const currentUserId = (req.user as any).id;
  try {
    const adjustment = await inventoryService.adjustStock(req.body, currentUserId);
    return successResponse(res, adjustment, 'Stock adjustment created successfully', 201);
  } catch (error: any) {
    return errorResponse(res, 'Error adjusting stock', 400, error.message);
  }
};

/**
 * List adjustment history
 */
export const getAdjustmentHistory = async (req: Request, res: Response) => {
  try {
    const history = await inventoryService.listAdjustments();
    return successResponse(res, history, 'Stock adjustment history fetched successfully');
  } catch (error: any) {
    return errorResponse(res, 'Error fetching adjustment history', 500, error.message);
  }
};
