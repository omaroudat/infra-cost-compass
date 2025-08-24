import React from 'react';
import { useAccessibility } from './AccessibilityProvider';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface FormFieldProps {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  success?: string;
  helpText?: string;
  children: React.ReactNode;
}

export const AccessibleFormField: React.FC<FormFieldProps> = ({
  id,
  label,
  required = false,
  error,
  success,
  helpText,
  children
}) => {
  const { announceMessage } = useAccessibility();
  const errorId = `${id}-error`;
  const helpId = `${id}-help`;
  const successId = `${id}-success`;

  React.useEffect(() => {
    if (error) {
      announceMessage(`Error in ${label}: ${error}`);
    }
  }, [error, label, announceMessage]);

  return (
    <div className="space-y-2">
      <Label 
        htmlFor={id}
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        {label}
        {required && (
          <span className="text-destructive ml-1" aria-label="required">
            *
          </span>
        )}
      </Label>
      
      <div className="relative">
        {React.cloneElement(children as React.ReactElement, {
          id,
          'aria-invalid': error ? 'true' : 'false',
          'aria-describedby': [
            helpText && helpId,
            error && errorId,
            success && successId
          ].filter(Boolean).join(' ') || undefined,
          'aria-required': required
        })}
        
        {/* Success icon */}
        {success && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <CheckCircle2 className="h-4 w-4 text-success" />
          </div>
        )}
        
        {/* Error icon */}
        {error && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <AlertCircle className="h-4 w-4 text-destructive" />
          </div>
        )}
      </div>

      {/* Help text */}
      {helpText && (
        <p id={helpId} className="text-xs text-muted-foreground">
          {helpText}
        </p>
      )}

      {/* Error message */}
      {error && (
        <p id={errorId} role="alert" className="text-xs text-destructive flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          {error}
        </p>
      )}

      {/* Success message */}
      {success && (
        <p id={successId} role="status" className="text-xs text-success flex items-center gap-1">
          <CheckCircle2 className="h-3 w-3" />
          {success}
        </p>
      )}
    </div>
  );
};

// Accessible Input Component
interface AccessibleInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  success?: string;
  helpText?: string;
}

export const AccessibleInput: React.FC<AccessibleInputProps> = ({
  id,
  label,
  required,
  error,
  success,
  helpText,
  ...props
}) => (
  <AccessibleFormField
    id={id!}
    label={label}
    required={required}
    error={error}
    success={success}
    helpText={helpText}
  >
    <Input {...props} />
  </AccessibleFormField>
);

// Accessible Textarea Component
interface AccessibleTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  success?: string;
  helpText?: string;
}

export const AccessibleTextarea: React.FC<AccessibleTextareaProps> = ({
  id,
  label,
  required,
  error,
  success,
  helpText,
  ...props
}) => (
  <AccessibleFormField
    id={id!}
    label={label}
    required={required}
    error={error}
    success={success}
    helpText={helpText}
  >
    <Textarea {...props} />
  </AccessibleFormField>
);

// Accessible Select Component
interface AccessibleSelectProps {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  success?: string;
  helpText?: string;
  placeholder?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  options: { value: string; label: string }[];
}

export const AccessibleSelect: React.FC<AccessibleSelectProps> = ({
  id,
  label,
  required,
  error,
  success,
  helpText,
  placeholder = "Select an option",
  value,
  onValueChange,
  options
}) => (
  <AccessibleFormField
    id={id}
    label={label}
    required={required}
    error={error}
    success={success}
    helpText={helpText}
  >
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </AccessibleFormField>
);

// Accessible Checkbox Component
interface AccessibleCheckboxProps {
  id: string;
  label: string;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  error?: string;
  helpText?: string;
}

export const AccessibleCheckbox: React.FC<AccessibleCheckboxProps> = ({
  id,
  label,
  checked,
  onCheckedChange,
  error,
  helpText
}) => {
  const errorId = `${id}-error`;
  const helpId = `${id}-help`;

  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <Checkbox
          id={id}
          checked={checked}
          onCheckedChange={onCheckedChange}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={[
            helpText && helpId,
            error && errorId
          ].filter(Boolean).join(' ') || undefined}
        />
        <Label htmlFor={id} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {label}
        </Label>
      </div>

      {helpText && (
        <p id={helpId} className="text-xs text-muted-foreground ml-6">
          {helpText}
        </p>
      )}

      {error && (
        <p id={errorId} role="alert" className="text-xs text-destructive flex items-center gap-1 ml-6">
          <AlertCircle className="h-3 w-3" />
          {error}
        </p>
      )}
    </div>
  );
};

// Accessible Radio Group Component
interface AccessibleRadioGroupProps {
  name: string;
  label: string;
  value?: string;
  onValueChange?: (value: string) => void;
  options: { value: string; label: string }[];
  error?: string;
  helpText?: string;
  required?: boolean;
}

export const AccessibleRadioGroup: React.FC<AccessibleRadioGroupProps> = ({
  name,
  label,
  value,
  onValueChange,
  options,
  error,
  helpText,
  required
}) => {
  const errorId = `${name}-error`;
  const helpId = `${name}-help`;

  return (
    <div className="space-y-3">
      <fieldset>
        <legend className="text-sm font-medium leading-none">
          {label}
          {required && (
            <span className="text-destructive ml-1" aria-label="required">
              *
            </span>
          )}
        </legend>
        
        <RadioGroup
          value={value}
          onValueChange={onValueChange}
          className="mt-2"
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={[
            helpText && helpId,
            error && errorId
          ].filter(Boolean).join(' ') || undefined}
        >
          {options.map((option) => (
            <div key={option.value} className="flex items-center space-x-2">
              <RadioGroupItem value={option.value} id={`${name}-${option.value}`} />
              <Label htmlFor={`${name}-${option.value}`} className="text-sm">
                {option.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </fieldset>

      {helpText && (
        <p id={helpId} className="text-xs text-muted-foreground">
          {helpText}
        </p>
      )}

      {error && (
        <p id={errorId} role="alert" className="text-xs text-destructive flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          {error}
        </p>
      )}
    </div>
  );
};