import { useQuery } from '@tanstack/react-query';
import { 
  Banknote,
  ShoppingCart, 
  TrendingUp, 
  AlertCircle, 
  Loader2,
  RefreshCcw,
  ArrowUpRight,
} from 'lucide-react';
import { reportsService } from '@/services/reports.service';
import { StatsCard } from '@/components/features/dashboard/StatsCard';
import { RevenueChart } from '@/components/features/dashboard/RevenueChart';
import { InventoryAlerts } from '@/components/features/dashboard/InventoryAlerts';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('vi-VN', { 
    style: 'currency', 
    currency: 'VND' 
  }).format(value);
};

export default function DashboardPage() {
  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const resp = await reportsService.getDashboardStats();
      if (!resp.success) throw new Error(resp.message);
      return resp.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
        <p className="text-slate-500 font-medium animate-pulse">Loading dashboard insights...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4 text-center">
        <div className="p-4 bg-red-50 rounded-full">
          <AlertCircle className="w-10 h-10 text-red-500" />
        </div>
        <h3 className="text-xl font-bold text-slate-800">Failed to load dashboard</h3>
        <p className="text-slate-500 max-w-md">There was an error connecting to the reporting service. Please try again later.</p>
        <Button onClick={() => refetch()} variant="outline" className="mt-2">
          <RefreshCcw className="w-4 h-4 mr-2" /> Retry Load
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Pharmacy Overview</h1>
          <p className="text-slate-500 mt-1 italic">Real-time business performance monitoring</p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => refetch()} 
          disabled={isFetching}
          className="w-fit shadow-sm bg-white"
        >
          <RefreshCcw className={cn("w-4 h-4 mr-2", isFetching && "animate-spin")} />
          {isFetching ? 'Synching...' : 'Refresh Data'}
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Today Revenue"
          value={formatCurrency(data.todayRevenue)}
          icon={Banknote}
          iconClassName="bg-emerald-50"
          className="border-l-4 border-l-emerald-500"
          trend={{ value: 12, isPositive: true }}
          description="from yesterday"
        />
        <StatsCard
          title="Today Orders"
          value={data.todayOrders}
          icon={ShoppingCart}
          iconClassName="bg-indigo-50"
          className="border-l-4 border-l-indigo-500"
          trend={{ value: 5, isPositive: true }}
          description="from yesterday"
        />
        <StatsCard
          title="Estimated Profit"
          value={formatCurrency(data.todayProfit)}
          icon={TrendingUp}
          iconClassName="bg-violet-50"
          className="border-l-4 border-l-violet-500"
          trend={{ value: 8, isPositive: true }}
          description="from yesterday"
        />
        <StatsCard
          title="Critical Alerts"
          value={data.lowStockCount + data.expiringCount}
          icon={AlertCircle}
          iconClassName="bg-rose-50"
          className="border-l-4 border-l-rose-500"
          description="Items needing attention"
        />
      </div>

      {/* Main Charts & Detailed Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Chart - Takes 2 columns */}
        <RevenueChart data={data.revenueChart} />

        {/* Alerts Table - Takes 1 column */}
        <InventoryAlerts alerts={data.alerts} />
      </div>

      {/* Quick Links Section Placeholder */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 opacity-80 decoration-slate-200">
        <div className="p-6 bg-indigo-600 rounded-3xl text-white shadow-xl shadow-indigo-100 flex flex-col justify-between h-48 group cursor-pointer hover:scale-[1.02] transition-transform duration-300">
          <div>
            <h4 className="text-xl font-bold">New Sale</h4>
            <p className="text-indigo-100 text-sm mt-2">Open POS terminal for new transaction</p>
          </div>
          <div className="flex items-center justify-between">
            <div className="p-2 bg-white/20 rounded-full">
              <ArrowUpRight className="w-5 h-5" />
            </div>
            <ShoppingCart className="w-12 h-12 opacity-20 group-hover:opacity-40 transition-opacity" />
          </div>
        </div>

        <div className="p-6 bg-slate-900 rounded-3xl text-white shadow-xl shadow-slate-200 flex flex-col justify-between h-48 group cursor-pointer hover:scale-[1.02] transition-transform duration-300">
          <div>
            <h4 className="text-xl font-bold">Inventory</h4>
            <p className="text-slate-400 text-sm mt-2">Manage stock levels and batches</p>
          </div>
          <div className="flex items-center justify-between">
            <div className="p-2 bg-white/10 rounded-full">
              <ArrowUpRight className="w-5 h-5" />
            </div>
            <AlertCircle className="w-12 h-12 opacity-10 group-hover:opacity-30 transition-opacity" />
          </div>
        </div>

        <div className="p-6 bg-white border border-slate-100 rounded-3xl text-slate-800 shadow-xl shadow-slate-100 flex flex-col justify-between h-48 group cursor-pointer hover:scale-[1.02] transition-transform duration-300">
          <div>
            <h4 className="text-xl font-bold">Full Reports</h4>
            <p className="text-slate-500 text-sm mt-2">Detailed financial and sales analysis</p>
          </div>
          <div className="flex items-center justify-between">
            <div className="p-2 bg-slate-100 rounded-full">
              <ArrowUpRight className="w-5 h-5 text-indigo-600" />
            </div>
            <TrendingUp className="w-12 h-12 text-indigo-600 opacity-5 group-hover:opacity-10 transition-opacity" />
          </div>
        </div>
      </div>
    </div>
  );
}
