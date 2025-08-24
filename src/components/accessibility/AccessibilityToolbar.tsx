import React, { useState } from 'react';
import { useAccessibility } from './AccessibilityProvider';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { 
  Accessibility, 
  Eye, 
  Palette, 
  Type, 
  Zap,
  Volume2,
  MousePointer,
  Keyboard
} from 'lucide-react';

export const AccessibilityToolbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const {
    isHighContrast,
    setHighContrast,
    isReducedMotion,
    setReducedMotion,
    fontSize,
    setFontSize,
    announceMessage
  } = useAccessibility();

  const handleToolbarOpen = () => {
    setIsOpen(true);
    announceMessage('Accessibility toolbar opened');
  };

  const handleToolbarClose = () => {
    setIsOpen(false);
    announceMessage('Accessibility toolbar closed');
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          onClick={handleToolbarOpen}
          className="fixed top-4 right-4 z-50 bg-background/95 backdrop-blur-sm border-2 hover:border-primary focus:border-primary focus:ring-2 focus:ring-primary/20"
          aria-label="Open accessibility settings"
        >
          <Accessibility className="h-4 w-4" />
          <span className="sr-only">Accessibility Settings</span>
        </Button>
      </SheetTrigger>
      
      <SheetContent 
        side="right" 
        className="w-80 sm:w-96" 
        onEscapeKeyDown={handleToolbarClose}
        aria-labelledby="accessibility-title"
        aria-describedby="accessibility-description"
      >
        <SheetHeader>
          <SheetTitle id="accessibility-title" className="flex items-center gap-2">
            <Accessibility className="h-5 w-5" />
            Accessibility Settings
          </SheetTitle>
          <SheetDescription id="accessibility-description">
            Customize your viewing and interaction preferences for better accessibility.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Visual Settings */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Visual Settings
            </h3>
            
            <div className="space-y-4">
              {/* High Contrast */}
              <div className="flex items-center justify-between">
                <Label htmlFor="high-contrast" className="flex flex-col gap-1">
                  <span>High Contrast</span>
                  <span className="text-sm text-muted-foreground">
                    Increases color contrast for better visibility
                  </span>
                </Label>
                <Switch
                  id="high-contrast"
                  checked={isHighContrast}
                  onCheckedChange={setHighContrast}
                  aria-describedby="high-contrast-description"
                />
              </div>

              {/* Font Size */}
              <div className="space-y-2">
                <Label htmlFor="font-size" className="flex items-center gap-2">
                  <Type className="h-4 w-4" />
                  Font Size
                </Label>
                <Select value={fontSize} onValueChange={setFontSize}>
                  <SelectTrigger id="font-size" aria-label="Select font size">
                    <SelectValue placeholder="Select font size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Small</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="large">Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Separator />

          {/* Motion Settings */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Motion & Animation
            </h3>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="reduced-motion" className="flex flex-col gap-1">
                <span>Reduce Motion</span>
                <span className="text-sm text-muted-foreground">
                  Reduces animations and transitions
                </span>
              </Label>
              <Switch
                id="reduced-motion"
                checked={isReducedMotion}
                onCheckedChange={setReducedMotion}
                aria-describedby="reduced-motion-description"
              />
            </div>
          </div>

          <Separator />

          {/* Keyboard Navigation Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Keyboard className="h-4 w-4" />
              Keyboard Navigation
            </h3>
            
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex gap-3">
                <kbd className="px-2 py-1 bg-muted rounded text-xs">Tab</kbd>
                <span>Navigate between elements</span>
              </div>
              <div className="flex gap-3">
                <kbd className="px-2 py-1 bg-muted rounded text-xs">Enter</kbd>
                <span>Activate buttons and links</span>
              </div>
              <div className="flex gap-3">
                <kbd className="px-2 py-1 bg-muted rounded text-xs">Esc</kbd>
                <span>Close dialogs and menus</span>
              </div>
              <div className="flex gap-3">
                <kbd className="px-2 py-1 bg-muted rounded text-xs">Space</kbd>
                <span>Toggle checkboxes and switches</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Quick Actions */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // Focus on main content
                  const mainContent = document.querySelector('main');
                  if (mainContent) {
                    mainContent.focus();
                    announceMessage('Jumped to main content');
                  }
                }}
                className="text-xs"
              >
                Skip to Content
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // Reset all accessibility settings
                  setHighContrast(false);
                  setReducedMotion(false);
                  setFontSize('medium');
                  announceMessage('All accessibility settings reset to default');
                }}
                className="text-xs"
              >
                Reset Settings
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};