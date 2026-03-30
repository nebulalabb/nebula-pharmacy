import prisma from '../../config/database';
import { CreateSupplierInput, UpdateSupplierInput } from './supplier.schema';

/**
 * List all suppliers
 */
export const listAll = async () => {
  return prisma.supplier.findMany({
    orderBy: { name: 'asc' },
  });
};

/**
 * Find supplier by ID
 */
export const findById = async (id: string) => {
  return prisma.supplier.findUnique({
    where: { id },
  });
};

/**
 * Create a new supplier
 */
export const create = async (data: CreateSupplierInput) => {
  return prisma.supplier.create({
    data,
  });
};

/**
 * Update a supplier
 */
export const update = async (id: string, data: UpdateSupplierInput) => {
  return prisma.supplier.update({
    where: { id },
    data,
  });
};

/**
 * Soft delete (Disable) a supplier
 */
export const softDelete = async (id: string) => {
  return prisma.supplier.update({
    where: { id },
    data: { isActive: false },
  });
};
