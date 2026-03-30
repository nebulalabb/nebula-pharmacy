import { z } from 'zod';
import { AdjustmentType } from '@prisma/client';

/**
 * Stock Adjustment Schema
 */
export const stockAdjustmentSchema = z.object({
  body: z.object({
    productId: z.string().uuid('Invalid Product ID'),
    batchId: z.string().uuid('Invalid Batch ID').optional(),
    type: z.nativeEnum(AdjustmentType), // INCREASE or DECREASE
    quantity: z.number().int().min(1, 'Quantity must be at least 1'),
    reason: z.string().optional(),
  }),
});

/**
 * Expiry Warning Query Schema
 */
export const expiryQuerySchema = z.object({
  query: z.object({
    days: z.string().optional().default('30'),
  }),
});

/**
 * Low Stock Query Schema
 */
export const lowStockQuerySchema = z.object({
  query: z.object({
    threshold: z.string().optional().default('10'),
  }),
});

export type StockAdjustmentInput = z.infer<typeof stockAdjustmentSchema>['body'];
