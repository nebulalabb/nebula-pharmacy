import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  Calendar, 
  Banknote,
  Printer,
  PackageCheck,
  CreditCard,
  History,
  ArrowRight
} from 'lucide-react';
import { salesService } from '@/services/sales.service';
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

export default function SalesDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: sale, isLoading, isError } = useQuery({
    queryKey: ['sale-detail', id],
    queryFn: async () => {
      const resp = await salesService.getSaleById(id!);
      return resp.data;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return <div className="p-8 text-center text-slate-500 italic">Processing transaction record...</div>;
  }

  if (isError || !sale) {
    return <div className="p-8 text-center text-rose-500 font-bold">Sales receipt not found.</div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate('/sales-history')} className="rounded-full shadow-sm">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic">
                {sale.saleNumber || `REC-${sale.id.slice(0, 8).toUpperCase()}`}
              </h1>
              <Badge className="bg-emerald-100 text-emerald-700 border-none px-3 font-black tracking-widest text-[10px]">
                COMPLETED
              </Badge>
            </div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest flex items-center gap-1 mt-1">
              <Calendar className="w-3 h-3" /> Transaction on {format(new Date(sale.createdAt), 'dd MMMM yyyy HH:mm')}
            </p>
          </div>
        </div>
        <Button variant="outline" className="h-10 px-4 border-slate-200 shadow-sm font-bold text-slate-600 bg-white">
          <Printer className="w-4 h-4 mr-2" /> Re-print Receipt
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Payment Summary */}
        <Card className="border-none shadow-md bg-white border-l-4 border-l-indigo-600">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-4 px-6">
            <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <Banknote className="w-4 h-4 text-emerald-600" /> Revenue Flow
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">Total Received</p>
            <h3 className="text-3xl font-black text-indigo-600 tracking-tighter">
              {formatCurrency(Number(sale.totalAmount))}
            </h3>
            <div className="mt-4 flex items-center gap-2">
               {sale.paymentMethod === 'CASH' ? (
                 <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border-emerald-100 font-black tracking-widest text-[10px]">
                    CASH TRANSACTION
                 </Badge>
               ) : (
                 <Badge className="bg-indigo-50 text-indigo-700 hover:bg-indigo-50 border-indigo-100 font-black tracking-widest text-[10px]">
                    ELECTRONIC TRANSFER
                 </Badge>
               )}
            </div>
          </CardContent>
        </Card>

        {/* Change / Split Info */}
        <Card className="border-none shadow-md bg-white">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-4 px-6">
            <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-indigo-600" /> Payment Details
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400 font-bold italic">Discount Applied:</span>
                <span className="font-black text-rose-500">-{formatCurrency(Number(sale.discount || 0))}</span>
            </div>
            {sale.paymentMethod === 'CASH' && (
              <>
                <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400 font-bold italic">Cash Tendering:</span>
                    <span className="font-black text-slate-700">{formatCurrency(Number(sale.receivedAmount || sale.totalAmount))}</span>
                </div>
                <div className="flex justify-between items-center text-sm pt-2 border-t border-slate-50">
                    <span className="text-slate-400 font-bold italic">Change Provided:</span>
                    <span className="font-black text-emerald-600">{formatCurrency(Number(sale.changeAmount || 0))}</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Staff / Audit */}
        <Card className="border-none shadow-md bg-white opacity-90">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-4 px-6">
            <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <History className="w-4 h-4 text-amber-500" /> Transaction Audit
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 flex flex-col justify-center">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-black">
                  {sale.createdBy?.name?.charAt(0).toUpperCase() || 'A'}
               </div>
               <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none mb-1">Pharmacist in Charge</p>
                  <p className="text-lg font-black text-slate-800 tracking-tight">{sale.createdBy?.name || 'Admin User'}</p>
               </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sale Items Table */}
      <Card className="border-none shadow-xl shadow-slate-100/50 bg-white overflow-hidden">
        <CardHeader className="bg-slate-900 text-white flex flex-row items-center justify-between py-4 px-6">
          <CardTitle className="text-sm font-black uppercase tracking-[0.2em] flex items-center gap-2">
            <PackageCheck className="w-4 h-4" /> Articles Dispensed
          </CardTitle>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            {sale.items?.length || 0} unique meditations
          </span>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/60 font-black uppercase tracking-widest text-[10px]">
              <TableRow>
                <TableHead className="w-[300px] font-bold py-4">Article / Description</TableHead>
                <TableHead className="font-bold">Lot Allotted</TableHead>
                <TableHead className="font-bold text-center">Qty</TableHead>
                <TableHead className="text-right font-bold">Unit Sale Price</TableHead>
                <TableHead className="text-right font-bold">Subtotal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sale.items?.map((item: any) => (
                <TableRow key={item.id} className="hover:bg-slate-50 transition-colors group">
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-black text-slate-800 tracking-tight group-hover:text-indigo-600 transition-colors">
                        {item.product?.name || 'Medicine'}
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest italic translate-y-0.5">
                        Dispense Unit: {item.product?.unit}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <Badge variant="outline" className="w-fit font-mono font-bold text-[10px] bg-slate-50 border-slate-200">
                        LOT: {item.inventoryBatch?.lotNumber || 'POOL'}
                      </Badge>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-bold uppercase">
                        <Calendar className="w-2.5 h-2.5" /> Exp: {item.inventoryBatch?.expiryDate ? format(new Date(item.inventoryBatch.expiryDate), 'dd/MM/yyyy') : '---'}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center font-black text-slate-900 border-x border-slate-50/50">
                    {item.quantity}
                  </TableCell>
                  <TableCell className="text-right font-bold text-slate-500">
                    {formatCurrency(Number(item.salePrice))}
                  </TableCell>
                  <TableCell className="text-right font-black text-indigo-600">
                    {formatCurrency(item.quantity * Number(item.salePrice))}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="flex justify-end p-4">
         <Button onClick={() => navigate('/pos')} className="bg-indigo-600 hover:bg-indigo-700 h-14 px-8 rounded-2xl font-black text-lg gap-3 shadow-xl shadow-indigo-100">
            Open POS for New Sale <ArrowRight className="w-5 h-5" />
         </Button>
      </div>
    </div>
  );
}
