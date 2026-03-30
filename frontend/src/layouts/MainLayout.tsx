import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';

const MainLayout: React.FC = () => {
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans antialiased text-slate-900">
      {/* Sidebar for Desktop */}
      <Sidebar className="hidden lg:flex flex-shrink-0" />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden relative">
        <Header />

        {/* Content Section */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 lg:p-8 custom-scrollbar relative">
          {/* Subtle background decoration */}
          <div className="absolute top-0 right-0 -z-10 w-96 h-96 bg-indigo-50/50 rounded-full blur-3xl opacity-50" />
          <div className="absolute bottom-0 left-0 -z-10 w-96 h-96 bg-violet-50/50 rounded-full blur-3xl opacity-50" />

          {/* Page Outlet */}
          <div className="max-w-7xl mx-auto animate-in fade-in duration-700">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
