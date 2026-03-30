import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Pill, 
  ShoppingBag, 
  ShoppingCart, 
  Warehouse, 
  BarChart3, 
  Truck, 
  Tags, 
  Users, 
  X,
  History,
  CalendarClock,
  Settings2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth.store';
import { Separator } from '@/components/ui/separator';

interface SidebarProps {
  onClose?: () => void;
  className?: string;
}

interface MenuItem {
  title: string;
  path: string;
  icon: React.ElementType;
  adminOnly?: boolean;
  subItems?: { title: string; path: string; icon: React.ElementType }[];
}

const menuItems: MenuItem[] = [
  { title: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { title: 'Danh mục thuốc', path: '/products', icon: Pill },
  { title: 'Bán hàng (POS)', path: '/pos', icon: ShoppingCart },
  { title: 'Lịch sử bán', path: '/sales-history', icon: History },
  { title: 'Nhập hàng', path: '/purchase-orders', icon: ShoppingBag, adminOnly: true },
  { 
    title: 'Tồn kho', 
    path: '/inventory', 
    icon: Warehouse,
    subItems: [
      { title: 'Quản lý lô hàng', path: '/inventory', icon: Warehouse },
      { title: 'Sắp hết hạn', path: '/inventory/expiring', icon: CalendarClock },
      { title: 'Điều chỉnh tồn', path: '/inventory/adjustments', icon: Settings2 },
    ]
  },
  { title: 'Nhà cung cấp', path: '/suppliers', icon: Truck, adminOnly: true },
  { title: 'Nhóm thuốc', path: '/categories', icon: Tags, adminOnly: true },
  { title: 'Báo cáo', path: '/reports', icon: BarChart3, adminOnly: true },
  { title: 'Cài đặt', path: '/settings/users', icon: Users, adminOnly: true },
];

export const Sidebar: React.FC<SidebarProps> = ({ onClose, className }) => {
  const { user } = useAuthStore();
  const location = useLocation();

  const filteredMenu = menuItems.filter(item => !item.adminOnly || user?.role === 'ADMIN');

  return (
    <div className={cn("flex flex-col h-full bg-slate-900 text-slate-300 w-64 border-r border-slate-800", className)}>
      {/* Brand Header */}
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600 rounded-lg">
            <Pill className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">Nebula</span>
        </div>
        {onClose && (
          <button onClick={onClose} className="lg:hidden p-1 hover:bg-slate-800 rounded">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <Separator className="bg-slate-800" />

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
        {filteredMenu.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          
          return (
            <div key={item.path} className="space-y-1">
              <NavLink
                to={item.path}
                onClick={onClose}
                className={({ isActive }) => cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative",
                  isActive 
                    ? "bg-indigo-600/10 text-indigo-400 font-medium" 
                    : "hover:bg-slate-800 hover:text-white"
                )}
              >
                <item.icon className={cn(
                  "w-5 h-5 transition-transform duration-200 group-hover:scale-110",
                  isActive ? "text-indigo-400" : "text-slate-400 group-hover:text-white"
                )} />
                <span className="flex-1">{item.title}</span>
                {isActive && (
                  <div className="absolute left-0 w-1 h-6 bg-indigo-500 rounded-r-full" />
                )}
              </NavLink>

              {/* Render sub-items if active or special sections */}
              {isActive && item.subItems && (
                <div className="pl-11 space-y-1 animate-in slide-in-from-top-2 duration-300">
                  {item.subItems.map((sub) => (
                    <NavLink
                      key={sub.path}
                      to={sub.path}
                      className={({ isActive }) => cn(
                        "block py-1.5 text-sm transition-colors",
                        isActive ? "text-indigo-400 font-medium" : "text-slate-500 hover:text-slate-300"
                      )}
                    >
                      {sub.title}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer / User Preview */}
      <div className="p-4 bg-slate-950/50">
        <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-900 border border-slate-800">
          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-300">
            {user?.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium text-white truncate">{user?.name}</p>
            <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">{user?.role}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
