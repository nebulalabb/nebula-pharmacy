import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CalendarClock, PackageSearch, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface AlertItem {
  id: string;
  name: string;
  type: 'low-stock' | 'expiring';
  value: string | number;
  date?: string;
}

interface InventoryAlertsProps {
  alerts: AlertItem[];
  title?: string;
}

export const InventoryAlerts: React.FC<InventoryAlertsProps> = ({ 
  alerts, 
  title = "Immediate Stock Alerts" 
}) => {
  return (
    <Card className="border-none shadow-md overflow-hidden bg-white h-full flex flex-col">
      <CardHeader className="pb-3 border-b border-slate-50">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-500" />
            {title}
          </CardTitle>
          <Link to="/inventory" className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1 group transition-colors">
            Manage Stock <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </CardHeader>
      <CardContent className="p-0 flex-1 overflow-auto custom-scrollbar max-h-[400px]">
        {alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-6 text-center space-y-3 opacity-60">
            <div className="p-3 bg-slate-50 rounded-full">
              <PackageSearch className="w-6 h-6 text-slate-400" />
            </div>
            <p className="text-sm font-medium text-slate-500 italic">No urgent stock alerts at the moment.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {alerts.map((alert) => (
              <div 
                key={`${alert.type}-${alert.id}`} 
                className="flex items-center justify-between p-4 hover:bg-slate-50 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "p-2.5 rounded-xl transition-colors",
                    alert.type === 'expiring' ? "bg-amber-50 text-amber-600" : "bg-rose-50 text-rose-600"
                  )}>
                    {alert.type === 'expiring' 
                      ? <CalendarClock className="w-5 h-5" /> 
                      : <PackageSearch className="w-5 h-5" />
                    }
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                      {alert.name}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {alert.type === 'expiring' ? `Expires: ${alert.date}` : `Remain: ${alert.value} unit`}
                    </span>
                  </div>
                </div>
                <Badge 
                  variant={alert.type === 'expiring' ? 'outline' : 'destructive'}
                  className={cn(
                    "px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                    alert.type === 'expiring' && "border-amber-200 text-amber-700 bg-amber-50"
                  )}
                >
                  {alert.type === 'expiring' ? 'Expiring' : 'Low Stock'}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
