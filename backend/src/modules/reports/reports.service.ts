import prisma from '../../config/database';
import { startOfDay, endOfDay, subDays } from 'date-fns';

/**
 * Get revenue for a specific period
 */
export const getRevenue = async (from: Date, to: Date) => {
  const result = await prisma.salesOrder.aggregate({
    where: {
      soldAt: { gte: from, lte: to },
    },
    _sum: { totalAmount: true },
    _count: { id: true },
  });

  return {
    revenue: Number(result._sum.totalAmount) || 0,
    orderCount: result._count.id,
  };
};

/**
 * Get estimated profit for a specific period
 * Profit = SUM((salePrice - unitCost) * quantity)
 */
export const getProfit = async (from: Date, to: Date) => {
  const items = await prisma.salesOrderItem.findMany({
    where: {
      salesOrder: { soldAt: { gte: from, lte: to } },
    },
    select: {
      salePrice: true,
      unitCost: true,
      quantity: true,
    },
  });

  const profit = items.reduce((sum, item) => {
    const margin = Number(item.salePrice) - Number(item.unitCost);
    return sum + margin * item.quantity;
  }, 0);

  return profit;
};

/**
 * Get top selling products
 */
export const getTopProducts = async (limit: number = 10) => {
  const result = await prisma.salesOrderItem.groupBy({
    by: ['productId'],
    _sum: { quantity: true },
    orderBy: { _sum: { quantity: 'desc' } },
    take: limit,
  });

  // Join with product names
  const products = await Promise.all(
    result.map(async (item) => {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        select: { name: true, unit: true },
      });
      return {
        name: product?.name,
        unit: product?.unit,
        totalSold: item._sum.quantity,
      };
    })
  );

  return products;
};

/**
 * Get total inventory value
 */
export const getInventoryValue = async () => {
  const batches = await prisma.inventoryBatch.findMany({
    where: { quantityRemaining: { gt: 0 } },
    select: { quantityRemaining: true, unitCost: true },
  });

  const totalValue = batches.reduce((sum, b) => {
    return sum + b.quantityRemaining * Number(b.unitCost);
  }, 0);

  return totalValue;
};

/**
 * Comprehensive Dashboard Stats
 */
export const getDashboardStats = async () => {
  const today = new Date();
  const start = startOfDay(today);
  const end = endOfDay(today);

  // 1. Today Stats
  const { revenue: todayRevenue, orderCount: todayOrders } = await getRevenue(start, end);
  const todayProfit = await getProfit(start, end);

  // 2. Stock Alerts
  // Fetch low stock items (totalStock <= minStockLevel)
  const allProducts = await prisma.product.findMany({
    include: { inventoryBatches: { select: { quantityRemaining: true } } },
  });

  const lowStockItemsRaw = allProducts.filter((p: any) => {
    const totalStock = p.inventoryBatches.reduce((s: number, b: any) => s + b.quantityRemaining, 0);
    return totalStock <= p.minStockLevel;
  });

  const lowStockItems = lowStockItemsRaw.slice(0, 5).map(p => ({
    id: p.id,
    name: p.name,
    type: 'low-stock',
    value: p.inventoryBatches.reduce((s, b) => s + b.quantityRemaining, 0)
  }));

  const lowStockCount = lowStockItemsRaw.length;

  // 3. Expiring Alerts (Next 30 days)
  const thirtyDaysLater = subDays(today, -30);
  const expiringBatches = await prisma.inventoryBatch.findMany({
    where: {
      expiryDate: { lte: thirtyDaysLater, gte: today },
      quantityRemaining: { gt: 0 },
    },
    include: { product: { select: { name: true } } },
    orderBy: { expiryDate: 'asc' },
    take: 5
  });

  const expiringItems = expiringBatches.map(b => ({
    id: b.id,
    name: b.product.name,
    type: 'expiring',
    date: b.expiryDate ? b.expiryDate.toISOString().split('T')[0] : 'N/A',
    value: b.quantityRemaining
  }));

  const expiringCount = await prisma.inventoryBatch.count({
    where: {
      expiryDate: { lte: thirtyDaysLater, gte: today },
      quantityRemaining: { gt: 0 },
    },
  });

  // 4. Simple chart data (Last 7 days revenue)
  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const d = subDays(today, i);
    const { revenue } = await getRevenue(startOfDay(d), endOfDay(d));
    last7Days.push({
      date: d.toISOString().split('T')[0],
      revenue,
    });
  }

  // 5. Build Final Response
  return {
    todayRevenue,
    todayOrders,
    todayProfit,
    lowStockCount,
    expiringCount,
    revenueChart: last7Days,
    alerts: [...lowStockItems, ...expiringItems]
  };
};
