import { z } from 'zod';

/**
 * Product Create Schema
 */
export const createProductSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Product name is required'),
    sku: z.string().optional(),
    barcode: z.string().optional(),
    registrationNo: z.string().optional(),
    activeIngredient: z.string().optional(),
    dosageForm: z.string().optional(),
    strength: z.string().optional(),
    specification: z.string().optional(),
    unit: z.string().min(1, 'Unit is required'),
    defaultCost: z.number().min(0).optional().default(0),
    salePrice: z.number().min(0),
    minStockLevel: z.number().int().min(0).optional().default(0),
    categoryId: z.string().uuid('Invalid Category ID').optional(),
    requiresLotTracking: z.boolean().optional().default(true),
  }),
});

/**
 * Product Update Schema
 */
export const updateProductSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    sku: z.string().optional(),
    barcode: z.string().optional(),
    registrationNo: z.string().optional(),
    activeIngredient: z.string().optional(),
    dosageForm: z.string().optional(),
    strength: z.string().optional(),
    specification: z.string().optional(),
    unit: z.string().optional(),
    defaultCost: z.number().min(0).optional(),
    salePrice: z.number().min(0).optional(),
    minStockLevel: z.number().int().min(0).optional(),
    categoryId: z.string().uuid().optional(),
    isActive: z.boolean().optional(),
    requiresLotTracking: z.boolean().optional(),
  }),
});

/**
 * Product Query Schema
 */
export const productQuerySchema = z.object({
  query: z.object({
    search: z.string().optional(),
    categoryId: z.string().optional(),
    isActive: z.enum(['true', 'false']).optional(),
    lowStock: z.enum(['true', 'false']).optional(),
    page: z.string().optional().default('1'),
    limit: z.string().optional().default('20'),
  }),
});

export type CreateProductInput = z.infer<typeof createProductSchema>['body'];
export type UpdateProductInput = z.infer<typeof updateProductSchema>['body'];
