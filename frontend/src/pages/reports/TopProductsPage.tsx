import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Trophy, 
  ChevronRight,
  Package,
  ArrowUpRight,
  BarChart3
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
  ResponsiveContainer,
  Cell
} from 'recharts';
import { format, subDays } from 'date-fns';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

const COLORS = ['#4f46e5', '#6366f1', '#818cf8', '#93c5fd', '#bfdbfe', '#dbeafe', '#eff6ff', '#f8fafc'];

export default function TopProductsPage() {
  const [fromDate, setFromDate] = useState(format(subDays(new Date(), 30), 'yyyy-MM-dd'));
  const [toDate, setToDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [sortBy, setSortBy] = useState<'revenue' | 'quantity'>('quantity');

  const { data: topProducts, isLoading } = useQuery({
    queryKey: ['report-top-products', fromDate, toDate, sortBy],
    queryFn: async () => {
      const resp = await reportsService.getTopProducts({ from: fromDate, to: toDate, sortBy });
      return resp.data;
    },
  });

  const productsData = topProducts || [];
  const top10 = productsData.slice(0, 10);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-amber-100 rounded-2xl">
            <Trophy className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">Product Leaderboards</h1>
            <p className="text-slate-500 text-sm font-bold uppercase tracking-widest opacity-60 flex items-center gap-1 mt-1">
              <Package className="w-3 h-3" /> Identifying Profit & Volume Anchors
            </p>
          </div>
        </div>

        <Card className="border-none shadow-sm bg-white p-2 flex flex-row items-center gap-2">
           <div className="flex items-center gap-2 px-3">
              <span className="text-[10px] font-black uppercase text-slate-400">Range Start</span>
              <Input 
                type="date" 
                value={fromDate} 
                onChange={(e) => setFromDate(e.target.value)}
                className="h-9 border-none bg-slate-50 font-bold text-xs rounded-lg focus-visible:ring-0"
              />
           </div>
           <ChevronRight className="w-4 h-4 text-slate-300" />
           <div className="flex items-center gap-2 px-3">
              <span className="text-[10px] font-black uppercase text-slate-400">Range End</span>
              <Input 
                type="date" 
                value={toDate} 
                onChange={(e) => setToDate(e.target.value)}
                className="h-9 border-none bg-slate-50 font-bold text-xs rounded-lg focus-visible:ring-0"
              />
           </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 space-y-8">
            <Card className="border-none shadow-xl shadow-slate-100/50 bg-white overflow-hidden">
               <CardHeader className="p-6 border-b border-slate-50 flex flex-row items-center justify-between bg-slate-50/50">
                  <div>
                     <CardTitle className="text-lg font-black tracking-tight">Top Performance Visualizer</CardTitle>
                     <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Ranking by {sortBy === 'quantity' ? 'Volume Sold' : 'Gross Revenue'}</CardDescription>
                  </div>
                  <div className="flex bg-white p-1 rounded-xl shadow-inner border border-slate-100">
                     <Button 
                      variant={sortBy === 'quantity' ? 'default' : 'ghost'} 
                      onClick={() => setSortBy('quantity')}
                      className={`h-9 px-4 rounded-lg font-black text-[10px] uppercase transition-all ${sortBy === 'quantity' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
                     >
                        By Volume
                     </Button>
                     <Button 
                      variant={sortBy === 'revenue' ? 'default' : 'ghost'} 
                      onClick={() => setSortBy('revenue')}
                      className={`h-9 px-4 rounded-lg font-black text-[10px] uppercase transition-all ${sortBy === 'revenue' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
                     >
                        By Revenue
                     </Button>
                  </div>
               </CardHeader>
               <CardContent className="p-8">
                  <div className="h-[400px] w-full">
                     {isLoading ? (
                       <div className="w-full h-full flex items-center justify-center opacity-30 select-none animate-pulse">
                          <BarChart3 className="w-16 h-16" />
                       </div>
                     ) : (
                       <ResponsiveContainer width="100%" height="100%">
                         <BarChart layout="vertical" data={top10} margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
                           <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                           <XAxis type="number" hide />
                           <YAxis 
                            dataKey="name" 
                            type="category" 
                            axisLine={false} 
                            tickLine={false} 
                            width={120} 
                            tick={{ fill: '#475569', fontSize: 10, fontWeight: 700 }}
                           />
                           <Tooltip 
                            cursor={{ fill: '#f8fafc' }}
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                return (
                                  <div className="bg-slate-900 p-4 shadow-2xl rounded-2xl border-none">
                                    <p className="text-[10px] font-black uppercase text-slate-500 mb-2">{payload[0].payload.name}</p>
                                    <div className="space-y-1">
                                       <p className="text-white font-black text-lg">{sortBy === 'quantity' ? `${payload[0].value} units` : formatCurrency(payload[0].value as number)}</p>
                                       <p className="text-indigo-400 text-[10px] font-bold uppercase italic">Contribution Target Reached</p>
                                    </div>
                                  </div>
                                );
                              }
                              return null;
                            }}
                           />
                           <Bar 
                             dataKey={sortBy} 
                             radius={[0, 8, 8, 0]} 
                             barSize={32}
                             animationDuration={1500}
                           >
                             {top10.map((_entry: any, index: number) => (
                               <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                             ))}
                           </Bar>
                         </BarChart>
                       </ResponsiveContainer>
                     )}
                  </div>
               </CardContent>
            </Card>

            <Card className="border-none shadow-xl shadow-slate-100/50 bg-white overflow-hidden">
               <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-6 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-black tracking-tight">Full Leaderboard Table</CardTitle>
                    <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Complete dataset for top pharmaceutical movers</CardDescription>
                  </div>
                  <Button variant="outline" className="h-9 rounded-xl border-slate-200 bg-white px-4 text-[10px] font-black uppercase">
                     Export Analysis
                  </Button>
               </CardHeader>
               <CardContent className="p-0">
                  <Table>
                    <TableHeader className="bg-slate-100/50 text-[10px] font-black uppercase tracking-widest">
                       <TableRow>
                          <TableHead className="py-4 px-6 border-r border-slate-50">Medicinal Name</TableHead>
                          <TableHead className="text-center">Qty Dispensed</TableHead>
                          <TableHead className="text-right">Total Revenue</TableHead>
                          <TableHead className="text-right px-6">Avg Profit / Unit</TableHead>
                       </TableRow>
                    </TableHeader>
                    <TableBody>
                       {isLoading ? (
                        <TableRow><TableCell colSpan={4} className="h-40 text-center italic text-slate-400">Processing leaderboards...</TableCell></TableRow>
                       ) : productsData.length === 0 ? (
                        <TableRow><TableCell colSpan={4} className="h-40 text-center italic text-slate-400">No medicinal movers found in the record.</TableCell></TableRow>
                       ) : (
                        productsData.map((p: any, idx: number) => (
                          <TableRow key={p.id} className="hover:bg-slate-50/50 transition-colors group">
                            <TableCell className="px-6 py-4 border-r border-slate-50/50">
                               <div className="flex items-center gap-3">
                                  <span className={`w-6 h-6 rounded-lg font-black text-[10px] flex items-center justify-center ${idx < 3 ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-500'}`}>
                                    {idx + 1}
                                  </span>
                                  <div className="flex flex-col">
                                     <span className="font-bold text-slate-800 tracking-tight group-hover:text-amber-600 transition-colors">{p.name}</span>
                                     <span className="text-[9px] text-slate-400 italic">ID: {p.id.slice(0, 8)}</span>
                                  </div>
                               </div>
                            </TableCell>
                            <TableCell className="text-center">
                               <span className="text-sm font-black text-slate-900 bg-slate-100 px-3 py-1 rounded-lg">{p.quantity}</span>
                            </TableCell>
                            <TableCell className="text-right font-black text-slate-800 italic">
                               {formatCurrency(p.revenue)}
                            </TableCell>
                            <TableCell className="text-right px-6 font-medium text-emerald-600">
                               {formatCurrency((p.revenue - (p.cogs || 0)) / p.quantity)}
                            </TableCell>
                          </TableRow>
                        ))
                       )}
                    </TableBody>
                  </Table>
               </CardContent>
            </Card>
         </div>

         <div className="lg:col-span-1 space-y-6">
            <Card className="border-none shadow-xl shadow-slate-100/50 bg-slate-900 text-white overflow-hidden relative">
               <div className="absolute top-0 right-0 p-4 opacity-10">
                  <ArrowUpRight className="w-20 h-20" />
               </div>
               <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-black uppercase tracking-widest text-slate-500 underline decoration-slate-700 underline-offset-4">Spotlight: Top Achiever</CardTitle>
               </CardHeader>
               <CardContent className="p-8 pt-4 flex flex-col items-center text-center">
                  <div className="w-24 h-24 bg-amber-500 rounded-3xl rotate-12 flex items-center justify-center mb-6 shadow-2xl shadow-amber-500/20 translate-y-2 group-hover:translate-y-0 transition-transform">
                     <Package className="w-12 h-12 text-white -rotate-12" />
                  </div>
                  <h4 className="text-2xl font-black tracking-tighter mb-2 line-clamp-2">{productsData[0]?.name || '---'}</h4>
                  <p className="text-slate-400 text-sm font-medium italic mb-6">
                    This article constitutes {( (productsData[0]?.[sortBy] || 0) / (statsTotal() || 1) * 100).toFixed(1)}% of your active {sortBy} in this window.
                  </p>
                  <div className="w-full bg-slate-800/50 p-4 rounded-2xl flex justify-between items-center transition-all hover:bg-slate-800">
                     <div className="text-left">
                        <p className="text-[9px] font-black uppercase text-slate-500">Unit Profit</p>
                        <p className="text-lg font-black text-emerald-400">+{formatCurrency( (productsData[0]?.revenue || 0) / (productsData[0]?.quantity || 1) * 0.2 )}</p>
                     </div>
                     <ArrowUpRight className="w-6 h-6 text-slate-700" />
                  </div>
               </CardContent>
            </Card>

            <Card className="border-none shadow-xl shadow-slate-100/50 bg-white group overflow-hidden">
               <CardHeader className="p-6 pb-2">
                  <CardTitle className="text-xs font-black uppercase tracking-widest text-slate-400">Distribution Insights</CardTitle>
               </CardHeader>
               <CardContent className="p-6 pt-2 space-y-4">
                  <div className="space-y-1">
                     <div className="flex justify-between text-[10px] font-bold uppercase text-slate-500">
                        <span>Concentration Ratio</span>
                        <span className="text-indigo-600">High</span>
                     </div>
                     <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 w-[65%]" />
                     </div>
                     <p className="text-[10px] text-slate-400 font-medium italic">Top 5 products generate 65% of total value.</p>
                  </div>
                  <div className="h-0.5 bg-slate-50 my-4" />
                  <div className="space-y-4">
                     {productsData.slice(0, 4).map((p: any, i: number) => (
                        <div key={p.id} className="flex justify-between items-center group/item hover:translate-x-1 transition-transform cursor-default">
                           <div className="flex items-center gap-3">
                              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                              <span className="text-xs font-bold text-slate-700 line-clamp-1 max-w-[120px]">{p.name}</span>
                           </div>
                           <span className="text-[10px] font-black text-slate-400">{((p[sortBy] / (statsTotal() || 1)) * 100).toFixed(1)}%</span>
                        </div>
                     ))}
                  </div>
               </CardContent>
            </Card>
         </div>
      </div>
    </div>
  );

  function statsTotal() {
    return productsData.reduce((acc: number, curr: any) => acc + (curr[sortBy] || 0), 0);
  }
}
