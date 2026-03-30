import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  TrendingUp, 
  Calendar, 
  DollarSign, 
  ShoppingBag, 
  BarChart3,
  ChevronRight,
  Download,
  Filter
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
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';
import { format, subDays } from 'date-fns';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

export default function RevenueReportPage() {
  const [fromDate, setFromDate] = useState(format(subDays(new Date(), 30), 'yyyy-MM-dd'));
  const [toDate, setToDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const { data: reportData, isLoading } = useQuery({
    queryKey: ['report-revenue', fromDate, toDate],
    queryFn: async () => {
      const resp = await reportsService.getRevenueReport({ from: fromDate, to: toDate, groupBy: 'day' });
      return resp.data;
    },
  });

  const chartData = reportData?.chartData || [];
  const stats = reportData?.summary || { totalRevenue: 0, totalOrders: 0, averageDaily: 0 };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-100 rounded-2xl">
            <TrendingUp className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">Revenue Analytics</h1>
            <p className="text-slate-500 text-sm font-bold uppercase tracking-widest opacity-60 flex items-center gap-1 mt-1">
              <Calendar className="w-3 h-3" /> Historical Performance & Growth
            </p>
          </div>
        </div>

        <Card className="border-none shadow-sm bg-white p-2 flex flex-row items-center gap-2">
           <div className="flex items-center gap-2 px-3">
              <span className="text-[10px] font-black uppercase text-slate-400">From</span>
              <Input 
                type="date" 
                value={fromDate} 
                onChange={(e) => setFromDate(e.target.value)}
                className="h-9 border-none bg-slate-50 font-bold text-xs rounded-lg focus-visible:ring-0"
              />
           </div>
           <ChevronRight className="w-4 h-4 text-slate-300" />
           <div className="flex items-center gap-2 px-3">
              <span className="text-[10px] font-black uppercase text-slate-400">To</span>
              <Input 
                type="date" 
                value={toDate} 
                onChange={(e) => setToDate(e.target.value)}
                className="h-9 border-none bg-slate-50 font-bold text-xs rounded-lg focus-visible:ring-0"
              />
           </div>
           <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg hover:bg-slate-100">
              <Download className="w-4 h-4 text-slate-400" />
           </Button>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <Card className="border-none shadow-xl shadow-indigo-100/20 bg-indigo-600 text-white overflow-hidden relative group">
           <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
              <DollarSign className="w-24 h-24" />
           </div>
           <CardContent className="p-6">
              <p className="text-[10px] font-black uppercase tracking-widest text-indigo-200 mb-1">Total Gross Revenue</p>
              <h3 className="text-3xl font-black tracking-tighter">{formatCurrency(stats.totalRevenue)}</h3>
              <div className="mt-4 flex items-center gap-2 text-indigo-200 text-xs font-bold italic">
                 <TrendingUp className="w-4 h-4" /> Based on filtered period
              </div>
           </CardContent>
         </Card>

         <Card className="border-none shadow-xl shadow-slate-100/50 bg-white group">
           <CardContent className="p-6">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Success Orders</p>
              <h3 className="text-3xl font-black text-slate-800 tracking-tighter">{stats.totalOrders}</h3>
              <div className="mt-4 flex items-center gap-2 text-emerald-500 text-xs font-bold italic">
                 <ShoppingBag className="w-4 h-4" /> Transactions completed
              </div>
           </CardContent>
         </Card>

         <Card className="border-none shadow-xl shadow-slate-100/50 bg-white group">
           <CardContent className="p-6">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Daily Average</p>
              <h3 className="text-3xl font-black text-slate-800 tracking-tighter">{formatCurrency(stats.averageDaily)}</h3>
              <div className="mt-4 flex items-center gap-2 text-indigo-500 text-xs font-bold italic">
                 <BarChart3 className="w-4 h-4" /> Operational frequency
              </div>
           </CardContent>
         </Card>
      </div>

      <div className="grid grid-cols-1 gap-6">
         <Card className="border-none shadow-xl shadow-slate-100/50 bg-white overflow-hidden">
            <CardHeader className="p-6 border-b border-slate-50 flex flex-row items-center justify-between">
               <div>
                  <CardTitle className="text-lg font-black tracking-tight">Revenue Trajectory</CardTitle>
                  <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Time-series daily performance</CardDescription>
               </div>
               <Badge className="bg-indigo-50 text-indigo-600 border-none font-bold text-[10px] py-1 px-3">Live Analysis</Badge>
            </CardHeader>
            <CardContent className="p-6">
               <div className="h-[400px] w-full mt-4">
                  {isLoading ? (
                    <div className="w-full h-full flex flex-col items-center justify-center space-y-4 opacity-30">
                       <TrendingUp className="w-12 h-12 animate-pulse" />
                       <p className="font-black uppercase text-sm tracking-widest">Compiling datasets...</p>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis 
                          dataKey="date" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                          tickFormatter={(str) => str ? format(new Date(str), 'dd MMM') : ''}
                        />
                        <YAxis 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                          tickFormatter={(val) => `${val/1000000}M`}
                        />
                        <Tooltip 
                          content={({ active, payload, label }) => {
                            if (active && payload && payload.length && label) {
                              return (
                                <div className="bg-white p-4 shadow-2xl rounded-2xl border border-slate-50 animate-in zoom-in-95 duration-200">
                                  <p className="text-[10px] font-black uppercase text-slate-400 mb-2">{format(new Date(label), 'eeee, dd MMM yyyy')}</p>
                                  <p className="text-lg font-black text-indigo-600 block">{formatCurrency(payload[0].value as number)}</p>
                                  <p className="text-[10px] font-bold text-slate-500 mt-1 uppercase italic">{payload[0].payload.orderCount} Transactions</p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="revenue" 
                          stroke="#4f46e5" 
                          strokeWidth={4} 
                          fillOpacity={1} 
                          fill="url(#colorRevenue)" 
                          animationDuration={2000}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
               </div>
            </CardContent>
         </Card>
      </div>

      <Card className="border-none shadow-xl shadow-slate-100/50 bg-white overflow-hidden">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-6 flex flex-row items-center justify-between">
           <CardTitle className="text-lg font-black flex items-center gap-2">
              <Filter className="w-5 h-5 text-indigo-600" /> Daily Breakdown
           </CardTitle>
           <Button variant="outline" className="h-9 rounded-xl border-slate-200 bg-white px-4 text-xs font-bold italic">
              View Detailed Audit
           </Button>
        </CardHeader>
        <CardContent className="p-0">
           <Table>
             <TableHeader className="bg-slate-100/50 text-[10px] font-black uppercase tracking-widest">
                <TableRow>
                   <TableHead className="py-4 px-6 border-r border-slate-50">Operational Date</TableHead>
                   <TableHead className="text-center">Transactions</TableHead>
                   <TableHead className="text-right">Daily Revenue</TableHead>
                   <TableHead className="text-right px-6">Avg Trans. Value</TableHead>
                </TableRow>
             </TableHeader>
             <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-40 text-center italic text-slate-400 font-medium">Assembling operational logs...</TableCell>
                  </TableRow>
                ) : chartData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-40 text-center italic text-slate-400 font-medium">No financial records for this period.</TableCell>
                  </TableRow>
                ) : (
                  [...chartData].reverse().map((day: any) => (
                    <TableRow key={day.date} className="hover:bg-slate-50/50 transition-colors group">
                       <TableCell className="px-6 py-4 border-r border-slate-50/50">
                          <span className="font-bold text-slate-800">{format(new Date(day.date), 'dd/MM/yyyy')}</span>
                          <span className="ml-2 text-[10px] text-slate-400 font-bold uppercase italic">{format(new Date(day.date), 'EEEE')}</span>
                       </TableCell>
                       <TableCell className="text-center">
                          <span className="text-sm font-black text-slate-900 bg-slate-100 px-3 py-1 rounded-full">{day.orderCount}</span>
                       </TableCell>
                       <TableCell className="text-right font-black text-indigo-600 italic">
                          {formatCurrency(day.revenue)}
                       </TableCell>
                       <TableCell className="text-right px-6 font-bold text-slate-500">
                          {day.orderCount > 0 ? formatCurrency(day.revenue / day.orderCount) : '---'}
                       </TableCell>
                    </TableRow>
                  ))
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
