import { Request, Response } from 'express';
import * as reportsService from './reports.service';
import { successResponse, errorResponse } from '../../utils/response';
import { startOfMonth, endOfMonth, parseISO } from 'date-fns';

/**
 * Unified Dashboard Stats
 */
export const getDashboard = async (req: Request, res: Response) => {
  try {
    const stats = await reportsService.getDashboardStats();
    // Also include top products for the dashboard
    const topProducts = await reportsService.getTopProducts(5);
    return successResponse(res, { ...stats, topProducts }, 'Dashboard stats fetched successfully');
  } catch (error: any) {
    return errorResponse(res, 'Error fetching dashboard stats', 500, error.message);
  }
};

/**
 * Revenue Report
 */
export const getRevenueReport = async (req: Request, res: Response) => {
  const from = req.query.from ? parseISO(req.query.from as string) : startOfMonth(new Date());
  const to = req.query.to ? parseISO(req.query.to as string) : endOfMonth(new Date());

  try {
    const data = await reportsService.getRevenue(from, to);
    return successResponse(res, data, `Revenue from ${from.toISOString()} to ${to.toISOString()}`);
  } catch (error: any) {
    return errorResponse(res, 'Error fetching revenue report', 500, error.message);
  }
};

/**
 * Profit Report
 */
export const getProfitReport = async (req: Request, res: Response) => {
  const from = req.query.from ? parseISO(req.query.from as string) : startOfMonth(new Date());
  const to = req.query.to ? parseISO(req.query.to as string) : endOfMonth(new Date());

  try {
    const profit = await reportsService.getProfit(from, to);
    return successResponse(res, { profit }, 'Estimated profit fetched successfully');
  } catch (error: any) {
    return errorResponse(res, 'Error fetching profit report', 500, error.message);
  }
};

/**
 * Top Products Report
 */
export const getTopProductsReport = async (req: Request, res: Response) => {
  const limit = Number(req.query.limit) || 10;
  try {
    const products = await reportsService.getTopProducts(limit);
    return successResponse(res, products, 'Top products fetched successfully');
  } catch (error: any) {
    return errorResponse(res, 'Error fetching top products', 500, error.message);
  }
};

/**
 * Inventory Value Report
 */
export const getInventoryValueReport = async (req: Request, res: Response) => {
  try {
    const value = await reportsService.getInventoryValue();
    return successResponse(res, { totalInventoryValue: value }, 'Total inventory value fetched successfully');
  } catch (error: any) {
    return errorResponse(res, 'Error fetching inventory value', 500, error.message);
  }
};
