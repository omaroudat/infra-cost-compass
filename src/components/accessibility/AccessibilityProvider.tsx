import React, { createContext, useContext, useEffect, useState } from 'react';

interface AccessibilityContextType {
  announceMessage: (message: string) => void;
  isHighContrast: boolean;
  setHighContrast: (enabled: boolean) => void;
  isReducedMotion: boolean;
  setReducedMotion: (enabled: boolean) => void;
  fontSize: 'small' | 'medium' | 'large';
  setFontSize: (size: 'small' | 'medium' | 'large') => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [announcer, setAnnouncer] = useState<HTMLDivElement | null>(null);

  // Create screen reader announcer
  useEffect(() => {
    const announcerElement = document.createElement('div');
    announcerElement.setAttribute('aria-live', 'polite');
    announcerElement.setAttribute('aria-atomic', 'true');
    announcerElement.setAttribute('aria-hidden', 'false');
    announcerElement.className = 'sr-only';
    announcerElement.style.position = 'absolute';
    announcerElement.style.left = '-10000px';
    announcerElement.style.width = '1px';
    announcerElement.style.height = '1px';
    announcerElement.style.overflow = 'hidden';
    
    document.body.appendChild(announcerElement);
    setAnnouncer(announcerElement);

    return () => {
      if (document.body.contains(announcerElement)) {
        document.body.removeChild(announcerElement);
      }
    };
  }, []);

  // Load preferences from localStorage
  useEffect(() => {
    const savedContrast = localStorage.getItem('accessibility-high-contrast');
    const savedMotion = localStorage.getItem('accessibility-reduced-motion');
    const savedFontSize = localStorage.getItem('accessibility-font-size');

    if (savedContrast) setIsHighContrast(JSON.parse(savedContrast));
    if (savedMotion) setIsReducedMotion(JSON.parse(savedMotion));
    if (savedFontSize) setFontSize(savedFontSize as 'small' | 'medium' | 'large');

    // Detect system preferences
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion && !savedMotion) {
      setIsReducedMotion(true);
    }
  }, []);

  // Apply accessibility classes
  useEffect(() => {
    const htmlElement = document.documentElement;
    
    if (isHighContrast) {
      htmlElement.classList.add('high-contrast');
    } else {
      htmlElement.classList.remove('high-contrast');
    }

    if (isReducedMotion) {
      htmlElement.classList.add('reduced-motion');
    } else {
      htmlElement.classList.remove('reduced-motion');
    }

    htmlElement.setAttribute('data-font-size', fontSize);
  }, [isHighContrast, isReducedMotion, fontSize]);

  const announceMessage = (message: string) => {
    if (announcer) {
      announcer.textContent = '';
      setTimeout(() => {
        announcer.textContent = message;
      }, 100);
    }
  };

  const setHighContrast = (enabled: boolean) => {
    setIsHighContrast(enabled);
    localStorage.setItem('accessibility-high-contrast', JSON.stringify(enabled));
    announceMessage(enabled ? 'High contrast mode enabled' : 'High contrast mode disabled');
  };

  const setReducedMotion = (enabled: boolean) => {
    setIsReducedMotion(enabled);
    localStorage.setItem('accessibility-reduced-motion', JSON.stringify(enabled));
    announceMessage(enabled ? 'Reduced motion enabled' : 'Reduced motion disabled');
  };

  const handleSetFontSize = (size: 'small' | 'medium' | 'large') => {
    setFontSize(size);
    localStorage.setItem('accessibility-font-size', size);
    announceMessage(`Font size changed to ${size}`);
  };

  return (
    <AccessibilityContext.Provider
      value={{
        announceMessage,
        isHighContrast,
        setHighContrast,
        isReducedMotion,
        setReducedMotion,
        fontSize,
        setFontSize: handleSetFontSize,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (context === undefined) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};