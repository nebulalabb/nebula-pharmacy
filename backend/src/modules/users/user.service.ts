import prisma from '../../config/database';
import { CreateUserInput, UpdateUserInput } from './user.schema';

/**
 * List all users
 */
export const listAll = async () => {
  return prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};

/**
 * Find user by ID
 */
export const findById = async (id: string) => {
  return prisma.user.findUnique({
    where: { id },
  });
};

/**
 * Create a new user
 */
export const create = async (data: Omit<CreateUserInput, 'password'> & { passwordHash: string }) => {
  return prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      passwordHash: data.passwordHash,
      role: data.role,
    },
  });
};

/**
 * Update user information
 */
export const update = async (id: string, data: UpdateUserInput) => {
  return prisma.user.update({
    where: { id },
    data,
  });
};

/**
 * Soft delete (Disable) user
 */
export const softDelete = async (id: string) => {
  return prisma.user.update({
    where: { id },
    data: { isActive: false },
  });
};
