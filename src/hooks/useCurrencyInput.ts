import { useState, useCallback } from 'react';

/**
 * Custom hook for formatting currency input
 * Formats numbers with thousand separators as user types
 * Example: 100000 -> 100,000
 */
export const useCurrencyInput = (initialValue: string | number = '') => {
  const [displayValue, setDisplayValue] = useState(formatNumber(initialValue.toString()));
  const [rawValue, setRawValue] = useState(initialValue.toString());

  const handleChange = useCallback((value: string) => {
    // Remove all non-digit characters
    const numericValue = value.replace(/[^\d]/g, '');
    
    // Update raw value (for API submission)
    setRawValue(numericValue);
    
    // Update display value (formatted with commas)
    setDisplayValue(formatNumber(numericValue));
    
    return numericValue;
  }, []);

  const setValue = useCallback((value: string | number) => {
    const stringValue = value.toString();
    setRawValue(stringValue);
    setDisplayValue(formatNumber(stringValue));
  }, []);

  const reset = useCallback(() => {
    setRawValue('');
    setDisplayValue('');
  }, []);

  return {
    displayValue,   // Use this for input value (formatted: "100,000")
    rawValue,       // Use this for API submission (raw: "100000")
    handleChange,   // Use this for onChange handler
    setValue,       // Use this to programmatically set value
    reset,          // Use this to clear the input
  };
};

/**
 * Format a number string with thousand separators
 * @param value - The numeric string to format
 * @returns Formatted string with commas
 */
export function formatNumber(value: string): string {
  if (!value || value === '0') return '';
  
  // Remove leading zeros
  const trimmed = value.replace(/^0+/, '') || '0';
  
  // Add thousand separators
  return trimmed.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Remove thousand separators from a formatted number string
 * @param value - The formatted string to parse
 * @returns Raw numeric string
 */
export function parseNumber(value: string): string {
  return value.replace(/[^\d]/g, '');
}

/**
 * Format number for display with VND currency
 * @param value - The numeric value
 * @returns Formatted string like "100,000 VND"
 */
export function formatVND(value: string | number): string {
  const numericValue = typeof value === 'string' ? parseNumber(value) : value.toString();
  if (!numericValue || numericValue === '0') return '0 VND';
  
  return `${formatNumber(numericValue)} VND`;
}
