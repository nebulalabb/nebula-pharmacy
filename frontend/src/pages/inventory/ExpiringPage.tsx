import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  AlertCircle, 
  Calendar, 
  Package, 
  Clock, 
  ChevronRight,
  TrendingDown,
  Timer
} from 'lucide-react';
import { inventoryService } from '@/services/inventory.service';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { format, differenceInDays } from 'date-fns';

export default function ExpiringPage() {
  const [activeDays, setActiveDays] = useState('30');

  const { data: expiringBatches, isLoading } = useQuery({
    queryKey: ['expiring-batches', activeDays],
    queryFn: async () => {
      const days = activeDays === 'expired' ? -1 : Number(activeDays);
      const resp = await inventoryService.getExpiringSoon(days);
      return resp.data;
    },
  });

  const batches = expiringBatches || [];

  const getDayStatus = (expiryDate: string) => {
    const daysLeft = differenceInDays(new Date(expiryDate), new Date());
    if (daysLeft < 0) return { label: 'Expired', color: 'text-rose-600 bg-rose-50 border-rose-100', icon: <AlertCircle className="w-3 h-3" /> };
    if (daysLeft < 30) return { label: `${daysLeft} days remaining`, color: 'text-amber-600 bg-amber-50 border-amber-100', icon: <Timer className="w-3 h-3" /> };
    return { label: `${daysLeft} days remaining`, color: 'text-orange-600 bg-orange-50 border-orange-100', icon: <Clock className="w-3 h-3" /> };
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-rose-100 rounded-2xl">
          <AlertCircle className="w-6 h-6 text-rose-600" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Expiring Soon Alerts</h1>
          <p className="text-slate-500 text-sm font-bold uppercase tracking-widest opacity-60 flex items-center gap-1 mt-1">
            <Timer className="w-3 h-3" /> Quality Control & Risk Mitigation
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1 space-y-4">
           <Card className="border-none shadow-md bg-white">
              <CardHeader className="pb-2">
                 <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-400">Timeframe Registry</CardTitle>
                 <CardDescription className="text-xs italic">Select range to inspect cabinet shelf risk</CardDescription>
              </CardHeader>
              <CardContent className="p-2 pt-0">
                 <Tabs value={activeDays} onValueChange={setActiveDays} orientation="vertical" className="w-full">
                    <TabsList className="flex flex-col h-auto bg-transparent gap-1 p-2">
                       <TabsTrigger value="expired" className="w-full justify-start font-bold py-3 px-4 rounded-xl data-[state=active]:bg-rose-600 data-[state=active]:text-white transition-all gap-3">
                          <AlertCircle className="w-4 h-4" /> Already Expired
                       </TabsTrigger>
                       <TabsTrigger value="30" className="w-full justify-start font-bold py-3 px-4 rounded-xl data-[state=active]:bg-amber-500 data-[state=active]:text-white transition-all gap-3">
                          <Clock className="w-4 h-4" /> Next 30 Days
                       </TabsTrigger>
                       <TabsTrigger value="60" className="w-full justify-start font-bold py-3 px-4 rounded-xl data-[state=active]:bg-orange-500 data-[state=active]:text-white transition-all gap-3">
                          <Timer className="w-4 h-4" /> Next 60 Days
                       </TabsTrigger>
                       <TabsTrigger value="90" className="w-full justify-start font-bold py-3 px-4 rounded-xl data-[state=active]:bg-indigo-600 data-[state=active]:text-white transition-all gap-3">
                          <Calendar className="w-4 h-4" /> Next 90 Days
                       </TabsTrigger>
                    </TabsList>
                 </Tabs>
              </CardContent>
           </Card>

           <div className="p-6 bg-slate-900 rounded-3xl text-white space-y-4 overflow-hidden relative">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                 <Package className="w-32 h-32 -rotate-12" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Safety Tip</p>
              <p className="text-sm font-medium italic relative z-10">
                Products expiring within 30 days should be removed from active shelving or moved to immediate clearance.
              </p>
              <div className="pt-4 flex items-center gap-2 group cursor-pointer text-indigo-400 font-bold text-xs uppercase tracking-widest">
                 Read protocol <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </div>
           </div>
        </div>

        <div className="md:col-span-3">
          <Card className="border-none shadow-xl shadow-slate-100/50 bg-white overflow-hidden min-h-[500px]">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-6">
               <div className="flex justify-between items-center">
                  <CardTitle className="text-lg font-black flex items-center gap-2 tracking-tight">
                     <Package className="w-5 h-5 text-indigo-600" /> Critical Lot List
                  </CardTitle>
                  <span className="text-[10px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded font-black uppercase tracking-widest">
                    {batches.length} Articles Found
                  </span>
               </div>
            </CardHeader>
            <CardContent className="p-0">
               {isLoading ? (
                  <div className="p-20 text-center text-slate-400 italic font-medium animate-pulse">Scanning lot registries...</div>
               ) : batches.length === 0 ? (
                  <div className="p-20 flex flex-col items-center justify-center space-y-4 opacity-30">
                     <Package className="w-16 h-16" />
                     <p className="font-black italic uppercase tracking-[0.2em]">No risk detected in this range.</p>
                  </div>
               ) : (
                  <Table>
                    <TableHeader className="bg-slate-50/30 text-[10px] font-black uppercase tracking-widest">
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="w-[300px] border-r border-slate-50">Medicinal Product</TableHead>
                        <TableHead className="text-center">Batch / Lot</TableHead>
                        <TableHead className="text-center">Status Assessment</TableHead>
                        <TableHead className="text-center">Shelf Qty</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {batches.map((batch: any) => {
                        const status = getDayStatus(batch.expiryDate);
                        return (
                          <TableRow key={batch.id} className="hover:bg-slate-50/50 transition-colors group">
                            <TableCell className="border-r border-slate-50/50">
                              <div className="flex flex-col">
                                <span className="font-black text-slate-800 tracking-tight group-hover:text-rose-600 transition-colors">
                                  {batch.product?.name || '---'}
                                </span>
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5 italic flex items-center gap-1">
                                   <TrendingDown className="w-2.5 h-2.5" /> Unit: {batch.product?.unit}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge variant="outline" className="font-mono font-bold bg-white text-[10px] tracking-widest">
                                {batch.lotNumber}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              <div className="flex flex-col items-center gap-1.5">
                                 <Badge className={cn("px-2 py-0.5 font-black uppercase text-[9px] border-none shadow-sm flex items-center gap-1.5", status.color)}>
                                    {status.icon} {status.label}
                                 </Badge>
                                 <div className="text-[9px] font-bold text-slate-400 tracking-tighter flex items-center gap-1">
                                    <Calendar className="w-2.5 h-2.5" /> Expiry: {format(new Date(batch.expiryDate), 'dd MMM yyyy')}
                                 </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                               <span className="text-xl font-black text-slate-800 tracking-tighter">{batch.quantity}</span>
                            </TableCell>
                          </TableRow>
                        );
                      })}
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
