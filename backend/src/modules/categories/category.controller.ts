import { Request, Response } from 'express';
import * as categoryService from './category.service';
import { successResponse, errorResponse } from '../../utils/response';

/**
 * List all categories
 */
export const getAllCategories = async (req: Request, res: Response) => {
  try {
    const categories = await categoryService.listAll();
    return successResponse(res, categories, 'Categories listed successfully');
  } catch (error: any) {
    return errorResponse(res, 'Error listing categories', 500, error.message);
  }
};

/**
 * Create a new category
 */
export const createCategory = async (req: Request, res: Response) => {
  try {
    const category = await categoryService.create(req.body);
    return successResponse(res, category, 'Category created successfully', 201);
  } catch (error: any) {
    // Handle unique constraint (name)
    if (error.code === 'P2002') {
      return errorResponse(res, 'Category name already exists', 400);
    }
    return errorResponse(res, 'Error creating category', 500, error.message);
  }
};

/**
 * Update a category
 */
export const updateCategory = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  try {
    const category = await categoryService.update(id, req.body);
    return successResponse(res, category, 'Category updated successfully');
  } catch (error: any) {
    return errorResponse(res, 'Error updating category', 500, error.message);
  }
};

/**
 * Delete a category
 */
export const deleteCategory = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  try {
    await categoryService.remove(id);
    return successResponse(res, null, 'Category deleted successfully');
  } catch (error: any) {
    return errorResponse(res, 'Error deleting category', 500, error.message);
  }
};
