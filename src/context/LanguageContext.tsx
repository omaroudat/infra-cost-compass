
import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'ar';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, fallback?: string) => string;
  formatNumber: (num: number) => string;
  formatCurrency: (amount: number) => string;
  formatDate: (date: Date | string) => string;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translation object
const translations = {
  en: {
    // Layout
    'layout.title': 'WIR Management',
    'layout.subtitle': 'Construction Financial Manager',
    'layout.copyright': '© 2025 WIR Management',
    'layout.logout': 'Log out',
    'layout.administrator': 'Administrator',
    'layout.dataEntry': 'Data Entry Operator',
    
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.boq': 'BOQ Items',
    'nav.breakdown': 'Break-Down',
    'nav.wirs': 'WIRs',
    'nav.reports': 'Reports',
    'nav.progress': 'Progress Tracking',
    'nav.users': 'Users',
    
    // WIRs Page
    'wirs.title': 'Work Inspection Requests (WIRs)',
    'wirs.management': 'WIR Management',
    'wirs.contractors': 'Contractors',
    'wirs.engineers': 'Engineers',
    'wirs.addNew': 'Add New WIR',
    'wirs.addContractor': 'Add New Contractor',
    'wirs.addEngineer': 'Add New Engineer',
    'wirs.edit': 'Edit',
    'wirs.add': 'Add',
    
    // Progress Tracking
    'progress.title': 'Progress Tracking',
    'progress.breakdownProgress': 'Breakdown Progress',
    'progress.relatedWirs': 'Related WIRs',
    'progress.quantity': 'Quantity',
    'progress.unitRate': 'Unit Rate',
    'progress.totalValue': 'Total Value',
    'progress.completion': 'Completion',
    'progress.wirId': 'WIR ID',
    'progress.contractor': 'Contractor',
    'progress.engineer': 'Engineer',
    'progress.wirValue': 'WIR Value',
    'progress.status': 'Status',
    'progress.result': 'Result',
    'progress.amountForItem': 'Amount for this Item',
    
    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.add': 'Add',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.export': 'Export',
    'common.import': 'Import',
  },
  ar: {
    // Layout
    'layout.title': 'إدارة طلبات المعاينة',
    'layout.subtitle': 'مدير الأموال الإنشائية',
    'layout.copyright': '© 2025 إدارة طلبات المعاينة',
    'layout.logout': 'تسجيل الخروج',
    'layout.administrator': 'مدير النظام',
    'layout.dataEntry': 'مشغل إدخال البيانات',
    
    // Navigation
    'nav.dashboard': 'لوحة التحكم',
    'nav.boq': 'بنود الكميات',
    'nav.breakdown': 'التفصيل',
    'nav.wirs': 'طلبات المعاينة',
    'nav.reports': 'التقارير',
    'nav.progress': 'متابعة التقدم',
    'nav.users': 'المستخدمون',
    
    // WIRs Page
    'wirs.title': 'طلبات معاينة الأعمال',
    'wirs.management': 'إدارة طلبات المعاينة',
    'wirs.contractors': 'المقاولون',
    'wirs.engineers': 'المهندسون',
    'wirs.addNew': 'إضافة طلب معاينة جديد',
    'wirs.addContractor': 'إضافة مقاول جديد',
    'wirs.addEngineer': 'إضافة مهندس جديد',
    'wirs.edit': 'تعديل',
    'wirs.add': 'إضافة',
    
    // Progress Tracking
    'progress.title': 'متابعة التقدم',
    'progress.breakdownProgress': 'تقدم البنود الفرعية',
    'progress.relatedWirs': 'طلبات المعاينة المرتبطة',
    'progress.quantity': 'الكمية',
    'progress.unitRate': 'سعر الوحدة',
    'progress.totalValue': 'القيمة الإجمالية',
    'progress.completion': 'نسبة الإنجاز',
    'progress.wirId': 'رقم طلب المعاينة',
    'progress.contractor': 'المقاول',
    'progress.engineer': 'المهندس',
    'progress.wirValue': 'قيمة الطلب',
    'progress.status': 'الحالة',
    'progress.result': 'النتيجة',
    'progress.amountForItem': 'المبلغ لهذا البند',
    
    // Common
    'common.loading': 'جاري التحميل...',
    'common.error': 'خطأ',
    'common.success': 'نجح',
    'common.cancel': 'إلغاء',
    'common.save': 'حفظ',
    'common.delete': 'حذف',
    'common.edit': 'تعديل',
    'common.add': 'إضافة',
    'common.search': 'بحث',
    'common.filter': 'تصفية',
    'common.export': 'تصدير',
    'common.import': 'استيراد',

    // Role translations
    'role.admin': 'مدير النظام',
    'role.editor': 'محرر',
    'role.viewer': 'مشاهد',
    'role.data_entry': 'مشغل إدخال البيانات',
  }
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('app-language');
    return (saved as Language) || 'en';
  });

  useEffect(() => {
    localStorage.setItem('app-language', language);
    
    // Update document direction and lang attribute
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
    
    // Update body class for RTL styling
    if (language === 'ar') {
      document.body.classList.add('rtl');
      document.body.classList.remove('ltr');
    } else {
      document.body.classList.add('ltr');
      document.body.classList.remove('rtl');
    }
  }, [language]);

  const t = (key: string, fallback?: string): string => {
    return translations[language][key] || fallback || key;
  };

  // Utility functions for RTL support
  const formatNumber = (num: number): string => {
    if (language === 'ar') {
      return new Intl.NumberFormat('ar-SA').format(num);
    }
    return new Intl.NumberFormat('en-US').format(num);
  };

  const formatCurrency = (amount: number): string => {
    if (language === 'ar') {
      return new Intl.NumberFormat('ar-SA', {
        style: 'currency',
        currency: 'SAR',
        minimumFractionDigits: 2,
      }).format(amount);
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (date: Date | string): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (language === 'ar') {
      return new Intl.DateTimeFormat('ar-SA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(dateObj);
    }
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(dateObj);
  };

  const isRTL = language === 'ar';

  const value = {
    language,
    setLanguage,
    t,
    formatNumber,
    formatCurrency,
    formatDate,
    isRTL
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
