
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
  Plus,
  Building2,
  Sparkles
} from 'lucide-react';
import { LanguageSelector } from './LanguageSelector';
import { UserRole } from '../types/auth';

const AppSidebar = () => {
  const { user, logout, hasPermission } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home, roles: ['admin', 'dataEntry', 'viewer'] as UserRole[], color: 'from-blue-500 to-blue-600' },
    { name: 'BOQ Items', href: '/boq', icon: FileSpreadsheet, roles: ['admin', 'dataEntry'] as UserRole[], color: 'from-green-500 to-green-600' },
    { name: 'Break-Down', href: '/breakdown', icon: Calculator, roles: ['admin', 'dataEntry'] as UserRole[], color: 'from-purple-500 to-purple-600' },
    { name: 'WIRs', href: '/wirs', icon: FileCheck, roles: ['admin', 'dataEntry', 'viewer'] as UserRole[], color: 'from-orange-500 to-orange-600' },
    { name: 'Reports', href: '/reports', icon: BarChart3, roles: ['admin', 'dataEntry', 'viewer'] as UserRole[], color: 'from-red-500 to-red-600' },
    { name: 'Progress Tracking', href: '/progress', icon: TrendingUp, roles: ['admin', 'dataEntry', 'viewer'] as UserRole[], color: 'from-indigo-500 to-indigo-600' },
    { name: 'Invoices', href: '/invoices', icon: Receipt, roles: ['admin', 'dataEntry', 'viewer'] as UserRole[], color: 'from-cyan-500 to-cyan-600' },
    { name: 'Users', href: '/users', icon: Users, roles: ['admin'] as UserRole[], color: 'from-pink-500 to-pink-600' },
  ];

  const filteredNavigation = navigation.filter(item => 
    hasPermission(item.roles)
  );

  return (
    <Sidebar className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white border-r border-slate-700/50 shadow-2xl">
      <SidebarHeader className="border-b border-slate-700/50 p-6 bg-gradient-to-r from-slate-800/50 to-slate-900/50 backdrop-blur-sm">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-300 animate-pulse"></div>
            <div className="relative w-20 h-20 bg-gradient-to-br from-white to-gray-100 rounded-full flex items-center justify-center shadow-xl border-2 border-amber-400/30">
              <img 
                src="/lovable-uploads/454de6d4-afed-4b33-b065-ade01eb9065a.png" 
                alt="Company Logo" 
                className="w-16 h-16 object-contain filter drop-shadow-lg"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-r from-green-400 to-green-500 rounded-full border-2 border-white shadow-lg animate-pulse"></div>
          </div>
          
          <div className="text-center space-y-3">
            <div className="text-amber-200 text-lg font-bold tracking-wide" dir="rtl">
              شركة سعد سعيد الصاعدي
            </div>
            <div className="text-amber-300/80 text-sm font-medium" dir="rtl">
              وأولاده التضامنية
            </div>
            <div className="h-px bg-gradient-to-r from-transparent via-slate-400/50 to-transparent w-full"></div>
            <div className="text-center space-y-1">
              <div className="flex items-center justify-center space-x-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h1 className="text-white text-xl font-bold bg-gradient-to-r from-blue-200 to-blue-100 bg-clip-text text-transparent">
                  WIR Management System
                </h1>
                <Sparkles className="w-4 h-4 text-amber-400" />
              </div>
              <p className="text-slate-300 text-xs font-medium tracking-wide">Construction Financial Manager</p>
            </div>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="px-4 py-6 bg-gradient-to-b from-transparent to-slate-900/30">
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
                        w-full text-left px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden
                        ${isActive 
                          ? 'bg-gradient-to-r from-blue-600/90 to-blue-700/90 text-white font-semibold shadow-lg shadow-blue-500/25 transform scale-[1.02] border border-blue-400/30' 
                          : 'text-slate-200 hover:bg-gradient-to-r hover:from-slate-700/50 hover:to-slate-600/50 hover:text-white hover:shadow-md hover:transform hover:scale-[1.01] hover:shadow-slate-500/20'
                        }
                      `}
                    >
                      <Link to={item.href} className="flex items-center space-x-3 w-full relative z-10">
                        <div className={`
                          p-2.5 rounded-lg transition-all duration-300
                          ${isActive 
                            ? `bg-gradient-to-r ${item.color} shadow-lg` 
                            : 'bg-slate-800/50 group-hover:bg-slate-700/70 group-hover:shadow-md'
                          }
                        `}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <span className="font-medium tracking-wide">{item.name}</span>
                        {isActive && (
                          <div className="ml-auto flex items-center space-x-1">
                            <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
                            <div className="w-1 h-1 bg-amber-300 rounded-full animate-pulse delay-75"></div>
                          </div>
                        )}
                        <div className={`
                          absolute inset-0 bg-gradient-to-r ${item.color} opacity-0 rounded-xl transition-opacity duration-300
                          ${!isActive ? 'group-hover:opacity-10' : ''}
                        `}></div>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="border-t border-slate-700/50 p-4 bg-gradient-to-r from-slate-800/50 to-slate-900/50 backdrop-blur-sm">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="w-full text-slate-200 hover:bg-slate-700/50 hover:text-white rounded-xl p-3 transition-all duration-300 group">
                  <div className="flex items-center space-x-3 w-full">
                    <div className="relative">
                      <Avatar className="h-10 w-10 border-2 border-slate-600 shadow-lg">
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white font-bold text-sm">
                          {user?.name?.charAt(0) || user?.username?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border border-slate-800"></div>
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-medium text-white truncate text-sm">{user?.name || user?.username}</div>
                      <div className="text-xs text-slate-400 truncate capitalize">{user?.role}</div>
                    </div>
                    <div className="w-2 h-2 bg-slate-600 rounded-full group-hover:bg-slate-400 transition-colors"></div>
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" className="w-56 bg-white/95 backdrop-blur-sm border border-slate-200 shadow-xl">
                <div className="px-3 py-2 text-sm text-slate-600 border-b border-slate-100">
                  <div className="font-medium">{user?.name || user?.username}</div>
                  <div className="text-xs text-slate-500">{user?.email || user?.username}</div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-red-600 hover:bg-red-50 focus:bg-red-50 transition-colors">
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
      <div className="min-h-screen flex w-full bg-gradient-to-br from-gray-50 to-gray-100">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-white/80 backdrop-blur-sm px-6 shadow-sm">
            <SidebarTrigger className="-ml-1 hover:bg-blue-50 transition-colors" />
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
