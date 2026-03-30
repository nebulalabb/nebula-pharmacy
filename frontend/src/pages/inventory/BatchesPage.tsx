import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Search, 
  Filter, 
  Package, 
  Calendar, 
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  TrendingDown,
  History,
  MoreVertical
} from 'lucide-react';
import { inventoryService } from '@/services/inventory.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { format, differenceInDays } from 'date-fns';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

export default function BatchesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading } = useQuery({
    queryKey: ['inventory-batches', searchTerm, filterType, page],
    queryFn: async () => {
      const isExpiring = filterType === 'expiring';
      const isLowStock = filterType === 'low-stock';
      const resp = await inventoryService.getBatches({
        search: searchTerm,
        isExpiring,
        isLowStock,
        page,
        limit,
      });
      return resp.data;
    },
  });

  const batches = data?.batches || [];
  const totalPages = data?.totalPages || 1;

  const getExpiryBadge = (expiryDate: string) => {
    const daysLeft = differenceInDays(new Date(expiryDate), new Date());
    
    if (daysLeft < 0) {
      return <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100 border-none px-2 font-black text-[10px] uppercase">🔴 Expired</Badge>;
    }
    if (daysLeft < 30) {
      return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none px-2 font-black text-[10px] uppercase">🟡 Critical ({daysLeft}d)</Badge>;
    }
    if (daysLeft < 90) {
      return <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 border-none px-2 font-black text-[10px] uppercase">🟠 Warning ({daysLeft}d)</Badge>;
    }
    return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none px-2 font-black text-[10px] uppercase">🟢 Safe</Badge>;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <Package className="w-8 h-8 text-indigo-600" /> Inventory Batches
          </h1>
          <p className="text-slate-500 mt-1 italic">Precise tracking of pharmaceutical lots, expiry dates, and shelf stock</p>
        </div>
      </div>

      {/* Control Panel */}
      <Card className="border-none shadow-sm bg-white overflow-hidden">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by product name or batch number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-11 border-slate-200 bg-slate-50/50 focus:bg-white"
              />
            </div>
            <div className="flex gap-2">
              <Select value={filterType} onValueChange={setFilterType}>
                 <SelectTrigger className="w-[180px] h-11 border-slate-200">
                    <div className="flex items-center gap-2">
                       <Filter className="w-4 h-4 text-slate-400" />
                       <SelectValue placeholder="Quick Filter" />
                    </div>
                 </SelectTrigger>
                 <SelectContent>
                    <SelectItem value="all">All Batches</SelectItem>
                    <SelectItem value="expiring">Sắp hết hạn</SelectItem>
                    <SelectItem value="low-stock">Sắp hết hàng</SelectItem>
                 </SelectContent>
              </Select>
              <Button variant="outline" className="h-11 px-4 border-slate-200 bg-white">
                 <History className="w-4 h-4 mr-2 text-slate-400" /> Export List
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Batch Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/50 border-b border-slate-100">
            <TableRow>
              <TableHead className="font-bold py-4">Medicine / Description</TableHead>
              <TableHead className="font-bold">Lot Number</TableHead>
              <TableHead className="font-bold">Expiry Assessment</TableHead>
              <TableHead className="font-bold text-center">Remaining Stock</TableHead>
              <TableHead className="font-bold text-right">Inbound Cost</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-40 text-center">
                  <div className="flex flex-col items-center justify-center space-y-2 text-slate-400">
                    <Package className="w-8 h-8 animate-pulse italic" />
                    <span className="italic">Scanning warehouse shelves...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : batches.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-40 text-center">
                  <div className="flex flex-col items-center justify-center space-y-2 text-slate-400">
                    <AlertTriangle className="w-8 h-8 opacity-20" />
                    <span className="italic">No medicinal batches found.</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              batches.map((batch: any) => (
                <TableRow key={batch.id} className="hover:bg-slate-50/50 transition-colors group">
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-black text-slate-800 tracking-tight group-hover:text-indigo-600 transition-colors">
                        {batch.product?.name || '---'}
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                        Base Unit: {batch.product?.unit}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-mono font-bold bg-slate-50 border-slate-200 tracking-wider">
                      {batch.lotNumber}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1.5">
                       {getExpiryBadge(batch.expiryDate)}
                       <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-bold uppercase">
                          <Calendar className="w-3 h-3" /> Due {format(new Date(batch.expiryDate), 'dd/MM/yyyy')}
                       </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex flex-col items-center">
                       <span className={cn(
                        "text-lg font-black tracking-tighter",
                        batch.quantity <= 10 ? "text-rose-600" : "text-slate-900"
                       )}>
                        {batch.quantity}
                       </span>
                       {batch.quantity <= 10 && (
                         <span className="text-[8px] font-black italic uppercase text-rose-500 flex items-center gap-0.5">
                            <TrendingDown className="w-2 h-2" /> Critical Low
                         </span>
                       )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-bold text-slate-500">
                    {formatCurrency(Number(batch.unitCost))}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-indigo-600 rounded-full">
                       <MoreVertical className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between px-2 pb-10">
        <p className="text-sm text-slate-500 italic">
          Total system recorded: <span className="font-bold text-slate-800">{data?.totalItems || 0} batches</span>
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="h-10 px-4 rounded-xl border-slate-200 bg-white"
          >
            <ChevronLeft className="w-4 h-4 mr-1" /> Prev
          </Button>
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Button
                key={p}
                variant={page === p ? "default" : "ghost"}
                size="sm"
                onClick={() => setPage(p)}
                className={cn(
                  "h-10 w-10 p-0 rounded-xl",
                  page === p ? "bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-100" : "hover:bg-slate-100"
                )}
              >
                {p}
              </Button>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="h-10 px-4 rounded-xl border-slate-200 bg-white"
          >
            Next <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}
