
import { Field } from "./types";

export function validateField(field: Field, value: any): string | null {
  if (field.required && !value) {
    return "This field is required";
  }
  if (field.minLength && value && value.length < field.minLength) {
    return `Minimum length is ${field.minLength} characters`;
  }
  if (field.maxLength && value && value.length > field.maxLength) {
    return `Maximum length is ${field.maxLength} characters`;
  }
  if (field.pattern && value) {
    const regex = new RegExp(field.pattern);
    if (!regex.test(value)) {
      return "Invalid format";
    }
  }
  return null;
}