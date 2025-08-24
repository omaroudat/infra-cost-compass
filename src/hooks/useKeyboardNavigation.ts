import React, { useEffect, useCallback } from 'react';

interface KeyboardNavigationOptions {
  enableArrowKeys?: boolean;
  enableEnterKey?: boolean;
  enableEscapeKey?: boolean;
  enableTabTrapping?: boolean;
  containerRef?: React.RefObject<HTMLElement>;
}

interface KeyboardHandlers {
  onArrowUp?: () => void;
  onArrowDown?: () => void;
  onArrowLeft?: () => void;
  onArrowRight?: () => void;
  onEnter?: () => void;
  onEscape?: () => void;
  onTab?: (event: KeyboardEvent) => void;
}

export const useKeyboardNavigation = (
  handlers: KeyboardHandlers,
  options: KeyboardNavigationOptions = {}
) => {
  const {
    enableArrowKeys = true,
    enableEnterKey = true,
    enableEscapeKey = true,
    enableTabTrapping = false,
    containerRef
  } = options;

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const { key, target } = event;

    // Skip if the event is from an input element (unless specifically handled)
    if (
      target instanceof HTMLInputElement ||
      target instanceof HTMLTextAreaElement ||
      target instanceof HTMLSelectElement
    ) {
      return;
    }

    switch (key) {
      case 'ArrowUp':
        if (enableArrowKeys && handlers.onArrowUp) {
          event.preventDefault();
          handlers.onArrowUp();
        }
        break;
      case 'ArrowDown':
        if (enableArrowKeys && handlers.onArrowDown) {
          event.preventDefault();
          handlers.onArrowDown();
        }
        break;
      case 'ArrowLeft':
        if (enableArrowKeys && handlers.onArrowLeft) {
          event.preventDefault();
          handlers.onArrowLeft();
        }
        break;
      case 'ArrowRight':
        if (enableArrowKeys && handlers.onArrowRight) {
          event.preventDefault();
          handlers.onArrowRight();
        }
        break;
      case 'Enter':
        if (enableEnterKey && handlers.onEnter) {
          event.preventDefault();
          handlers.onEnter();
        }
        break;
      case 'Escape':
        if (enableEscapeKey && handlers.onEscape) {
          event.preventDefault();
          handlers.onEscape();
        }
        break;
      case 'Tab':
        if (enableTabTrapping && handlers.onTab) {
          handlers.onTab(event);
        }
        break;
    }
  }, [
    handlers,
    enableArrowKeys,
    enableEnterKey,
    enableEscapeKey,
    enableTabTrapping
  ]);

  useEffect(() => {
    const element = containerRef?.current || document;
    
    element.addEventListener('keydown', handleKeyDown);
    
    return () => {
      element.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown, containerRef]);
};

// Hook for managing focus within a list
export const useListNavigation = (
  items: HTMLElement[],
  options: {
    loop?: boolean;
    orientation?: 'horizontal' | 'vertical';
    onSelect?: (index: number) => void;
  } = {}
) => {
  const { loop = true, orientation = 'vertical', onSelect } = options;
  const [currentIndex, setCurrentIndex] = React.useState(-1);

  const focusItem = useCallback((index: number) => {
    if (items[index]) {
      items[index].focus();
      setCurrentIndex(index);
    }
  }, [items]);

  const handleArrowNavigation = useCallback((direction: 'next' | 'previous') => {
    if (items.length === 0) return;

    let newIndex = currentIndex;
    
    if (direction === 'next') {
      newIndex = currentIndex === -1 ? 0 : currentIndex + 1;
      if (newIndex >= items.length) {
        newIndex = loop ? 0 : items.length - 1;
      }
    } else {
      newIndex = currentIndex === -1 ? items.length - 1 : currentIndex - 1;
      if (newIndex < 0) {
        newIndex = loop ? items.length - 1 : 0;
      }
    }

    focusItem(newIndex);
  }, [currentIndex, items, loop, focusItem]);

  const keyboardHandlers = {
    onArrowDown: orientation === 'vertical' ? () => handleArrowNavigation('next') : undefined,
    onArrowUp: orientation === 'vertical' ? () => handleArrowNavigation('previous') : undefined,
    onArrowRight: orientation === 'horizontal' ? () => handleArrowNavigation('next') : undefined,
    onArrowLeft: orientation === 'horizontal' ? () => handleArrowNavigation('previous') : undefined,
    onEnter: () => {
      if (currentIndex >= 0 && onSelect) {
        onSelect(currentIndex);
      }
    }
  };

  useKeyboardNavigation(keyboardHandlers);

  return {
    currentIndex,
    focusItem,
    focusFirst: () => focusItem(0),
    focusLast: () => focusItem(items.length - 1)
  };
};

// Hook for roving tabindex pattern
export const useRovingTabIndex = (
  containerRef: React.RefObject<HTMLElement>,
  options: {
    direction?: 'horizontal' | 'vertical' | 'both';
    loop?: boolean;
    selector?: string;
  } = {}
) => {
  const {
    direction = 'both',
    loop = true,
    selector = '[role="button"], button, [tabindex="0"]'
  } = options;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const focusableElements = Array.from(
      container.querySelectorAll(selector)
    ) as HTMLElement[];

    let currentIndex = 0;

    // Set initial tabindex values
    focusableElements.forEach((element, index) => {
      element.tabIndex = index === 0 ? 0 : -1;
    });

    const updateTabIndex = (newIndex: number) => {
      focusableElements.forEach((element, index) => {
        element.tabIndex = index === newIndex ? 0 : -1;
      });
      currentIndex = newIndex;
      focusableElements[newIndex]?.focus();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      const { key } = event;
      let newIndex = currentIndex;
      let shouldPrevent = false;

      if ((direction === 'horizontal' || direction === 'both') && key === 'ArrowRight') {
        newIndex = currentIndex + 1;
        shouldPrevent = true;
      } else if ((direction === 'horizontal' || direction === 'both') && key === 'ArrowLeft') {
        newIndex = currentIndex - 1;
        shouldPrevent = true;
      } else if ((direction === 'vertical' || direction === 'both') && key === 'ArrowDown') {
        newIndex = currentIndex + 1;
        shouldPrevent = true;
      } else if ((direction === 'vertical' || direction === 'both') && key === 'ArrowUp') {
        newIndex = currentIndex - 1;
        shouldPrevent = true;
      } else if (key === 'Home') {
        newIndex = 0;
        shouldPrevent = true;
      } else if (key === 'End') {
        newIndex = focusableElements.length - 1;
        shouldPrevent = true;
      }

      if (shouldPrevent) {
        event.preventDefault();
        
        // Handle looping
        if (newIndex < 0) {
          newIndex = loop ? focusableElements.length - 1 : 0;
        } else if (newIndex >= focusableElements.length) {
          newIndex = loop ? 0 : focusableElements.length - 1;
        }

        updateTabIndex(newIndex);
      }
    };

    const handleFocus = (event: FocusEvent) => {
      const focusedIndex = focusableElements.indexOf(event.target as HTMLElement);
      if (focusedIndex >= 0) {
        updateTabIndex(focusedIndex);
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    container.addEventListener('focusin', handleFocus);

    return () => {
      container.removeEventListener('keydown', handleKeyDown);
      container.removeEventListener('focusin', handleFocus);
    };
  }, [containerRef, direction, loop, selector]);
};