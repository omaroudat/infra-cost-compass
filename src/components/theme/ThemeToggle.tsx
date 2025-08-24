import React from 'react';
import { useTheme } from './ThemeProvider';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Sun, Moon, Monitor } from 'lucide-react';

export const ThemeToggle: React.FC = () => {
  const { theme, setTheme, resolvedTheme } = useTheme();

  const getThemeIcon = () => {
    switch (resolvedTheme) {
      case 'dark':
        return <Moon className="h-4 w-4" />;
      case 'light':
        return <Sun className="h-4 w-4" />;
      default:
        return <Monitor className="h-4 w-4" />;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm"
          className="h-9 w-9 p-0 hover:bg-muted/80 focus:bg-muted/80 transition-all duration-200"
          aria-label="Toggle theme"
        >
          <div className="transition-transform duration-200 hover:scale-110">
            {getThemeIcon()}
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-48 animate-fade-in"
        side="bottom"
        sideOffset={8}
      >
        <DropdownMenuItem 
          onClick={() => setTheme('light')}
          className={`cursor-pointer transition-colors duration-150 ${
            theme === 'light' ? 'bg-primary/10 text-primary' : ''
          }`}
        >
          <Sun className="h-4 w-4 mr-2" />
          <span>Light</span>
          {theme === 'light' && (
            <div className="ml-auto w-2 h-2 rounded-full bg-primary animate-pulse" />
          )}
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={() => setTheme('dark')}
          className={`cursor-pointer transition-colors duration-150 ${
            theme === 'dark' ? 'bg-primary/10 text-primary' : ''
          }`}
        >
          <Moon className="h-4 w-4 mr-2" />
          <span>Dark</span>
          {theme === 'dark' && (
            <div className="ml-auto w-2 h-2 rounded-full bg-primary animate-pulse" />
          )}
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={() => setTheme('system')}
          className={`cursor-pointer transition-colors duration-150 ${
            theme === 'system' ? 'bg-primary/10 text-primary' : ''
          }`}
        >
          <Monitor className="h-4 w-4 mr-2" />
          <span>System</span>
          {theme === 'system' && (
            <div className="ml-auto w-2 h-2 rounded-full bg-primary animate-pulse" />
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};