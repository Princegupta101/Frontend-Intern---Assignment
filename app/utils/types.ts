export type FieldType = "text" | "textarea" | "dropdown" | "checkbox" | "date";

export interface Field {
  id: string;
  type: FieldType;
  label: string;
  placeholder: string;
  required: boolean;
  helpText: string;
  options?: string[];
  step?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
}