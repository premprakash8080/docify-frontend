/**
 * Template-related TypeScript interfaces and types
 */

export interface Template {
  id: number;
  title: string;
  content: string;
  is_system: boolean;
  user_id: number | null;
  created_at: string;
  updated_at?: string;
}

export interface TemplatesResponse {
  success: boolean;
  msg?: string;
  data: {
    templates: Template[];
  };
}

export interface TemplateResponse {
  success: boolean;
  msg?: string;
  data: {
    template: Template;
  };
}

export interface CreateTemplatePayload {
  title: string;
  content: string;
  is_system?: boolean;
}

export interface CloneTemplatePayload {
  template_id: number;
}

export interface DeleteTemplatePayload {
  id: number;
}

