import { z } from 'zod';
import { PaymentMethod } from '@prisma/client';

/**
 * Create Sales Order Schema (POS)
 */
export const createSalesOrderSchema = z.object({
  body: z.object({
    items: z.array(z.object({
      productId: z.string().uuid('Invalid Product ID'),
      quantity: z.number().int().min(1, 'Quantity must be at least 1'),
    })).min(1, 'At least one item is required'),
    discount: z.number().min(0).optional().default(0),
    paymentMethod: z.nativeEnum(PaymentMethod).default(PaymentMethod.CASH),
    note: z.string().optional(),
  }),
});

export type CreateSalesOrderInput = z.infer<typeof createSalesOrderSchema>['body'];
