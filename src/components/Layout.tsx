
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
  SidebarGroupLabel,
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
  FileText, 
  Home, 
  LogOut, 
  Settings, 
  TrendingUp, 
  Users,
  Receipt,
  FileSpreadsheet,
  Calculator,
  Percent,
  FileCheck
} from 'lucide-react';
import { LanguageSelector } from './LanguageSelector';
import { UserRole } from '../types/auth';

const AppSidebar = () => {
  const { user, logout, hasPermission } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();

  const navigation = [
    { name: t('nav.dashboard'), href: '/dashboard', icon: Home, roles: ['admin', 'dataEntry', 'viewer'] as UserRole[] },
    { name: t('nav.boq'), href: '/boq', icon: FileSpreadsheet, roles: ['admin', 'dataEntry'] as UserRole[] },
    { name: t('nav.breakdown'), href: '/breakdown', icon: Calculator, roles: ['admin', 'dataEntry'] as UserRole[] },
    { name: t('nav.adjustments'), href: '/adjustments', icon: Percent, roles: ['admin', 'dataEntry'] as UserRole[] },
    { name: t('nav.wirs'), href: '/wirs', icon: FileCheck, roles: ['admin', 'dataEntry', 'viewer'] as UserRole[] },
    { name: t('nav.progress'), href: '/progress', icon: TrendingUp, roles: ['admin', 'dataEntry', 'viewer'] as UserRole[] },
    { name: t('nav.reports'), href: '/reports', icon: BarChart3, roles: ['admin', 'dataEntry', 'viewer'] as UserRole[] },
    { name: t('nav.invoices') || 'Invoices', href: '/invoices', icon: Receipt, roles: ['admin', 'dataEntry', 'viewer'] as UserRole[] },
    { name: t('nav.staff'), href: '/staff', icon: Users, roles: ['admin'] as UserRole[] },
    { name: t('nav.users'), href: '/users', icon: Settings, roles: ['admin'] as UserRole[] },
  ];

  const filteredNavigation = navigation.filter(item => 
    hasPermission(item.roles)
  );

  return (
    <Sidebar>
      <SidebarHeader className="border-b">
        <div className="flex items-center space-x-2 px-4 py-2">
          <FileText className="h-8 w-8 text-blue-600" />
          <span className="text-xl font-bold text-gray-900">WIR System</span>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredNavigation.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                return (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link to={item.href}>
                        <Icon className="h-4 w-4" />
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
      
      <SidebarFooter className="border-t">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="w-full">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback>{user?.name?.charAt(0) || user?.username?.charAt(0) || 'U'}</AvatarFallback>
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
                  {t('auth.logout')}
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
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="ml-auto flex items-center space-x-4">
              <LanguageSelector />
            </div>
          </header>
          <main className="flex-1 p-6">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Layout;
