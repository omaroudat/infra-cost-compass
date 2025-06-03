
export interface ValidationRule {
  field: string;
  value: any;
  rules: Array<{
    type: 'required' | 'email' | 'min' | 'max' | 'pattern' | 'number';
    value?: any;
    message: string;
  }>;
}

export const validateField = (rule: ValidationRule): string | null => {
  const { field, value, rules } = rule;
  
  for (const validationRule of rules) {
    switch (validationRule.type) {
      case 'required':
        if (!value || (typeof value === 'string' && value.trim() === '')) {
          return validationRule.message;
        }
        break;
        
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (value && !emailRegex.test(value)) {
          return validationRule.message;
        }
        break;
        
      case 'min':
        if (typeof value === 'string' && value.length < validationRule.value) {
          return validationRule.message;
        }
        if (typeof value === 'number' && value < validationRule.value) {
          return validationRule.message;
        }
        break;
        
      case 'max':
        if (typeof value === 'string' && value.length > validationRule.value) {
          return validationRule.message;
        }
        if (typeof value === 'number' && value > validationRule.value) {
          return validationRule.message;
        }
        break;
        
      case 'number':
        if (value && isNaN(Number(value))) {
          return validationRule.message;
        }
        break;
        
      case 'pattern':
        if (value && !validationRule.value.test(value)) {
          return validationRule.message;
        }
        break;
    }
  }
  
  return null;
};

export const validateForm = (rules: ValidationRule[]): string[] => {
  const errors: string[] = [];
  
  for (const rule of rules) {
    const error = validateField(rule);
    if (error) {
      errors.push(error);
    }
  }
  
  return errors;
};

export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};

export const validateWIRData = (data: any): string[] => {
  const rules: ValidationRule[] = [
    {
      field: 'wirNumber',
      value: data.wirNumber,
      rules: [
        { type: 'required', message: 'WIR Number is required' },
        { type: 'min', value: 3, message: 'WIR Number must be at least 3 characters' }
      ]
    },
    {
      field: 'description',
      value: data.description,
      rules: [
        { type: 'required', message: 'Description is required' },
        { type: 'min', value: 10, message: 'Description must be at least 10 characters' }
      ]
    },
    {
      field: 'contractor',
      value: data.contractor,
      rules: [
        { type: 'required', message: 'Contractor is required' }
      ]
    },
    {
      field: 'engineer',
      value: data.engineer,
      rules: [
        { type: 'required', message: 'Engineer is required' }
      ]
    },
    {
      field: 'lengthOfLine',
      value: data.lengthOfLine,
      rules: [
        { type: 'required', message: 'Length of line is required' },
        { type: 'number', message: 'Length of line must be a valid number' },
        { type: 'min', value: 0, message: 'Length of line must be positive' }
      ]
    },
    {
      field: 'diameterOfLine',
      value: data.diameterOfLine,
      rules: [
        { type: 'required', message: 'Diameter of line is required' },
        { type: 'number', message: 'Diameter of line must be a valid number' },
        { type: 'min', value: 0, message: 'Diameter of line must be positive' }
      ]
    }
  ];
  
  return validateForm(rules);
};
