import prisma from '../../config/database';
import { CategoryInput } from './category.schema';

/**
 * List all categories
 */
export const listAll = async () => {
  return prisma.category.findMany({
    orderBy: { name: 'asc' },
  });
};

/**
 * Create a new category
 */
export const create = async (data: CategoryInput) => {
  return prisma.category.create({
    data,
  });
};

/**
 * Update a category
 */
export const update = async (id: string, data: CategoryInput) => {
  return prisma.category.update({
    where: { id },
    data,
  });
};

/**
 * Delete a category
 */
export const remove = async (id: string) => {
  return prisma.category.delete({
    where: { id },
  });
};
