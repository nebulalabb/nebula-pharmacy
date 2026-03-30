import { Request, Response } from 'express';
import * as supplierService from './supplier.service';
import { successResponse, errorResponse } from '../../utils/response';

/**
 * List all suppliers
 */
export const getAllSuppliers = async (req: Request, res: Response) => {
  try {
    const suppliers = await supplierService.listAll();
    return successResponse(res, suppliers, 'Suppliers listed successfully');
  } catch (error: any) {
    return errorResponse(res, 'Error listing suppliers', 500, error.message);
  }
};

/**
 * Get supplier by ID
 */
export const getSupplierById = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  try {
    const supplier = await supplierService.findById(id);
    if (!supplier) {
      return errorResponse(res, 'Supplier not found', 404);
    }
    return successResponse(res, supplier, 'Supplier fetched successfully');
  } catch (error: any) {
    return errorResponse(res, 'Error fetching supplier', 500, error.message);
  }
};

/**
 * Create a new supplier
 */
export const createSupplier = async (req: Request, res: Response) => {
  try {
    const supplier = await supplierService.create(req.body);
    return successResponse(res, supplier, 'Supplier created successfully', 201);
  } catch (error: any) {
    return errorResponse(res, 'Error creating supplier', 500, error.message);
  }
};

/**
 * Update a supplier
 */
export const updateSupplier = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  try {
    const supplier = await supplierService.update(id, req.body);
    return successResponse(res, supplier, 'Supplier updated successfully');
  } catch (error: any) {
    return errorResponse(res, 'Error updating supplier', 500, error.message);
  }
};

/**
 * Disable a supplier (Soft Delete)
 */
export const disableSupplier = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  try {
    await supplierService.softDelete(id);
    return successResponse(res, null, 'Supplier disabled successfully');
  } catch (error: any) {
    return errorResponse(res, 'Error disabling supplier', 500, error.message);
  }
};
