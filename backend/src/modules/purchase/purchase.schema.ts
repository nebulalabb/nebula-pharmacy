import { z } from 'zod';

/**
 * Create Purchase Order Schema
 */
export const createPurchaseSchema = z.object({
  body: z.object({
    supplierId: z.string().uuid('Invalid Supplier ID'),
    note: z.string().optional(),
    items: z.array(z.object({
      productId: z.string().uuid('Invalid Product ID'),
      lotNumber: z.string().min(1, 'Lot number is required'),
      expiryDate: z.string().transform((val) => new Date(val)), 
      quantity: z.number().int().min(1, 'Quantity must be at least 1'),
      unitCost: z.number().min(0, 'Unit cost must be positive'),
    })).min(1, 'At least one item is required'),
  }),
});

export type CreatePurchaseInput = z.infer<typeof createPurchaseSchema>['body'];
