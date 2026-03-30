import prisma from '../../config/database';
import { StockAdjustmentInput } from './inventory.schema';
import { AdjustmentType } from '@prisma/client';

/**
 * List all inventory batches with product info
 */
export const listAllBatches = async () => {
  return prisma.inventoryBatch.findMany({
    include: {
      product: {
        select: { name: true, unit: true, barcode: true }
      }
    },
    orderBy: { expiryDate: 'asc' }
  });
};

/**
 * Get batches expiring within N days
 */
export const getExpiringBatches = async (days: number) => {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);

  return prisma.inventoryBatch.findMany({
    where: {
      expiryDate: {
        lte: futureDate,
        gte: new Date() // Not already expired
      },
      quantityRemaining: { gt: 0 }
    },
    include: {
      product: { select: { name: true, unit: true } }
    },
    orderBy: { expiryDate: 'asc' }
  });
};

/**
 * Get batches with low stock (Below threshold)
 */
export const getLowStockBatches = async (threshold: number) => {
  return prisma.inventoryBatch.findMany({
    where: {
      quantityRemaining: {
        lte: threshold,
        gt: 0
      }
    },
    include: {
      product: { select: { name: true, unit: true } }
    },
    orderBy: { quantityRemaining: 'asc' }
  });
};

/**
 * Get inventory for a specific product
 */
export const getByProduct = async (productId: string) => {
  return prisma.inventoryBatch.findMany({
    where: { productId },
    orderBy: { expiryDate: 'asc' }
  });
};

/**
 * Adjust stock of a batch (Transactional)
 */
export const adjustStock = async (data: StockAdjustmentInput, createdById: string) => {
  return prisma.$transaction(async (tx) => {
    // 1. Get batch
    const batch = await tx.inventoryBatch.findUnique({
      where: { id: data.batchId }
    });

    if (!batch) throw new Error('Inventory batch not found');

    // 2. Validate quantity for decrease
    if (data.type === AdjustmentType.DECREASE && batch.quantityRemaining < data.quantity) {
      throw new Error('Insufficient quantity in batch for adjustment');
    }

    // 3. Update batch quantity
    const finalQty = data.type === AdjustmentType.INCREASE 
      ? batch.quantityRemaining + data.quantity 
      : batch.quantityRemaining - data.quantity;

    await tx.inventoryBatch.update({
      where: { id: batch.id },
      data: { quantityRemaining: finalQty }
    });

    // 4. Create adjustment log
    return tx.stockAdjustment.create({
      data: {
        productId: data.productId,
        batchId: data.batchId,
        type: data.type,
        quantity: data.quantity,
        reason: data.reason,
        createdById
      }
    });
  });
};

/**
 * List all stock adjustment history
 */
export const listAdjustments = async () => {
  return prisma.stockAdjustment.findMany({
    include: {
      product: { select: { name: true } },
      batch: { select: { lotNumber: true } },
      createdBy: { select: { name: true } }
    },
    orderBy: { createdAt: 'desc' }
  });
};
