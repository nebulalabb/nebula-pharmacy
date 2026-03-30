import { z } from 'zod';

/**
 * Create/Update Category Schema
 */
export const categorySchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Category name is required').max(100),
  }),
});

export type CategoryInput = z.infer<typeof categorySchema>['body'];
