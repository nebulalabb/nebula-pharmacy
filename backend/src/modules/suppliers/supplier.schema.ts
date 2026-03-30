import { z } from 'zod';

/**
 * Create Supplier Schema
 */
export const createSupplierSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Supplier name is required').max(200),
    contactPerson: z.string().max(100).optional(),
    phone: z.string().max(20).optional(),
    address: z.string().optional(),
  }),
});

/**
 * Update Supplier Schema
 */
export const updateSupplierSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(200).optional(),
    contactPerson: z.string().max(100).optional(),
    phone: z.string().max(20).optional(),
    address: z.string().optional(),
    isActive: z.boolean().optional(),
  }),
});

export type CreateSupplierInput = z.infer<typeof createSupplierSchema>['body'];
export type UpdateSupplierInput = z.infer<typeof updateSupplierSchema>['body'];
