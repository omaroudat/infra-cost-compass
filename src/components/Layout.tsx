
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar';
import { 
  BarChart3, 
  Home, 
  LogOut, 
  Settings, 
  TrendingUp, 
  Users,
  Receipt,
  FileSpreadsheet,
  Calculator,
  Percent,
  FileCheck,
  Plus
} from 'lucide-react';
import { LanguageSelector } from './LanguageSelector';
import { UserRole } from '../types/auth';

const AppSidebar = () => {
  const { user, logout, hasPermission } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home, roles: ['admin', 'dataEntry', 'viewer'] as UserRole[] },
    { name: 'BOQ Items', href: '/boq', icon: FileSpreadsheet, roles: ['admin', 'dataEntry'] as UserRole[] },
    { name: 'Break-Down', href: '/breakdown', icon: Calculator, roles: ['admin', 'dataEntry'] as UserRole[] },
    { name: 'WIRs', href: '/wirs', icon: FileCheck, roles: ['admin', 'dataEntry', 'viewer'] as UserRole[] },
    { name: 'Reports', href: '/reports', icon: BarChart3, roles: ['admin', 'dataEntry', 'viewer'] as UserRole[] },
    { name: 'Progress Tracking', href: '/progress', icon: Plus, roles: ['admin', 'dataEntry', 'viewer'] as UserRole[] },
    { name: 'Invoices', href: '/invoices', icon: Receipt, roles: ['admin', 'dataEntry', 'viewer'] as UserRole[] },
    { name: 'Users', href: '/users', icon: Users, roles: ['admin'] as UserRole[] },
  ];

  const filteredNavigation = navigation.filter(item => 
    hasPermission(item.roles)
  );

  return (
    <Sidebar className="bg-slate-800 text-white">
      <SidebarHeader className="border-b border-slate-700 p-6">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center">
            <img 
              src="/lovable-uploads/87571df3-99f0-413c-b984-aa2e1eae6341.png" 
              alt="Company Logo" 
              className="w-12 h-12 object-contain"
            />
          </div>
          <div className="text-center">
            <div className="text-yellow-400 text-sm font-medium mb-1" dir="rtl">
              شركة سعد سعيد الصاعدي
            </div>
            <div className="text-yellow-400 text-xs" dir="rtl">
              وأولاده التضامنية
            </div>
          </div>
          <div className="text-center">
            <h1 className="text-white text-xl font-bold">WIR Management</h1>
            <p className="text-slate-300 text-sm">Construction Financial Manager</p>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="px-4 py-6">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {filteredNavigation.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                return (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActive}
                      className={`
                        w-full text-left px-4 py-3 rounded-lg transition-colors
                        ${isActive 
                          ? 'bg-slate-700 text-white font-medium' 
                          : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                        }
                      `}
                    >
                      <Link to={item.href} className="flex items-center space-x-3">
                        <Icon className="h-5 w-5" />
                        <span>{item.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="border-t border-slate-700 p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="w-full text-slate-300 hover:bg-slate-700 hover:text-white">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="bg-slate-600 text-white">
                      {user?.name?.charAt(0) || user?.username?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="truncate">{user?.name || user?.username}</span>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" className="w-56">
                <div className="px-2 py-1.5 text-sm text-gray-500">
                  {user?.email || user?.username}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  {t('auth.logout') || 'Logout'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-white px-4 shadow-sm">
            <SidebarTrigger className="-ml-1" />
            <div className="ml-auto flex items-center space-x-4">
              <LanguageSelector />
            </div>
          </header>
          <main className="flex-1 p-6 bg-gray-50">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Layout;
