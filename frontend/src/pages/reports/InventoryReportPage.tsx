import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  BarChart3, 
  Package, 
  Warehouse, 
  BadgeDollarSign, 
  TrendingDown,
  ArrowDownRight,
  Download,
  AlertCircle,
  History,
  Search
} from 'lucide-react';
import { reportsService } from '@/services/reports.service';
import { inventoryService } from '@/services/inventory.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

export default function InventoryReportPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: inventoryData } = useQuery({
    queryKey: ['report-inventory-status'],
    queryFn: async () => {
      const resp = await reportsService.getInventoryStatus();
      return resp.data;
    },
  });

  const { data: allBatchesData, isLoading: isBatchesLoading } = useQuery({
    queryKey: ['report-inventory-all', searchTerm],
    queryFn: async () => {
       const resp = await inventoryService.getBatches({ search: searchTerm, limit: 100 });
       return resp.data.batches;
    }
  });

  const stats = inventoryData?.summary || { totalBatches: 0, totalInventoryValue: 0, slowMovingCount: 0 };
  const batches = allBatchesData || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-slate-100 rounded-2xl">
            <Warehouse className="w-6 h-6 text-slate-600" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">Inventory Valuation</h1>
            <p className="text-slate-500 text-sm font-bold uppercase tracking-widest opacity-60 flex items-center gap-1 mt-1">
              <BadgeDollarSign className="w-3 h-3" /> Capital Allocation & Liquidity Audit
            </p>
          </div>
        </div>

        <div className="flex gap-2">
           <Button variant="outline" className="h-11 rounded-xl border-slate-200 bg-white font-black text-[10px] uppercase gap-2 px-6">
              <History className="w-4 h-4 text-slate-400" /> Inventory Logs
           </Button>
           <Button className="h-11 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-[10px] uppercase gap-2 px-6 shadow-xl">
              <Download className="w-4 h-4" /> Export Report
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <Card className="border-none shadow-xl shadow-slate-100/50 bg-white overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
               <Package className="w-24 h-24" />
            </div>
            <CardContent className="p-6">
               <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Stock Portfolio Value</p>
               <h3 className="text-3xl font-black text-slate-800 tracking-tighter">{formatCurrency(stats.totalInventoryValue)}</h3>
               <div className="mt-4 flex items-center gap-2 text-slate-400 text-xs font-bold italic">
                  <BadgeDollarSign className="w-4 h-4" /> Market acquisition cost basis
               </div>
            </CardContent>
         </Card>

         <Card className="border-none shadow-xl shadow-slate-100/50 bg-white">
            <CardContent className="p-6">
               <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Active Batches</p>
               <h3 className="text-3xl font-black text-slate-800 tracking-tighter">{stats.totalBatches}</h3>
               <div className="mt-4 flex items-center gap-2 text-indigo-500 text-xs font-bold italic">
                  <BarChart3 className="w-4 h-4" /> Diversified lot management
               </div>
            </CardContent>
         </Card>

         <Card className="border-none shadow-xl shadow-rose-100/20 bg-rose-50 border border-rose-100 group">
            <CardContent className="p-6">
               <p className="text-[10px] font-black uppercase tracking-widest text-rose-400 mb-1">Slow Moving Articles</p>
               <h3 className="text-3xl font-black text-rose-600 tracking-tighter">{stats.slowMovingCount}</h3>
               <div className="mt-4 flex items-center gap-2 text-rose-500 text-xs font-bold italic">
                  <TrendingDown className="w-4 h-4" /> High stock, low turnover
               </div>
            </CardContent>
         </Card>
      </div>

      <Card className="border-none shadow-xl shadow-slate-100/50 bg-white overflow-hidden">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
           <div>
              <CardTitle className="text-lg font-black tracking-tight">Warehouse Valuation Ledger</CardTitle>
              <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Real-time asset tracking by lot</CardDescription>
           </div>
           
           <div className="relative w-full md:w-[300px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input 
                placeholder="Search catalog..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-10 pl-9 pr-4 rounded-xl border-slate-200 bg-white font-medium text-xs focus:bg-white"
              />
           </div>
        </CardHeader>
        <CardContent className="p-0">
           <Table>
             <TableHeader className="bg-slate-100/30 text-[10px] font-black uppercase tracking-widest">
                <TableRow>
                   <TableHead className="py-4 px-6 border-r border-slate-50">Medicinal Article</TableHead>
                   <TableHead className="text-center">Lot / Batch</TableHead>
                   <TableHead className="text-center">Shelf Qty</TableHead>
                   <TableHead className="text-right">Unit Cost</TableHead>
                   <TableHead className="text-right px-6">Total Asset Value</TableHead>
                </TableRow>
             </TableHeader>
             <TableBody>
                {isBatchesLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-40 text-center italic text-slate-400 animate-pulse">Scanning shelf units...</TableCell>
                  </TableRow>
                ) : batches.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-40 text-center opacity-30 flex flex-col items-center justify-center p-10">
                       <AlertCircle className="w-12 h-12 mb-2" />
                       <span className="font-black italic uppercase tracking-widest text-sm">No inventory records located.</span>
                    </TableCell>
                  </TableRow>
                ) : (
                  batches.map((batch: any) => (
                    <TableRow key={batch.id} className="hover:bg-slate-50/50 transition-colors group">
                       <TableCell className="px-6 py-4 border-r border-slate-50/50">
                          <div className="flex flex-col">
                             <span className="font-bold text-slate-800 tracking-tight">{batch.product?.name || '---'}</span>
                             <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest italic">{batch.product?.unit}</span>
                          </div>
                       </TableCell>
                       <TableCell className="text-center">
                          <span className="text-[10px] font-mono font-bold bg-slate-100 px-2 py-0.5 rounded border border-slate-200">{batch.lotNumber}</span>
                       </TableCell>
                       <TableCell className="text-center">
                          <span className={cn(
                             "text-sm font-black tracking-tight px-3 py-1 rounded-full",
                             batch.quantity <= 10 ? "bg-rose-50 text-rose-600" : "bg-slate-100 text-slate-900"
                          )}>{batch.quantity}</span>
                       </TableCell>
                       <TableCell className="text-right font-medium text-slate-500 italic">
                          {formatCurrency(Number(batch.unitCost))}
                       </TableCell>
                       <TableCell className="text-right px-6 font-black text-slate-900 bg-slate-50/20">
                          {formatCurrency(batch.quantity * Number(batch.unitCost))}
                       </TableCell>
                    </TableRow>
                  ))
                )}
             </TableBody>
           </Table>
        </CardContent>
      </Card>

      <Card className="border-none shadow-xl shadow-rose-100/20 bg-rose-900 text-white overflow-hidden relative group">
         <div className="absolute top-0 right-0 p-8 opacity-10">
            <ArrowDownRight className="w-32 h-32" />
         </div>
         <CardContent className="p-8 flex items-center justify-between">
            <div className="space-y-2">
               <h4 className="text-2xl font-black tracking-tight">Capital Allocation Assessment</h4>
               <p className="text-rose-200 text-sm font-medium italic max-w-lg">
                 Current shelf inventory represents {formatCurrency(stats.totalInventoryValue)} in allocated capital. 
                 Optimizing slow-moving articles could recover up to {formatCurrency(stats.totalInventoryValue * 0.15)} in liquidity within 30 days.
               </p>
            </div>
            <Button className="bg-white text-rose-900 hover:bg-rose-50 font-black tracking-widest text-[10px] uppercase h-12 px-8 rounded-2xl shadow-2xl">
               Optimize Turnover
            </Button>
         </CardContent>
      </Card>
    </div>
  );
}
