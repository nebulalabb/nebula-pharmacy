import prisma from '../../config/database';
import { CreateProductInput, UpdateProductInput } from './products.schema';

/**
 * List all products with search, filter, and pagination
 */
export const listAll = async (params: any) => {
  const { search, categoryId, isActive, lowStock, page = 1, limit = 20 } = params;
  const skip = (Number(page) - 1) * Number(limit);
  const take = Number(limit);

  let where: any = {};

  // Search logic (Name, Active Ingredient, Barcode)
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { activeIngredient: { contains: search, mode: 'insensitive' } },
      { barcode: { contains: search, mode: 'insensitive' } },
    ];
  }

  // Filters
  if (categoryId) {
    where.categoryId = categoryId;
  }

  if (isActive !== undefined) {
    where.isActive = isActive === 'true';
  }

  // Fetch products with their category and inventoryBatches for stock calc
  const products = await prisma.product.findMany({
    where,
    skip,
    take,
    include: {
      category: { select: { name: true } },
      inventoryBatches: {
        select: { quantityRemaining: true }
      }
    },
    orderBy: { name: 'asc' },
  });

  const total = await prisma.product.count({ where });

  // Map to calculate totalStock and handle lowStock warn
  let formattedProducts = products.map((p) => {
    const totalStock = p.inventoryBatches.reduce((sum: number, batch: any) => sum + batch.quantityRemaining, 0);
    return {
      ...p,
      totalStock,
      isLowStock: totalStock <= p.minStockLevel,
      inventoryBatches: undefined,
    };
  });

  // Filter lowStock if requested
  if (lowStock === 'true') {
    formattedProducts = formattedProducts.filter(p => p.isLowStock);
  }

  return {
    data: formattedProducts,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit))
    }
  };
};

/**
 * Get product by ID
 */
export const findById = async (id: string) => {
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: { select: { name: true } },
      inventoryBatches: {
        orderBy: { expiryDate: 'asc' }
      }
    }
  });

  if (!product) return null;

  const totalStock = product.inventoryBatches.reduce((sum: number, batch: any) => sum + batch.quantityRemaining, 0);
  return { ...product, totalStock };
};

/**
 * Find product by barcode
 */
export const findByBarcode = async (barcode: string) => {
  const product = await prisma.product.findUnique({
    where: { barcode },
    include: {
      category: { select: { name: true } },
      inventoryBatches: { select: { quantityRemaining: true } }
    }
  });

  if (!product) return null;

  const totalStock = product.inventoryBatches.reduce((sum: number, batch: any) => sum + batch.quantityRemaining, 0);
  return { ...product, totalStock };
};

/**
 * Create a new product
 */
export const create = async (data: CreateProductInput) => {
  return prisma.product.create({
    data
  });
};

/**
 * Update a product
 */
export const update = async (id: string, data: UpdateProductInput) => {
  return prisma.product.update({
    where: { id },
    data
  });
};

/**
 * Soft delete (Disable) a product
 */
export const softDelete = async (id: string) => {
  return prisma.product.update({
    where: { id },
    data: { isActive: false }
  });
};
