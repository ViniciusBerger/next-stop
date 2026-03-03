import { useState, useCallback } from 'react';

interface ValidationRule {
  field: string;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
  match?: string; // field name to match against
}

interface FormErrors {
  [key: string]: string;
}

interface FormTouched {
  [key: string]: boolean;
}

// Add a generic type for form values
export const useFormValidation = <T extends Record<string, any>>(
  initialValues: T, 
  rules: ValidationRule[]
) => {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<FormTouched>({});

  const validateField = useCallback((field: string, value: any): string => {
    const rule = rules.find(r => r.field === field);
    if (!rule) return '';

    if (rule.required && (!value || value.toString().trim() === '')) {
      return `${field} is required`;
    }

    if (rule.minLength && value.length < rule.minLength) {
      return `${field} must be at least ${rule.minLength} characters`;
    }

    if (rule.maxLength && value.length > rule.maxLength) {
      return `${field} must be less than ${rule.maxLength} characters`;
    }

    if (rule.pattern && !rule.pattern.test(value)) {
      return `Invalid ${field} format`;
    }

    if (rule.match && values[rule.match as keyof T] !== value) {
      return `${field} does not match`;
    }

    if (rule.custom) {
      return rule.custom(value) || '';
    }

    return '';
  }, [rules, values]);

  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    rules.forEach(rule => {
      const error = validateField(rule.field, values[rule.field as keyof T]);
      if (error) {
        newErrors[rule.field] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [rules, values, validateField]);

  const handleChange = useCallback((field: string, value: any) => {
    // Fixed with proper typing
    setValues((prev: T) => ({ ...prev, [field]: value }));
    
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  }, [errors]);

  const handleBlur = useCallback((field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    
    const error = validateField(field, values[field as keyof T]);
    setErrors(prev => ({ ...prev, [field]: error }));
  }, [values, validateField]);

  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateForm,
    resetForm,
    setValues,
  };
};

// Common validation patterns
export const VALIDATION_PATTERNS = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d\w\W]{8,}$/,
  username: /^[a-zA-Z0-9._]{3,20}$/,
  phone: /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/,
  url: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
};

// Common validation messages
export const VALIDATION_MESSAGES = {
  required: (field: string) => `${field} is required`,
  minLength: (field: string, length: number) => 
    `${field} must be at least ${length} characters`,
  maxLength: (field: string, length: number) => 
    `${field} must be less than ${length} characters`,
  invalid: (field: string) => `Invalid ${field} format`,
  match: (field: string, matchField: string) => 
    `${field} does not match ${matchField}`,
};