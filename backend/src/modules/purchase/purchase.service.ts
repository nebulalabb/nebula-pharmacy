import prisma from '../../config/database';
import { CreatePurchaseInput } from './purchase.schema';

/**
 * List all purchase orders
 */
export const listAll = async () => {
  return prisma.purchaseOrder.findMany({
    include: {
      supplier: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
};

/**
 * Get purchase order detail
 */
export const findById = async (id: string) => {
  return prisma.purchaseOrder.findUnique({
    where: { id },
    include: {
      supplier: { select: { id: true, name: true } },
      items: {
        include: {
          product: { select: { id: true, name: true, unit: true } },
        },
      },
    },
  });
};

/**
 * Create a new Purchase Order (Transactional)
 */
export const create = async (data: CreatePurchaseInput) => {
  return prisma.$transaction(async (tx) => {
    // 1. Calculate total cost
    const totalCost = data.items.reduce((sum, item) => sum + item.quantity * item.unitCost, 0);

    // 2. Create Purchase Order
    const po = await tx.purchaseOrder.create({
      data: {
        supplierId: data.supplierId,
        note: data.note,
        totalCost,
      },
    });

    // 3. Process each item
    for (const item of data.items) {
      // Create Purchase Order Item
      const poi = await tx.purchaseOrderItem.create({
        data: {
          purchaseOrderId: po.id,
          productId: item.productId,
          lotNumber: item.lotNumber,
          expiryDate: item.expiryDate,
          quantity: item.quantity,
          unitCost: item.unitCost,
        },
      });

      // Handle Inventory Batch (Add or Create)
      const existingBatch = await tx.inventoryBatch.findFirst({
        where: {
          productId: item.productId,
          lotNumber: item.lotNumber,
          expiryDate: item.expiryDate,
        },
      });

      if (existingBatch) {
        // Increment quantity for existing batch
        await tx.inventoryBatch.update({
          where: { id: existingBatch.id },
          data: {
            quantityRemaining: { increment: item.quantity },
          },
        });
      } else {
        // Create new batch linked to this PO Item
        await tx.inventoryBatch.create({
          data: {
            productId: item.productId,
            purchaseOrderItemId: poi.id,
            lotNumber: item.lotNumber,
            expiryDate: item.expiryDate,
            quantityRemaining: item.quantity,
            unitCost: item.unitCost,
          },
        });
      }
    }

    return po;
  });
};

/**
 * Cancel (Delete) Purchase Order
 * Logic: Check if items have been sold before allowing deletion.
 */
export const cancel = async (id: string) => {
  return prisma.$transaction(async (tx) => {
    // 1. Fetch PO with items
    const po = await tx.purchaseOrder.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!po) throw new Error('Purchase order not found');

    // 2. Pre-check: All items must have sufficient quantityRemaining in their batches
    for (const item of po.items) {
      const batch = await tx.inventoryBatch.findFirst({
        where: {
          productId: item.productId,
          lotNumber: item.lotNumber,
          expiryDate: item.expiryDate,
        },
      });

      if (!batch || batch.quantityRemaining < item.quantity) {
        throw new Error(
          `Cannot cancel. Some products in lot ${item.lotNumber} have already been sold or moved.`
        );
      }
    }

    // 3. Subtract quantities and delete PO
    for (const item of po.items) {
      const batch = await tx.inventoryBatch.findFirst({
        where: {
          productId: item.productId,
          lotNumber: item.lotNumber,
          expiryDate: item.expiryDate,
        },
      });

      if (batch) {
        const newQty = batch.quantityRemaining - item.quantity;
        if (newQty === 0) {
          await tx.inventoryBatch.delete({ where: { id: batch.id } });
        } else {
          await tx.inventoryBatch.update({
            where: { id: batch.id },
            data: { quantityRemaining: newQty },
          });
        }
      }
    }

    // 4. Delete Items and PO (Cascade or Manual depending on Prisma settings)
    // Here we do it manually to be safe
    await tx.purchaseOrderItem.deleteMany({ where: { purchaseOrderId: id } });
    await tx.purchaseOrder.delete({ where: { id } });

    return true;
  });
};
