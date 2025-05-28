
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

const Layout = ({ children }: { children: React.ReactNode }) => {
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
    { name: 'Invoices', href: '/invoices', icon: Receipt, roles: ['admin', 'dataEntry', 'viewer'] as UserRole[] },
    { name: t('nav.staff'), href: '/staff', icon: Users, roles: ['admin'] as UserRole[] },
    { name: t('nav.users'), href: '/users', icon: Settings, roles: ['admin'] as UserRole[] },
  ];

  const filteredNavigation = navigation.filter(item => 
    hasPermission(item.roles)
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <Link to="/dashboard" className="flex items-center space-x-2">
                <FileText className="h-8 w-8 text-blue-600" />
                <span className="text-xl font-bold text-gray-900">WIR System</span>
              </Link>
              
              <div className="hidden md:flex space-x-1">
                {filteredNavigation.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <LanguageSelector />
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{user?.name?.charAt(0) || user?.username?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                    <span className="hidden md:block text-sm font-medium">{user?.name || user?.username}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
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
            </div>
          </div>
        </div>
      </nav>
      
      <main className="py-6 px-6">
        {children}
      </main>
    </div>
  );
};

export default Layout;
