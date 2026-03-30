import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  Truck, 
  Calendar, 
  FileText, 
  Banknote,
  Printer,
  PackageCheck,
  ClipboardList
} from 'lucide-react';
import { purchaseService } from '@/services/purchase.service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { format } from 'date-fns';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

export default function PurchaseOrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: order, isLoading, isError } = useQuery({
    queryKey: ['purchase-order', id],
    queryFn: async () => {
      const resp = await purchaseService.getPurchaseOrderById(id!);
      return resp.data;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return <div className="p-8 text-center text-slate-500 italic">Processing inbound record...</div>;
  }

  if (isError || !order) {
    return <div className="p-8 text-center text-rose-500 font-bold">Inbound bill not found.</div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate('/purchase-orders')} className="rounded-full shadow-sm">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic">
                {order.poNumber || `PO-${order.id.slice(0, 8).toUpperCase()}`}
              </h1>
              <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none px-3 font-black tracking-widest text-[10px]">
                RECEIVED
              </Badge>
            </div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest flex items-center gap-1 mt-1">
              <Calendar className="w-3 h-3" /> Processed on {format(new Date(order.receivedAt), 'dd MMMM yyyy HH:mm')}
            </p>
          </div>
        </div>
        <Button variant="outline" className="h-10 px-4 border-slate-200 shadow-sm font-bold text-slate-600 bg-white">
          <Printer className="w-4 h-4 mr-2" /> Print Bill
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Supplier Info */}
        <Card className="border-none shadow-md bg-white">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-4 px-6">
            <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <Truck className="w-4 h-4 text-indigo-600" /> Supplier Source
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <h3 className="text-xl font-black text-slate-800 tracking-tight">{order.supplier?.name || '---'}</h3>
            {order.supplier?.contactPerson && (
              <p className="text-sm text-slate-500 mt-1 font-medium italic">Attn: {order.supplier.contactPerson}</p>
            )}
            <div className="mt-4 pt-4 border-t border-slate-50 flex items-center gap-3">
              <div className="p-2 bg-indigo-50 rounded-lg">
                <FileText className="w-4 h-4 text-indigo-600" />
              </div>
              <p className="text-[11px] text-slate-500 font-bold leading-tight uppercase">
                Official Inbound Supply Record
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Financial Summary */}
        <Card className="border-none shadow-md bg-white border-l-4 border-l-indigo-600">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-4 px-6">
            <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <Banknote className="w-4 h-4 text-emerald-600" /> Financial Flow
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">Total Bill Value</p>
            <h3 className="text-3xl font-black text-indigo-600 tracking-tighter">
              {formatCurrency(Number(order.totalAmount))}
            </h3>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline" className="text-[10px] font-black tracking-widest border-emerald-100 text-emerald-600 bg-emerald-50">
                PAID IN FULL
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Note Card */}
        <Card className="border-none shadow-md bg-white opacity-90">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-4 px-6">
            <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-amber-500" /> Inbound Notes
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <p className="text-sm text-slate-600 italic leading-relaxed">
              {order.note || 'No specific instructions or notes added to this bill.'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Items Table */}
      <Card className="border-none shadow-xl shadow-slate-100/50 bg-white overflow-hidden">
        <CardHeader className="bg-slate-900 text-white flex flex-row items-center justify-between py-4 px-6">
          <CardTitle className="text-sm font-black uppercase tracking-[0.2em] flex items-center gap-2">
            <PackageCheck className="w-4 h-4" /> Verified Received Goods
          </CardTitle>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            {order.items?.length || 0} unique meditations
          </span>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/60 font-black uppercase tracking-widest text-[10px]">
              <TableRow>
                <TableHead className="w-[300px] font-bold py-4">Article / Description</TableHead>
                <TableHead className="font-bold">Lot Registry</TableHead>
                <TableHead className="font-bold text-center">Inbound Qty</TableHead>
                <TableHead className="text-right font-bold">Unit Cost</TableHead>
                <TableHead className="text-right font-bold">Subtotal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.items?.map((item: any) => (
                <TableRow key={item.id} className="hover:bg-slate-50 transition-colors group">
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-black text-slate-800 tracking-tight group-hover:text-indigo-600 transition-colors">
                        {item.product?.name || 'Unknown Medicine'}
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest italic translate-y-0.5">
                        Base Unit: {item.product?.unit}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <Badge variant="outline" className="w-fit font-mono font-bold text-[10px] bg-slate-50 border-slate-200">
                        LOT: {item.lotNumber}
                      </Badge>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-bold uppercase">
                        <Calendar className="w-2.5 h-2.5" /> Exp: {item.expiryDate ? format(new Date(item.expiryDate), 'dd/MM/yyyy') : '---'}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center font-black text-slate-900">
                    {item.quantity}
                  </TableCell>
                  <TableCell className="text-right font-bold text-slate-500">
                    {formatCurrency(Number(item.unitCost))}
                  </TableCell>
                  <TableCell className="text-right font-black text-indigo-600">
                    {formatCurrency(item.quantity * Number(item.unitCost))}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
