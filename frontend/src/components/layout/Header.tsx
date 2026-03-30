import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Search, 
  User, 
  LogOut, 
  Settings, 
  Menu,
  AlertTriangle,
  Bell,
} from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/auth.store';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Sidebar } from './Sidebar';

const routeTitleMap: Record<string, string> = {
  '/dashboard': 'Dashboard Overview',
  '/products': 'Medicine Directory',
  '/pos': 'Point of Sale (POS)',
  '/sales-history': 'Sales History',
  '/purchase-orders': 'Purchase Orders',
  '/inventory': 'Stock Management',
  '/inventory/expiring': 'Expiring Soon',
  '/inventory/adjustments': 'Stock Adjustments',
  '/suppliers': 'Supplier Management',
  '/categories': 'Medicine Categories',
  '/reports': 'Financial Reports',
  '/settings/users': 'User Management',
};

export const Header: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const getPageTitle = () => {
    return routeTitleMap[location.pathname] || 'Nebula Pharmacy';
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-16 border-b bg-white flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30 shadow-sm animate-in slide-in-from-top duration-500">
      <div className="flex items-center gap-4">
        {/* Mobile Menu Trigger */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden">
              <Menu className="w-5 h-5 text-slate-600" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64 border-none">
            <Sidebar />
          </SheetContent>
        </Sheet>

        <h2 className="text-xl font-bold text-slate-800 tracking-tight hidden sm:block">
          {getPageTitle()}
        </h2>
      </div>

      <div className="flex items-center gap-3 lg:gap-6">
        {/* Search Bar Placeholder */}
        <div className="hidden md:flex items-center bg-slate-50 border border-slate-200 rounded-full px-3 py-1.5 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent transition-all">
          <Search className="w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search anything..." 
            className="bg-transparent border-none focus:ring-0 text-sm w-48 text-slate-700 placeholder:text-slate-400"
          />
        </div>

        {/* Stock Notifications */}
        <div className="flex items-center gap-2 pr-2 lg:pr-4 border-r border-slate-200">
          <Button variant="ghost" size="icon" className="relative hover:bg-slate-100 rounded-full">
            <Bell className="w-5 h-5 text-slate-600" />
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
          </Button>
          
          <div className="hidden lg:flex flex-col text-right">
            <div className="flex items-center gap-1.5 justify-end">
              <Badge variant="destructive" className="px-1.5 py-0 text-[10px] font-bold h-4">
                <AlertTriangle className="w-3 h-3 mr-1" /> 5 Low Stock
              </Badge>
            </div>
            <span className="text-[10px] text-slate-400 font-medium">Alerts monitored</span>
          </div>
        </div>

        {/* User Account Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="p-0 h-10 w-10 lg:w-fit lg:px-2 rounded-full lg:rounded-lg flex items-center gap-3 hover:bg-slate-50 transition-colors">
              <Avatar className="h-9 w-9 border-2 border-white shadow-sm ring-1 ring-slate-100">
                <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-indigo-700 text-white font-bold">
                  {user?.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="hidden lg:flex flex-col items-start leading-none">
                <span className="text-sm font-semibold text-slate-800">{user?.name}</span>
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mt-1">{user?.role}</span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 p-1 border-slate-200 shadow-xl rounded-xl">
            <DropdownMenuLabel className="font-semibold text-slate-900 px-3 py-2">My Account</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-slate-100" />
            <DropdownMenuItem className="rounded-lg focus:bg-indigo-50 px-3 py-2 cursor-pointer group">
              <User className="mr-3 h-4 w-4 text-slate-400 group-hover:text-indigo-600" />
              <span>Profile Settings</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="rounded-lg focus:bg-indigo-50 px-3 py-2 cursor-pointer group">
              <Settings className="mr-3 h-4 w-4 text-slate-400 group-hover:text-indigo-600" />
              <span>System Preferences</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-slate-100" />
            <DropdownMenuItem 
              onClick={handleLogout}
              className="rounded-lg focus:bg-red-50 text-red-600 px-3 py-2 cursor-pointer group"
            >
              <LogOut className="mr-3 h-4 w-4 text-red-400 group-hover:text-red-600" />
              <span className="font-medium">Sign Out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};
