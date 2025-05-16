
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  LogIn, 
  Users, 
  LayoutDashboard, 
  FileText, 
  BarChartBig, 
  FileSpreadsheet,
  Import
} from 'lucide-react';

type NavItem = {
  title: string;
  href: string;
  icon: React.ReactNode;
  roles?: ('admin' | 'dataEntry')[];
};

const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/',
    icon: <LayoutDashboard className="w-5 h-5" />,
    roles: ['admin', 'dataEntry']
  },
  {
    title: 'BOQ Items',
    href: '/boq',
    icon: <FileText className="w-5 h-5" />,
    roles: ['admin']
  },
  {
    title: 'Adjustments',
    href: '/adjustments',
    icon: <BarChartBig className="w-5 h-5" />,
    roles: ['admin']
  },
  {
    title: 'WIRs',
    href: '/wirs',
    icon: <FileSpreadsheet className="w-5 h-5" />,
    roles: ['admin', 'dataEntry']
  },
  {
    title: 'Reports',
    href: '/reports',
    icon: <Import className="w-5 h-5" />,
    roles: ['admin']
  },
  {
    title: 'Users',
    href: '/users',
    icon: <Users className="w-5 h-5" />,
    roles: ['admin']
  }
];

const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, hasPermission } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-navy text-white flex flex-col">
        <div className="p-4 border-b border-navy-light">
          <div className="flex items-center justify-center mb-4">
            <img 
              src="/lovable-uploads/347d6d69-5c66-41a1-8075-e83bbb9ca016.png" 
              alt="WIR Management Logo" 
              className="h-16 object-contain" 
            />
          </div>
          <h1 className="text-2xl font-bold text-center">WIR Management</h1>
          <p className="text-sm text-slate-light text-center">Construction Financial Manager</p>
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
                  }`}
                >
                  {item.icon}
                  <span className="ml-3">{item.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="p-4 border-t border-navy-light">
          <p className="text-sm text-slate-light text-center">© 2025 WIR Management</p>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-navy-dark">
              {navItems.find((item) => item.href === location.pathname)?.title || 'Page'}
            </h2>
          </div>
          <div className="flex items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <div className="w-8 h-8 rounded-full bg-navy flex items-center justify-center text-white font-semibold">
                    {user?.username.charAt(0).toUpperCase()}
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.username}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.role === 'admin' ? 'Administrator' : 'Data Entry Operator'}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogIn className="mr-2 h-4 w-4" />
                  <span>Log out</span>
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
