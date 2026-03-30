import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Plus, 
  Minus, 
  History, 
  ShieldAlert, 
  FileText, 
  AlertCircle,
  TrendingDown,
  TrendingUp,
  Save,
  Loader2
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { inventoryService } from '@/services/inventory.service';
import { productsService } from '@/services/products.service';
import { useAuthStore } from '@/stores/auth.store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export default function AdjustmentPage() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'ADMIN';

  const [productId, setProductId] = useState('');
  const [batchId, setBatchId] = useState('');
  const [type, setType] = useState<'INCREASE' | 'DECREASE'>('DECREASE');
  const [quantity, setQuantity] = useState<number>(0);
  const [reason, setReason] = useState('');

  // Queries
  const { data: productsData } = useQuery({
    queryKey: ['products-all'],
    queryFn: async () => {
      const resp = await productsService.getProducts({ limit: 100 });
      return resp.data.products;
    }
  });

  const { data: batchesData } = useQuery({
    queryKey: ['batches-for-product', productId],
    queryFn: async () => {
      const resp = await inventoryService.getBatches({ productId, limit: 50 });
      return resp.data.batches;
    },
    enabled: !!productId
  });

  const { data: adjustmentsData, isLoading: isHistoryLoading } = useQuery({
    queryKey: ['inventory-adjustments'],
    queryFn: async () => {
      const resp = await inventoryService.getAdjustments();
      return resp.data;
    }
  });

  const mutation = useMutation({
    mutationFn: (data: any) => inventoryService.createAdjustment(data),
    onSuccess: () => {
      toast.success('Stock adjustment recorded successfully.');
      queryClient.invalidateQueries({ queryKey: ['inventory-adjustments'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-batches'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setQuantity(0);
      setReason('');
      setBatchId('');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Adjustment failed');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return toast.error('Only administrators can adjust inventory');
    if (!batchId || quantity <= 0 || !reason) return toast.error('Please complete all adjustment details');

    mutation.mutate({
      batchId,
      type,
      quantity,
      reason
    });
  };

  if (!isAdmin) {
    return (
      <div className="h-[400px] flex flex-col items-center justify-center space-y-4">
         <ShieldAlert className="w-20 h-20 text-rose-500 animate-pulse" />
         <h2 className="text-2xl font-black text-slate-800">Access Restricted</h2>
         <p className="text-slate-500 italic">This warehouse adjustment control panel is for Administrators only.</p>
         <Button onClick={() => window.history.back()} variant="outline" className="mt-4 rounded-xl px-8 border-slate-200">
            Return to Safety
         </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-amber-100 rounded-2xl">
          <History className="w-6 h-6 text-amber-600" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Stock Adjustments</h1>
          <p className="text-slate-500 text-sm font-bold uppercase tracking-widest opacity-60 flex items-center gap-1 mt-1">
             <AlertCircle className="w-3 h-3" /> Manual Warehouse Balancing
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Adjustment Form (1 Column) */}
        <div className="lg:col-span-1">
           <Card className="border-none shadow-xl shadow-slate-100/50 bg-white overflow-hidden">
              <CardHeader className="bg-slate-900 text-white">
                 <CardTitle className="text-sm font-bold flex items-center gap-2 uppercase tracking-widest">
                    <TrendingDown className="w-4 h-4" /> Correction Entry
                 </CardTitle>
                 <CardDescription className="text-slate-400 italic text-[10px]">
                    Create a manual audit trail for shelf discrepancy.
                 </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                 <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                       <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Select Medicine</Label>
                       <Select value={productId} onValueChange={setProductId}>
                          <SelectTrigger className="h-11 font-bold border-slate-100 bg-slate-50/50 focus:bg-white transition-all">
                             <SelectValue placeholder="Which article needs balancing?" />
                          </SelectTrigger>
                          <SelectContent>
                             {productsData?.map((p: any) => (
                               <SelectItem key={p.id} value={p.id} className="font-bold py-3">{p.name}</SelectItem>
                             ))}
                          </SelectContent>
                       </Select>
                    </div>

                    <div className="space-y-2">
                       <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Identify Batch (LOT)</Label>
                       <Select value={batchId} onValueChange={setBatchId} disabled={!productId}>
                          <SelectTrigger className="h-11 font-bold border-slate-100 bg-slate-50/50 focus:bg-white transition-all">
                             <SelectValue placeholder={productId ? "Target specific lot..." : "Waiting for product..."} />
                          </SelectTrigger>
                          <SelectContent>
                             {batchesData?.map((b: any) => (
                               <SelectItem key={b.id} value={b.id} className="font-bold py-3">
                                  Lot: {b.lotNumber} ({b.quantity} remaining)
                               </SelectItem>
                             ))}
                          </SelectContent>
                       </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Action Type</Label>
                          <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
                             <Button 
                              type="button" 
                              variant={type === 'INCREASE' ? 'default' : 'ghost'} 
                              onClick={() => setType('INCREASE')}
                              className={cn(
                                "flex-1 h-9 rounded-lg font-black text-[10px] uppercase gap-2 transition-all",
                                type === 'INCREASE' ? "bg-emerald-600 shadow-lg text-white" : "text-slate-500"
                              )}
                             >
                                <Plus className="w-3 h-3" /> Increase
                             </Button>
                             <Button 
                              type="button" 
                              variant={type === 'DECREASE' ? 'default' : 'ghost'} 
                              onClick={() => setType('DECREASE')}
                              className={cn(
                                "flex-1 h-9 rounded-lg font-black text-[10px] uppercase gap-2 transition-all",
                                type === 'DECREASE' ? "bg-rose-600 shadow-lg text-white" : "text-slate-500"
                              )}
                             >
                                <Minus className="w-3 h-3" /> Decrease
                             </Button>
                          </div>
                       </div>
                       <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Qty Offset</Label>
                          <Input 
                            type="number" 
                            min="1" 
                            value={quantity || ''}
                            onChange={(e) => setQuantity(Number(e.target.value))}
                            className="h-11 text-center font-black text-lg border-slate-100 bg-slate-50/50"
                          />
                       </div>
                    </div>

                    <div className="space-y-2">
                       <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Reason / Justification</Label>
                       <textarea 
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Why is this change necessary? (e.g., Damaged, Found, Counting Error)"
                        className="w-full rounded-xl border-slate-100 bg-slate-50/50 p-4 text-sm font-medium focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 min-h-[100px] transition-all resize-none italic"
                       />
                    </div>

                    <Button 
                      type="submit" 
                      disabled={mutation.isPending}
                      className="w-full h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-lg shadow-xl shadow-indigo-100 tracking-tight gap-3 transition-transform active:scale-95"
                    >
                       {mutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                       Authorize Adjustment
                    </Button>
                 </form>
              </CardContent>
           </Card>
        </div>

        {/* History Table (2 Columns) */}
        <div className="lg:col-span-2">
           <Card className="border-none shadow-md bg-white overflow-hidden min-h-[600px]">
              <CardHeader className="border-b border-slate-50 py-4 px-6 flex flex-row items-center justify-between">
                 <div>
                    <CardTitle className="text-lg font-black tracking-tight">Adjustment Log</CardTitle>
                    <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Verifiable Shelf Audit Trail</CardDescription>
                 </div>
                 <FileText className="w-6 h-6 text-slate-200" />
              </CardHeader>
              <CardContent className="p-0">
                 {isHistoryLoading ? (
                    <div className="p-20 text-center text-slate-400 italic animate-pulse">Retrieving audit history...</div>
                 ) : !adjustmentsData || adjustmentsData.length === 0 ? (
                    <div className="p-20 text-center opacity-30 flex flex-col items-center gap-4">
                       <ShieldAlert className="w-16 h-16" />
                       <p className="font-black uppercase tracking-widest text-sm italic">Clean Audit: No adjustments recorded.</p>
                    </div>
                 ) : (
                    <Table>
                       <TableHeader className="bg-slate-50/50 text-[10px] font-black uppercase tracking-widest">
                          <TableRow>
                             <TableHead className="py-4 font-bold border-r border-slate-50">Date & Processor</TableHead>
                             <TableHead className="font-bold">Medicinal Targeted</TableHead>
                             <TableHead className="font-bold text-center">Offset</TableHead>
                             <TableHead className="font-bold">Reasoning</TableHead>
                          </TableRow>
                       </TableHeader>
                       <TableBody>
                          {adjustmentsData.map((adj: any) => (
                             <TableRow key={adj.id} className="hover:bg-slate-50/40 transition-colors group">
                                <TableCell className="border-r border-slate-50/50">
                                   <div className="flex flex-col">
                                      <span className="text-slate-800 font-bold tracking-tight">{format(new Date(adj.createdAt), 'dd MMM yyyy')}</span>
                                      <span className="text-[9px] text-slate-400 italic">By: {adj.createdBy?.name || 'System'}</span>
                                   </div>
                                </TableCell>
                                <TableCell>
                                   <div className="flex flex-col">
                                      <span className="font-black text-slate-800 group-hover:text-indigo-600 transition-colors">{adj.inventoryBatch?.product?.name || '---'}</span>
                                      <Badge variant="outline" className="w-fit text-[9px] font-mono tracking-widest bg-white mt-1">Lot: {adj.inventoryBatch?.lotNumber}</Badge>
                                   </div>
                                </TableCell>
                                <TableCell className="text-center">
                                   <div className={cn(
                                      "flex items-center justify-center gap-1.5 font-bold p-1 rounded-xl shadow-inner",
                                      adj.type === 'INCREASE' ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                                   )}>
                                      {adj.type === 'INCREASE' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                      <span className="text-base font-black tracking-tighter">
                                        {adj.type === 'INCREASE' ? '+' : '-'}{adj.quantity}
                                      </span>
                                   </div>
                                </TableCell>
                                <TableCell className="max-w-[150px]">
                                   <p className="text-xs text-slate-500 italic line-clamp-2 leading-relaxed">"{adj.reason}"</p>
                                </TableCell>
                             </TableRow>
                          ))}
                       </TableBody>
                    </Table>
                 )}
              </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}
