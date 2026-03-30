import prisma from '../../config/database';

/**
 * Find user by email
 */
export const findByEmail = async (email: string) => {
  return prisma.user.findUnique({
    where: { email },
  });
};

/**
 * Update user password
 */
export const updatePassword = async (id: string, passwordHash: string) => {
  return prisma.user.update({
    where: { id },
    data: { passwordHash },
  });
};
