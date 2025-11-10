// validation.ts - Compact validation with real-time checking

export interface ValidationError {
  field: string;
  message: string;
}

interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

interface ValidationRule {
  min: number;
  max?: number;
  required: boolean;
  integer?: boolean;
}

interface ValidationRules {
  title: ValidationRule;
  description: ValidationRule;
  price: ValidationRule;
  make: ValidationRule;
  model: ValidationRule;
  year: ValidationRule;
  mileage: ValidationRule;
  batteryCapacity: ValidationRule;
  batteryHealth: ValidationRule;
}

const currentYear = new Date().getFullYear();

// Validation rules
const RULES: ValidationRules = {
  title: { min: 5, max: 100, required: true },
  description: { min: 20, max: 5000, required: true },
  price: { min: 0.01, required: true },
  make: { min: 2, required: true },
  model: { min: 1, required: true },
  year: { min: 1990, max: currentYear + 1, required: true },
  mileage: { min: 0, integer: true, required: true },
  batteryCapacity: { min: 0.01, required: true },
  batteryHealth: { min: 0, max: 100, required: false }
};
  
// Single field validation - returns translation key instead of hardcoded message
export function validateField(
  fieldName: string, 
  value: any, 
  listingType: 'vehicle' | 'battery'
): string | null {
  if (!value && RULES[fieldName as keyof typeof RULES]?.required) {
    return `seller.addListing.validation.${fieldName}Required`;
  }
  if (!value) return null;

  const rule = RULES[fieldName as keyof typeof RULES];
  const numValue = Number(value);

  switch (fieldName) {
    case 'title':
      if (value.trim().length < rule.min) return 'seller.addListing.validation.titleMinLength';
      if (rule.max && value.trim().length > rule.max) return 'seller.addListing.validation.titleMaxLength';
      break;

    case 'description':
      if (value.trim().length < rule.min) return 'seller.addListing.validation.descriptionMinLength';
      if (rule.max && value.trim().length > rule.max) return 'seller.addListing.validation.descriptionMaxLength';
      break;

    case 'price':
      if (isNaN(numValue) || numValue <= 0) return 'seller.addListing.validation.pricePositive';
      break;

    case 'batteryCapacity':
      if (isNaN(numValue) || numValue <= 0) return 'seller.addListing.validation.batteryCapacityPositive';
      break;

    case 'make':
      if (value.trim().length < rule.min) return 'seller.addListing.validation.makeMinLength';
      break;

    case 'model':
      if (listingType === 'vehicle' && value.trim().length < rule.min) 
        return 'seller.addListing.validation.modelRequired';
      break;

    case 'year':
      if (isNaN(numValue) || numValue < rule.min || (rule.max && numValue > rule.max))
        return 'seller.addListing.validation.yearRange';
      break;

    case 'mileage':
      if (listingType === 'vehicle') {
        if (isNaN(numValue) || numValue < 0 || !Number.isInteger(numValue))
          return 'seller.addListing.validation.mileageInteger';
      }
      break;

    case 'batteryHealth':
      if (isNaN(numValue) || numValue < 0 || numValue > 100)
        return 'seller.addListing.validation.batteryHealthRange';
      break;
  }

  return null;
}
  
  // Full form validation (unified)
  export function validateForm(
    formData: any, 
    listingType: 'vehicle' | 'battery'
  ): ValidationResult {
    const errors: ValidationError[] = [];
    
    const requiredFields = listingType === 'vehicle'
      ? ['title', 'description', 'price', 'make', 'model', 'year', 'mileage']
      : ['title', 'description', 'price', 'year', 'batteryCapacity', 'make'];
  
    requiredFields.forEach(field => {
      const error = validateField(field, formData[field], listingType);
      if (error) errors.push({ field, message: error });
    });
  
    // Optional fields
    if (formData.batteryHealth) {
      const error = validateField('batteryHealth', formData.batteryHealth, listingType);
      if (error) errors.push({ field: 'batteryHealth', message: error });
    }
  
    return { isValid: errors.length === 0, errors };
  }
  
  // Backward compatibility exports
  export const validateBatteryForm = (formData: any) => validateForm(formData, 'battery');
  export const validateVehicleForm = (formData: any) => validateForm(formData, 'vehicle');
  
  // Helper functions
  export const getFieldError = (errors: ValidationError[], field: string) =>
    errors.find(e => e.field === field)?.message || null;
  
  export const hasFieldError = (errors: ValidationError[], field: string) =>
    errors.some(e => e.field === field);
  
  export const parseApiValidationErrors = (apiResponse: any): Record<string, string> => {
    const errors: Record<string, string> = {};
    
    if (Array.isArray(apiResponse.errors)) {
      apiResponse.errors.forEach((e: any) => {
        if (e.field && e.message) errors[e.field] = e.message;
      });
    } else if (apiResponse.errors || apiResponse.details) {
      Object.entries(apiResponse.errors || apiResponse.details).forEach(([k, v]) => {
        errors[k] = String(v);
      });
    }
    
    return errors;
  };
  
  export const useApiValidation = () => ({
    setApiErrors: (errors: Record<string, string>) =>  errors
  });