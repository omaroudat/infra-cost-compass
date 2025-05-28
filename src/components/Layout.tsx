
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
    <Sidebar className="bg-gradient-to-b from-blue-900 via-blue-800 to-blue-900 text-white border-r-2 border-blue-700">
      <SidebarHeader className="border-b border-blue-700/50 p-8 bg-gradient-to-r from-blue-800/50 to-blue-900/50">
        <div className="flex flex-col items-center space-y-6">
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-br from-amber-300 to-amber-500 rounded-full flex items-center justify-center shadow-lg border-2 border-amber-400">
              <img 
                src="/lovable-uploads/454de6d4-afed-4b33-b065-ade01eb9065a.png" 
                alt="Company Logo" 
                className="w-16 h-16 object-contain"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white"></div>
          </div>
          
          <div className="text-center space-y-2">
            <div className="text-amber-300 text-lg font-bold tracking-wide" dir="rtl">
              شركة سعد سعيد الصاعدي
            </div>
            <div className="text-amber-200 text-sm font-medium" dir="rtl">
              وأولاده التضامنية
            </div>
            <div className="h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent w-full my-3"></div>
            <div className="text-center">
              <h1 className="text-white text-xl font-bold bg-gradient-to-r from-blue-100 to-blue-200 bg-clip-text text-transparent">
                WIR Management System
              </h1>
              <p className="text-blue-200 text-sm font-medium">Construction Financial Manager</p>
            </div>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="px-6 py-8 bg-gradient-to-b from-transparent to-blue-900/30">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-3">
              {filteredNavigation.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                return (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActive}
                      className={`
                        w-full text-left px-6 py-4 rounded-xl transition-all duration-300 group
                        ${isActive 
                          ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold shadow-lg transform scale-105 border border-blue-500' 
                          : 'text-blue-100 hover:bg-gradient-to-r hover:from-blue-700 hover:to-blue-800 hover:text-white hover:shadow-md hover:transform hover:scale-102'
                        }
                      `}
                    >
                      <Link to={item.href} className="flex items-center space-x-4 w-full">
                        <div className={`p-2 rounded-lg ${isActive ? 'bg-blue-500/30' : 'bg-blue-800/50 group-hover:bg-blue-600/50'} transition-colors`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <span className="font-medium">{item.name}</span>
                        {isActive && <div className="ml-auto w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="border-t border-blue-700/50 p-6 bg-gradient-to-r from-blue-800/50 to-blue-900/50">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="w-full text-blue-100 hover:bg-blue-700/50 hover:text-white rounded-xl p-4 transition-all duration-300">
                  <div className="flex items-center space-x-3 w-full">
                    <Avatar className="h-10 w-10 border-2 border-blue-400">
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white font-bold">
                        {user?.name?.charAt(0) || user?.username?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-left">
                      <div className="font-medium text-white truncate">{user?.name || user?.username}</div>
                      <div className="text-xs text-blue-200 truncate">{user?.role}</div>
                    </div>
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" className="w-56 bg-white/95 backdrop-blur-sm">
                <div className="px-3 py-2 text-sm text-gray-600 border-b">
                  {user?.email || user?.username}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-red-600 hover:bg-red-50 focus:bg-red-50">
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
          <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-white px-6 shadow-sm">
            <SidebarTrigger className="-ml-1 hover:bg-blue-50" />
            <div className="ml-auto flex items-center space-x-4">
              <LanguageSelector />
            </div>
          </header>
          <main className="flex-1 p-8 bg-gradient-to-br from-gray-50 to-gray-100">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Layout;
