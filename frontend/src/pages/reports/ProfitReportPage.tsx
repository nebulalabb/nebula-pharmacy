import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  PieChart, 
  Wallet, 
  ArrowUpRight, 
  Scale, 
  Target,
  BarChart2,
  Calendar,
  ChevronRight,
  Calculator
} from 'lucide-react';
import { reportsService } from '@/services/reports.service';
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
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';
import { format, startOfYear } from 'date-fns';
import { cn } from '@/lib/utils';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

export default function ProfitReportPage() {
  const [fromDate, setFromDate] = useState(format(startOfYear(new Date()), 'yyyy-MM-dd'));
  const [toDate, setToDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const { data: profitData, isLoading } = useQuery({
    queryKey: ['report-profit', fromDate, toDate],
    queryFn: async () => {
      const resp = await reportsService.getProfitReport({ from: fromDate, to: toDate });
      return resp.data;
    },
  });

  const monthsData = profitData?.monthlyData || [];
  const summary = profitData?.summary || { totalRevenue: 0, totalCOGS: 0, grossProfit: 0, profitMargin: 0 };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-emerald-100 rounded-2xl">
            <PieChart className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">Financial Health</h1>
            <p className="text-slate-500 text-sm font-bold uppercase tracking-widest opacity-60 flex items-center gap-1 mt-1">
              <Scale className="w-3 h-3" /> Profitability & Margin Integrity
            </p>
          </div>
        </div>

        <Card className="border-none shadow-sm bg-white p-2 flex flex-row items-center gap-2">
           <div className="flex items-center gap-2 px-3">
              <span className="text-[10px] font-black uppercase text-slate-400">Start</span>
              <Input 
                type="date" 
                value={fromDate} 
                onChange={(e) => setFromDate(e.target.value)}
                className="h-9 border-none bg-slate-50 font-bold text-xs rounded-lg focus-visible:ring-0"
              />
           </div>
           <ChevronRight className="w-4 h-4 text-slate-300" />
           <div className="flex items-center gap-2 px-3">
              <span className="text-[10px] font-black uppercase text-slate-400">End</span>
              <Input 
                type="date" 
                value={toDate} 
                onChange={(e) => setToDate(e.target.value)}
                className="h-9 border-none bg-slate-50 font-bold text-xs rounded-lg focus-visible:ring-0"
              />
           </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         <Card className="border-none shadow-xl shadow-slate-100/50 bg-white overflow-hidden relative group md:col-span-2">
            <div className="absolute top-0 right-0 p-8 opacity-5">
               <Calculator className="w-40 h-40" />
            </div>
            <CardContent className="p-8 flex flex-col justify-between h-full">
               <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 italic">Retained Earnings (Gross Profit)</p>
                  <h3 className="text-5xl font-black text-emerald-600 tracking-tighter">
                    {formatCurrency(summary.grossProfit)}
                  </h3>
               </div>
               <div className="mt-8 grid grid-cols-2 gap-8 border-t border-slate-50 pt-6">
                  <div>
                     <p className="text-[10px] font-black uppercase text-slate-400">Revenue</p>
                     <p className="text-xl font-bold text-slate-800">{formatCurrency(summary.totalRevenue)}</p>
                  </div>
                  <div>
                     <p className="text-[10px] font-black uppercase text-slate-400 text-rose-400">COGS (Stock Cost)</p>
                     <p className="text-xl font-bold text-rose-500">-{formatCurrency(summary.totalCOGS)}</p>
                  </div>
               </div>
            </CardContent>
         </Card>

         <Card className="border-none shadow-xl shadow-emerald-100/20 bg-emerald-600 text-white group overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-10">
               <Target className="w-20 h-20" />
            </div>
            <CardContent className="p-6 flex flex-col items-center justify-center h-full text-center">
               <p className="text-[10px] font-black uppercase tracking-widest text-emerald-200 mb-3">Profit Margin</p>
               <div className="text-6xl font-black tracking-tighter mb-2">{summary.profitMargin}%</div>
               <Badge className="bg-emerald-500/30 text-emerald-50 border-emerald-400/30 font-black tracking-widest text-[9px] uppercase px-4 py-1">Business Efficiency</Badge>
            </CardContent>
         </Card>

         <Card className="border-none shadow-xl shadow-slate-100/50 bg-white overflow-hidden">
            <CardHeader className="bg-slate-50/50 p-6 border-b border-slate-50">
               <CardTitle className="text-xs font-black uppercase tracking-widest text-slate-400">Insight Summary</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
               <div className="flex items-center gap-4">
                  <div className="p-3 bg-indigo-50 rounded-xl">
                     <Wallet className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div className="flex-1">
                     <p className="text-[10px] font-black text-slate-400 uppercase">Avg / Month</p>
                     <p className="text-sm font-black text-slate-800">{formatCurrency(summary.grossProfit / (monthsData.length || 1))}</p>
                  </div>
               </div>
               <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p className="text-[9px] font-bold text-slate-500 uppercase flex items-center gap-1.5 mb-2">
                    <ArrowUpRight className="w-3 h-3 text-emerald-500" /> Performance Delta
                  </p>
                  <p className="text-xs font-medium italic text-slate-600 leading-relaxed italic">
                    Profitability is currently stabilizing at {summary.profitMargin}%, matching industry benchmarks.
                  </p>
               </div>
            </CardContent>
         </Card>
      </div>

      <div className="grid grid-cols-1 gap-6">
         <Card className="border-none shadow-xl shadow-slate-100/50 bg-white overflow-hidden">
            <CardHeader className="p-6 border-b border-slate-50 flex flex-row items-center justify-between bg-slate-50/20">
               <div>
                  <CardTitle className="text-lg font-black tracking-tight">Revenue vs. Profit Dynamics</CardTitle>
                  <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Monthly Comparative Fiscal Analysis</CardDescription>
               </div>
               <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                     <div className="w-2.5 h-2.5 bg-indigo-600 rounded-full" />
                     <span className="text-[9px] font-black uppercase text-slate-400">Revenue</span>
                  </div>
                  <div className="flex items-center gap-2">
                     <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />
                     <span className="text-[9px] font-black uppercase text-slate-400">Profit</span>
                  </div>
               </div>
            </CardHeader>
            <CardContent className="p-6">
               <div className="h-[400px] w-full mt-4">
                  {isLoading ? (
                    <div className="w-full h-full flex items-center justify-center opacity-30 select-none">
                       <BarChart2 className="w-12 h-12 animate-pulse" />
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={monthsData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }} barGap={8}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis 
                          dataKey="month" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                          tickFormatter={(str) => str ? format(new Date(str), 'MMM yyyy') : ''}
                        />
                        <YAxis 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                          tickFormatter={(val) => `${val/1000000}M`}
                        />
                        <Tooltip 
                          cursor={{ fill: '#f8fafc' }}
                          content={({ active, payload, label }) => {
                            if (active && payload && payload.length && label) {
                              return (
                                <div className="bg-slate-900 p-4 shadow-2xl rounded-2xl border-none animate-in fade-in zoom-in-95 duration-200">
                                  <p className="text-[10px] font-black uppercase text-slate-500 mb-3 tracking-widest">{format(new Date(label), 'MMMM yyyy')}</p>
                                  <div className="space-y-2">
                                     <div className="flex items-center justify-between gap-8">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase">Rev</span>
                                        <span className="text-sm font-black text-white">{formatCurrency(payload[0].value as number)}</span>
                                     </div>
                                     <div className="flex items-center justify-between gap-8">
                                        <span className="text-[10px] font-bold text-emerald-400 uppercase">Pro</span>
                                        <span className="text-sm font-black text-emerald-400">{formatCurrency(payload[1].value as number)}</span>
                                     </div>
                                     <div className="h-0.5 bg-slate-800 my-2" />
                                     <div className="flex items-center justify-between gap-8">
                                        <span className="text-[9px] font-bold text-slate-500 uppercase">Margin</span>
                                        <span className="text-xs font-black text-white italic">{((payload[1].value as number) / (payload[0].value as number) * 100).toFixed(1)}%</span>
                                     </div>
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Bar 
                          dataKey="revenue" 
                          fill="#4f46e5" 
                          radius={[6, 6, 0, 0]} 
                          barSize={32}
                          animationDuration={1500}
                        />
                        <Bar 
                          dataKey="profit" 
                          fill="#10b981" 
                          radius={[6, 6, 0, 0]} 
                          barSize={32}
                          animationDuration={2000}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
               </div>
            </CardContent>
         </Card>
      </div>

      <Card className="border-none shadow-xl shadow-slate-100/50 bg-white overflow-hidden">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-6 flex flex-row items-center justify-between">
           <CardTitle className="text-lg font-black flex items-center gap-2 tracking-tight">
              <Calendar className="w-5 h-5 text-emerald-600" /> Fiscal Log (Monthly Performance)
           </CardTitle>
           <div className="flex gap-2">
              <Button variant="outline" className="h-9 rounded-xl border-slate-200 bg-white px-4 text-xs font-bold text-slate-500">
                 Monthly Comparison
              </Button>
           </div>
        </CardHeader>
        <CardContent className="p-0">
           <Table>
             <TableHeader className="bg-slate-100/50 text-[10px] font-black uppercase tracking-widest opacity-80">
                <TableRow>
                   <TableHead className="py-4 px-6 border-r border-slate-100">Reporting Month</TableHead>
                   <TableHead className="text-right">Total Revenue</TableHead>
                   <TableHead className="text-right">COGS (Expenditure)</TableHead>
                   <TableHead className="text-right">Gross Profit</TableHead>
                   <TableHead className="text-center px-6">Margin Ratio</TableHead>
                </TableRow>
             </TableHeader>
             <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-40 text-center italic text-slate-400 font-medium">Computing fiscal datasets...</TableCell>
                  </TableRow>
                ) : monthsData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-40 text-center italic text-slate-400 font-medium">No financial performance records found.</TableCell>
                  </TableRow>
                ) : (
                  [...monthsData].reverse().map((month: any) => {
                    const margin = (month.profit / month.revenue) * 100;
                    return (
                      <TableRow key={month.month} className="hover:bg-slate-50/50 transition-colors group">
                         <TableCell className="px-6 py-4 border-r border-slate-100/50">
                            <span className="font-black text-slate-800 tracking-tight">{format(new Date(month.month), 'MMMM yyyy')}</span>
                         </TableCell>
                         <TableCell className="text-right font-bold text-slate-700">
                            {formatCurrency(month.revenue)}
                         </TableCell>
                         <TableCell className="text-right font-bold text-rose-400 italic">
                            -{formatCurrency(month.cogs || (month.revenue - month.profit))}
                         </TableCell>
                         <TableCell className="text-right font-black text-emerald-600">
                            {formatCurrency(month.profit)}
                         </TableCell>
                         <TableCell className="text-center px-6">
                            <Badge className={cn(
                              "font-black tracking-widest text-[10px] border-none shadow-sm px-3",
                              margin > 20 ? "bg-emerald-100 text-emerald-700" : "bg-orange-100 text-orange-700"
                            )}>
                              {margin.toFixed(1)}%
                            </Badge>
                         </TableCell>
                      </TableRow>
                    );
                  })
                )}
             </TableBody>
           </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function Badge({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${className}`}>
      {children}
    </div>
  );
}
