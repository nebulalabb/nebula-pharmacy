import { Request, Response } from 'express';
import * as productsService from './products.service';
import { successResponse, errorResponse } from '../../utils/response';

/**
 * List all products
 */
export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const products = await productsService.listAll(req.query);
    return successResponse(res, products, 'Products listed successfully');
  } catch (error: any) {
    return errorResponse(res, 'Error listing products', 500, error.message);
  }
};

/**
 * Get product by ID
 */
export const getProductById = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  try {
    const product = await productsService.findById(id);
    if (!product) {
      return errorResponse(res, 'Product not found', 404);
    }
    return successResponse(res, product, 'Product fetched successfully');
  } catch (error: any) {
    return errorResponse(res, 'Error fetching product', 500, error.message);
  }
};

/**
 * Get product by Barcode
 */
export const getProductByBarcode = async (req: Request, res: Response) => {
  const barcode = req.params.barcode as string;
  try {
    const product = await productsService.findByBarcode(barcode);
    if (!product) {
      return errorResponse(res, 'Product with this barcode not found', 404);
    }
    return successResponse(res, product, 'Product fetched successfully');
  } catch (error: any) {
    return errorResponse(res, 'Error fetching product by barcode', 500, error.message);
  }
};

/**
 * Create a new product
 */
export const createProduct = async (req: Request, res: Response) => {
  try {
    const product = await productsService.create(req.body);
    return successResponse(res, product, 'Product created successfully', 201);
  } catch (error: any) {
    // Handle unique constraints (SKU, Barcode)
    if (error.code === 'P2002') {
      return errorResponse(res, 'Product with this SKU or Barcode already exists', 400);
    }
    return errorResponse(res, 'Error creating product', 500, error.message);
  }
};

/**
 * Update a product
 */
export const updateProduct = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  try {
    const product = await productsService.update(id, req.body);
    return successResponse(res, product, 'Product updated successfully');
  } catch (error: any) {
    return errorResponse(res, 'Error updating product', 500, error.message);
  }
};

/**
 * Disable a product (Soft Delete)
 */
export const deleteProduct = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  try {
    await productsService.softDelete(id);
    return successResponse(res, null, 'Product deactivated successfully');
  } catch (error: any) {
    return errorResponse(res, 'Error deactivating product', 500, error.message);
  }
};
