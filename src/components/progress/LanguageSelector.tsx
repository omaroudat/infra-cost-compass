
import React from 'react';
import { Button } from '@/components/ui/button';

interface LanguageSelectorProps {
  language: 'en' | 'ar';
  onLanguageChange: (language: 'en' | 'ar') => void;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  language,
  onLanguageChange
}) => {
  return (
    <div className="flex gap-2">
      <Button
        variant={language === 'en' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onLanguageChange('en')}
      >
        EN
      </Button>
      <Button
        variant={language === 'ar' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onLanguageChange('ar')}
      >
        عربي
      </Button>
    </div>
  );
};
