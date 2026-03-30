import prisma from '../../config/database';
import { CreateSalesOrderInput } from './sales.schema';

/**
 * List all sales orders
 */
export const listAll = async () => {
  return prisma.salesOrder.findMany({
    include: {
      cashier: { select: { id: true, name: true } },
    },
    orderBy: { soldAt: 'desc' },
  });
};

/**
 * Get sales order detail
 */
export const findById = async (id: string) => {
  return prisma.salesOrder.findUnique({
    where: { id },
    include: {
      cashier: { select: { id: true, name: true } },
      items: {
        include: {
          product: { select: { id: true, name: true, unit: true } },
          batch: { select: { id: true, lotNumber: true, expiryDate: true } },
        },
      },
    },
  });
};

/**
 * Create a new Sales Order (Transactional with FEFO logic)
 */
export const create = async (data: CreateSalesOrderInput, cashierId: string) => {
  return prisma.$transaction(async (tx) => {
    let totalAmount = 0;
    const orderItemsToCreate = [];

    // Process each item in the request
    for (const item of data.items) {
      // 1. Get product price and check existence
      const product = await tx.product.findUnique({
        where: { id: item.productId },
        include: {
          inventoryBatches: {
            where: { quantityRemaining: { gt: 0 } },
            orderBy: [{ expiryDate: 'asc' }, { createdAt: 'asc' }],
          },
        },
      });

      if (!product || !product.isActive) {
        throw new Error(`Product ${item.productId} not found or inactive`);
      }

      // 2. Check total availability
      const totalAvailable = product.inventoryBatches.reduce(
        (sum, b) => sum + b.quantityRemaining,
        0
      );

      if (totalAvailable < item.quantity) {
        throw new Error(
          `Insufficient stock for ${product.name}. Available: ${totalAvailable}, Requested: ${item.quantity}`
        );
      }

      // 3. Subtract from batches using FEFO logic
      let remainingToSubtract = item.quantity;

      for (const batch of product.inventoryBatches) {
        if (remainingToSubtract <= 0) break;

        const takeFromThisBatch = Math.min(batch.quantityRemaining, remainingToSubtract);

        // Update batch quantity
        await tx.inventoryBatch.update({
          where: { id: batch.id },
          data: {
            quantityRemaining: { decrement: takeFromThisBatch },
          },
        });

        // Prepare SalesOrderItem
        orderItemsToCreate.push({
          productId: product.id,
          batchId: batch.id,
          quantity: takeFromThisBatch,
          salePrice: product.salePrice,
          unitCost: batch.unitCost, // Store cost at time of sale for profit reporting
        });

        totalAmount += takeFromThisBatch * Number(product.salePrice);
        remainingToSubtract -= takeFromThisBatch;
      }
    }

    // 4. Create Sales Order
    const finalAmount = totalAmount - data.discount;

    const order = await tx.salesOrder.create({
      data: {
        cashierId,
        totalAmount: finalAmount,
        discount: data.discount,
        paymentMethod: data.paymentMethod,
        note: data.note,
        items: {
          create: orderItemsToCreate,
        },
      },
      include: {
        items: true,
      },
    });

    return order;
  });
};
