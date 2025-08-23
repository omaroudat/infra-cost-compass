
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/ManualAuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import UserProfileCard from '@/components/UserProfileCard';
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
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { LanguageSelector } from './LanguageSelector';

const AppSidebar = ({ side }: { side?: "left" | "right" }) => {
  const { profile, signOut, hasRole } = useAuth();
  const { t, isRTL } = useLanguage();
  const location = useLocation();

  const navigation = [
    { name: t('nav.dashboard', 'Dashboard'), href: '/dashboard', icon: Home, roles: ['admin', 'editor', 'viewer'], color: 'from-blue-500 to-blue-600' },
    { name: t('nav.boq', 'BOQ Items'), href: '/boq', icon: FileSpreadsheet, roles: ['admin', 'editor'], color: 'from-green-500 to-green-600' },
    { name: t('nav.breakdown', 'Break-Down'), href: '/breakdown', icon: Calculator, roles: ['admin', 'editor'], color: 'from-purple-500 to-purple-600' },
    { name: t('nav.wirs', 'WIRs'), href: '/wirs', icon: FileCheck, roles: ['admin', 'editor', 'viewer', 'data_entry'], color: 'from-orange-500 to-orange-600' },
    { name: t('nav.reports', 'Reports'), href: '/reports', icon: BarChart3, roles: ['admin', 'editor', 'viewer'], color: 'from-red-500 to-red-600' },
    { name: t('nav.progress', 'Progress Tracking'), href: '/progress', icon: TrendingUp, roles: ['admin', 'editor', 'viewer'], color: 'from-indigo-500 to-indigo-600' },
    { name: t('nav.progressSummary', 'Progress Summary'), href: '/progress-summary', icon: Sparkles, roles: ['admin', 'editor', 'viewer'], color: 'from-emerald-500 to-emerald-600' },
    { name: 'Invoices', href: '/invoices', icon: Receipt, roles: ['admin', 'editor', 'viewer'], color: 'from-cyan-500 to-cyan-600' },
    { name: t('nav.users', 'Users'), href: '/users', icon: Users, roles: ['admin'], color: 'from-pink-500 to-pink-600' },
  ];

  // For data_entry users, only show WIRs
  const getFilteredNavigation = () => {
    if (profile?.role === 'data_entry') {
      return navigation.filter(item => item.href === '/wirs');
    }
    return navigation.filter(item => hasRole(item.roles));
  };

  const filteredNavigation = getFilteredNavigation();


  return (
    <Sidebar side={side} className="bg-white border-r border-gray-200/60 shadow-xl backdrop-blur-sm">
      <SidebarHeader className="border-b border-gray-100 p-4 bg-gradient-to-br from-slate-50 to-white">
        <div className="flex flex-col items-center space-y-3">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 rounded-full blur-md opacity-20 group-hover:opacity-30 transition duration-500 animate-pulse"></div>
            <div className="relative w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-xl border border-gray-100 group-hover:shadow-blue-100 transition-all duration-300">
              <img 
                src="/lovable-uploads/454de6d4-afed-4b33-b065-ade01eb9065a.png" 
                alt="Company Logo" 
                className="w-14 h-14 object-contain filter drop-shadow-md"
              />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full border-2 border-white shadow-lg">
              <div className="w-full h-full bg-green-400 rounded-full animate-ping opacity-40"></div>
            </div>
          </div>
          
          <div className="text-center space-y-2">
            <div className="space-y-1">
              <div className="text-gray-800 text-sm font-bold tracking-wide font-arabic" dir="rtl">
                شركة سعد سعيد الصاعدي
              </div>
              <div className="text-gray-600 text-xs font-medium font-arabic" dir="rtl">
                وأولاده التضامنية
              </div>
            </div>
            
            <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent w-full"></div>
            
            <div className="space-y-1">
              <div className={`flex items-center justify-center ${isRTL ? 'space-x-reverse space-x-1' : 'space-x-1'}`}>
                <Building2 className="w-4 h-4 text-blue-600" />
                <h1 className="text-gray-900 text-sm font-bold">
                  {t('layout.title', 'WIR Management System')}
                </h1>
              </div>
              <p className="text-gray-500 text-xs font-medium tracking-wide uppercase">
                {t('layout.subtitle', 'Khuzam Project')}
              </p>
            </div>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="px-4 py-4 bg-gradient-to-b from-white to-gray-50/50">
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
                        w-full text-left px-3 py-2.5 rounded-xl transition-all duration-300 group relative overflow-hidden border
                        ${isActive 
                          ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 font-semibold shadow-lg shadow-blue-500/10 border-blue-200/60 transform scale-[1.02]' 
                          : 'text-gray-600 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50/30 hover:text-gray-900 hover:shadow-md hover:transform hover:scale-[1.01] hover:shadow-gray-500/10 border-transparent hover:border-gray-200/40'
                        }
                      `}
                    >
                      <Link to={item.href} className="flex items-center justify-between w-full relative z-10">
                        <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-3' : 'space-x-3'}`}>
                          <div className={`
                            p-2 rounded-lg transition-all duration-300 flex items-center justify-center
                            ${isActive 
                              ? `bg-gradient-to-r ${item.color} shadow-lg text-white` 
                              : 'bg-gray-100 group-hover:bg-white group-hover:shadow-md text-gray-500 group-hover:text-gray-700'
                            }
                          `}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <span className={`font-medium tracking-wide text-sm ${isRTL ? 'font-arabic' : ''}`}>{item.name}</span>
                        </div>
                        
                        {isActive ? (
                          <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-1' : 'space-x-1'}`}>
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                            <div className="w-1 h-1 bg-blue-400 rounded-full"></div>
                            <div className="w-0.5 h-0.5 bg-blue-300 rounded-full"></div>
                          </div>
                        ) : (
                          <ChevronRight className={`w-3 h-3 text-gray-400 group-hover:text-gray-600 transition-colors ${isRTL ? 'rotate-180' : ''}`} />
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="border-t border-gray-100 p-3 bg-gradient-to-r from-gray-50 to-white">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="w-full text-gray-700 hover:bg-gray-100/60 hover:text-gray-900 rounded-xl p-3 transition-all duration-300 group border border-transparent hover:border-gray-200/40 hover:shadow-md">
                  <div className={`flex items-center w-full ${isRTL ? 'space-x-reverse space-x-3' : 'space-x-3'}`}>
                    <div className="relative">
                      <Avatar className="h-8 w-8 border-2 border-gray-200 shadow-md">
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-xs">
                          {profile?.full_name?.charAt(0) || profile?.username?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white shadow-sm"></div>
                    </div>
                    <div className={`flex-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                      <div className={`font-semibold text-gray-900 truncate text-xs ${isRTL ? 'font-arabic' : ''}`}>{profile?.full_name || profile?.username}</div>
                      <div className={`text-xs text-gray-500 truncate capitalize font-medium ${isRTL ? 'font-arabic' : ''}`}>{t(`role.${profile?.role}`, profile?.role)}</div>
                    </div>
                    <ChevronRight className={`w-3 h-3 text-gray-400 group-hover:text-gray-600 transition-colors ${isRTL ? 'rotate-180' : ''}`} />
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" className="w-64 bg-white/95 backdrop-blur-md border border-gray-200 shadow-2xl rounded-2xl">
                <div className={`px-4 py-3 text-sm text-gray-600 border-b border-gray-100 ${isRTL ? 'text-right' : ''}`}>
                  <div className={`font-semibold text-gray-900 ${isRTL ? 'font-arabic' : ''}`}>{profile?.full_name || profile?.username}</div>
                  <div className={`text-xs text-gray-500 ${isRTL ? 'font-arabic' : ''}`}>{profile?.username}</div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut} className="text-red-600 hover:bg-red-50 focus:bg-red-50 transition-colors m-2 rounded-xl">
                  <LogOut className={`h-4 w-4 ${isRTL ? 'ml-3' : 'mr-3'}`} />
                  {t('layout.logout', 'Logout')}
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
  const { isRTL } = useLanguage();
  
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-gray-50 to-gray-100">
        <AppSidebar side={isRTL ? "right" : "left"} />
        <SidebarInset className="flex-1">
          <header className={`flex h-16 shrink-0 items-center gap-2 border-b bg-white/80 backdrop-blur-sm px-6 shadow-sm ${isRTL ? 'flex-row-reverse' : ''}`}>
            <SidebarTrigger className="-ml-1 hover:bg-blue-50 transition-colors" />
            <div className={`flex items-center ${isRTL ? 'mr-auto space-x-reverse space-x-4' : 'ml-auto space-x-4'}`}>
              <UserProfileCard />
              <LanguageSelector />
            </div>
          </header>
          <main className={`flex-1 p-8 bg-gradient-to-br from-gray-50 to-gray-100 ${isRTL ? 'font-arabic' : ''}`}>
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Layout;
