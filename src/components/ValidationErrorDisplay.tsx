
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

interface ValidationErrorDisplayProps {
  errors: string[];
  className?: string;
}

const ValidationErrorDisplay: React.FC<ValidationErrorDisplayProps> = ({ 
  errors, 
  className = '' 
}) => {
  if (!errors || errors.length === 0) return null;

  return (
    <Alert variant="destructive" className={className}>
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription>
        {errors.length === 1 ? (
          errors[0]
        ) : (
          <ul className="list-disc list-inside space-y-1">
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        )}
      </AlertDescription>
    </Alert>
  );
};

export default ValidationErrorDisplay;
