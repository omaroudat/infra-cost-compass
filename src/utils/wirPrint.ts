import { WIR, BOQItem } from '@/types';
import React from 'react';
import { createRoot } from 'react-dom/client';
import WIRPrintView from '@/components/wir/WIRPrintView';

export const printWIR = (wir: WIR, flattenedBOQItems: BOQItem[]) => {
  // Create a temporary container
  const printContainer = document.createElement('div');
  printContainer.className = 'print:block';
  printContainer.style.position = 'fixed';
  printContainer.style.top = '-9999px';
  printContainer.style.left = '-9999px';
  printContainer.style.width = '210mm'; // A4 width
  printContainer.style.background = 'white';
  document.body.appendChild(printContainer);

  // Function to handle print
  const handlePrint = () => {
    // Hide everything except our print content
    document.body.classList.add('print-mode');
    
    // Trigger print
    window.print();
    
    // Clean up after printing
    setTimeout(() => {
      document.body.classList.remove('print-mode');
      document.body.removeChild(printContainer);
    }, 1000);
  };

  // Render the WIRPrintView component
  const root = createRoot(printContainer);
  root.render(
    React.createElement(WIRPrintView, {
      wir,
      flattenedBOQItems,
      onPrintReady: handlePrint,
    })
  );
};
