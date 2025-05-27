
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogIn, User, Users } from 'lucide-react';
import { LanguageSelector } from './LanguageSelector';

type NavItem = {
  title: string;
  titleKey: string;
  href: string;
  icon: React.ReactNode;
  roles?: ('admin' | 'dataEntry')[];
};

const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    titleKey: 'nav.dashboard',
    href: '/',
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><rect width="7" height="9" x="3" y="3" rx="1"></rect><rect width="7" height="5" x="14" y="3" rx="1"></rect><rect width="7" height="9" x="14" y="12" rx="1"></rect><rect width="7" height="5" x="3" y="16" rx="1"></rect></svg>,
    roles: ['admin', 'dataEntry']
  },
  {
    title: 'BOQ Items',
    titleKey: 'nav.boq',
    href: '/boq',
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect width="8" height="4" x="8" y="2" rx="1" ry="1"></rect><path d="M12 11h4"></path><path d="M12 16h4"></path><path d="M8 11h.01"></path><path d="M8 16h.01"></path></svg>,
    roles: ['admin']
  },
  {
    title: 'Break-Down',
    titleKey: 'nav.breakdown',
    href: '/breakdown',
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="m16 6 4 14"></path><path d="M12 6v14"></path><path d="M8 8v12"></path><path d="M4 4v16"></path></svg>,
    roles: ['admin']
  },
  {
    title: 'WIRs',
    titleKey: 'nav.wirs',
    href: '/wirs',
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M14 3v4a1 1 0 0 0 1 1h4"></path><path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2Z"></path><path d="M9 9h1"></path><path d="M9 13h6"></path><path d="M9 17h6"></path></svg>,
    roles: ['admin', 'dataEntry']
  },
  {
    title: 'Reports',
    titleKey: 'nav.reports',
    href: '/reports',
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>,
    roles: ['admin']
  },
  {
    title: 'Progress Tracking',
    titleKey: 'nav.progress',
    href: '/progress',
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M12 2v20m8-10H4"></path></svg>,
    roles: ['admin']
  },
  {
    title: 'Users',
    titleKey: 'nav.users',
    href: '/users',
    icon: <Users className="w-5 h-5" />,
    roles: ['admin']
  }
];

const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, hasPermission } = useAuth();
  const { t, language } = useLanguage();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getCurrentPageTitle = () => {
    const currentItem = navItems.find((item) => item.href === location.pathname);
    return currentItem ? t(currentItem.titleKey) : 'Page';
  };

  return (
    <div className={`flex min-h-screen bg-gray-100 ${language === 'ar' ? 'rtl' : 'ltr'}`}>
      {/* Sidebar */}
      <div className={`w-64 bg-navy text-white flex flex-col ${language === 'ar' ? 'order-2' : 'order-1'}`}>
        <div className="p-4 border-b border-navy-light">
          <div className="flex items-center justify-center mb-4">
            <img 
              src="/lovable-uploads/347d6d69-5c66-41a1-8075-e83bbb9ca016.png" 
              alt="WIR Management Logo" 
              className="h-16 object-contain" 
            />
          </div>
          <h1 className="text-2xl font-bold text-center">{t('layout.title')}</h1>
          <p className="text-sm text-slate-light text-center">{t('layout.subtitle')}</p>
        </div>
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navItems.filter(item => !item.roles || hasPermission(item.roles)).map((item) => (
              <li key={item.href}>
                <Link
                  to={item.href}
                  className={`flex items-center p-3 rounded-md transition-colors ${
                    location.pathname === item.href
                      ? 'bg-navy-light text-white'
                      : 'text-slate hover:bg-navy-light'
                  } ${language === 'ar' ? 'flex-row-reverse' : ''}`}
                >
                  {item.icon}
                  <span className={`${language === 'ar' ? 'mr-3' : 'ml-3'}`}>{t(item.titleKey)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="p-4 border-t border-navy-light">
          <p className="text-sm text-slate-light text-center">{t('layout.copyright')}</p>
        </div>
      </div>

      {/* Main content */}
      <div className={`flex-1 flex flex-col ${language === 'ar' ? 'order-1' : 'order-2'}`}>
        <header className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-navy-dark">
              {getCurrentPageTitle()}
            </h2>
          </div>
          <div className="flex items-center space-x-4">
            <LanguageSelector />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <div className="w-8 h-8 rounded-full bg-navy flex items-center justify-center text-white font-semibold">
                    {user?.username.charAt(0).toUpperCase()}
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-white dark:bg-gray-800 border shadow-lg z-50" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.username}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.role === 'admin' ? t('layout.administrator') : t('layout.dataEntry')}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogIn className="mr-2 h-4 w-4" />
                  <span>{t('layout.logout')}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
