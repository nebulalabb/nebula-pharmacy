import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Eye, 
  Filter, 
  ChevronLeft, 
  ChevronRight,
  Calendar,
  Truck,
  FileText,
  MoreHorizontal
} from 'lucide-react';
import { purchaseService } from '@/services/purchase.service';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

export default function PurchaseOrderListPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading } = useQuery({
    queryKey: ['purchase-orders', searchTerm, page],
    queryFn: async () => {
      const resp = await purchaseService.getPurchaseOrders({
        search: searchTerm,
        page,
        limit,
      });
      return resp.data;
    },
  });

  const orders = data?.orders || [];
  const totalPages = data?.totalPages || 1;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <Truck className="w-8 h-8 text-indigo-600" /> Stock Inbound
          </h1>
          <p className="text-slate-500 mt-1 italic">Track all purchase orders and incoming pharmaceutical stock</p>
        </div>
        <Button asChild className="bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100 h-11 px-6">
          <Link to="/purchase-orders/new">
            <Plus className="w-4 h-4 mr-2" /> New Purchase Order
          </Link>
        </Button>
      </div>

      {/* Quick Filters Card */}
      <Card className="border-none shadow-sm bg-white overflow-hidden">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by PO code or Supplier name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-11 border-slate-200 bg-slate-50/50 focus:bg-white"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="h-11 px-4 border-slate-200 bg-white">
                <Calendar className="w-4 h-4 mr-2 text-slate-400" /> Date Range
              </Button>
              <Button variant="outline" className="h-11 px-3 border-slate-200 bg-white">
                <Filter className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* PO Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/50 border-b border-slate-100">
            <TableRow>
              <TableHead className="font-bold py-4">PO CODE</TableHead>
              <TableHead className="font-bold">Entry Date</TableHead>
              <TableHead className="font-bold">Supplier</TableHead>
              <TableHead className="font-bold">Items count</TableHead>
              <TableHead className="font-bold text-right">Total Amount</TableHead>
              <TableHead className="font-bold text-center">Status</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-40 text-center">
                  <div className="flex flex-col items-center justify-center space-y-2 text-slate-400">
                    <FileText className="w-8 h-8 animate-pulse" />
                    <span className="italic">Loading history...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-40 text-center">
                  <div className="flex flex-col items-center justify-center space-y-2 text-slate-400">
                    <Truck className="w-8 h-8 opacity-20" />
                    <span className="italic">No purchase records found.</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order: any) => (
                <TableRow key={order.id} className="hover:bg-slate-50/50 transition-colors group">
                  <TableCell>
                    <span className="font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg text-xs tracking-wider">
                      {order.poNumber || order.id.slice(0, 8).toUpperCase()}
                    </span>
                  </TableCell>
                  <TableCell className="text-slate-600 font-medium">
                    {format(new Date(order.receivedAt), 'dd/MM/yyyy HH:mm')}
                  </TableCell>
                  <TableCell>
                    <div className="font-bold text-slate-800">{order.supplier?.name || '---'}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-bold bg-slate-50">
                      {order._count?.items || 0} items
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-black text-slate-900">
                    {formatCurrency(Number(order.totalAmount))}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest">
                      COMPLETED
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-slate-100 rounded-full">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 p-1 border-slate-200">
                        <DropdownMenuLabel className="text-[10px] font-bold uppercase text-slate-400 px-2 py-1 tracking-widest">Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => navigate(`/purchase-orders/${order.id}`)} className="cursor-pointer font-medium">
                          <Eye className="mr-2 h-4 w-4 text-indigo-500" /> View Detailed Bill
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-2">
        <p className="text-sm text-slate-500">
          Viewing <span className="font-bold text-slate-800">{orders.length}</span> purchase orders
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="h-10 px-4 rounded-xl border-slate-200 bg-white"
          >
            <ChevronLeft className="w-4 h-4 mr-1" /> Previous
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
