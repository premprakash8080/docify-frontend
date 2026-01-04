/**
 * Template API Endpoints - Relative paths only
 * Base URL is automatically prefixed by HttpService
 */
export const TEMPLATE_ENDPOINTS = {
  getAllTemplates: '/templates/getAllTemplates',
  getSystemTemplates: '/templates/getSystemTemplates',
  getMyTemplates: '/templates/getMyTemplates',
  getTemplateById: '/templates/getTemplateById',
  createTemplate: '/templates/createTemplate',
  cloneTemplate: '/templates/cloneTemplate',
  deleteTemplate: (templateId: number) => `/templates/deleteTemplate/${templateId}`,
} as const;

