import httpService from '@/core/http';
import { TEMPLATE_ENDPOINTS } from './template.endpoints';
import type {
  Template,
  TemplatesResponse,
  TemplateResponse,
  CreateTemplatePayload,
  CloneTemplatePayload,
} from '../types';

class TemplateService {
  async getAllTemplates(showLoader = true): Promise<TemplatesResponse> {
    const response = await httpService.get<{ templates: Template[] }>(
      TEMPLATE_ENDPOINTS.getAllTemplates,
      { showLoader }
    );

    if (response.data && typeof response.data === 'object' && 'data' in response.data) {
      return response.data as TemplatesResponse;
    }
    return {
      success: true,
      msg: 'Templates fetched successfully',
      data: response.data as { templates: Template[] },
    };
  }

  async getSystemTemplates(showLoader = true): Promise<TemplatesResponse> {
    const response = await httpService.get<{ templates: Template[] }>(
      TEMPLATE_ENDPOINTS.getSystemTemplates,
      { showLoader }
    );

    if (response.data && typeof response.data === 'object' && 'data' in response.data) {
      return response.data as TemplatesResponse;
    }
    return {
      success: true,
      msg: 'System templates fetched successfully',
      data: response.data as { templates: Template[] },
    };
  }

  async getMyTemplates(showLoader = true): Promise<TemplatesResponse> {
    const response = await httpService.get<{ templates: Template[] }>(
      TEMPLATE_ENDPOINTS.getMyTemplates,
      { showLoader }
    );

    if (response.data && typeof response.data === 'object' && 'data' in response.data) {
      return response.data as TemplatesResponse;
    }
    return {
      success: true,
      msg: 'User templates fetched successfully',
      data: response.data as { templates: Template[] },
    };
  }

  async getTemplateById(templateId: number, showLoader = true): Promise<TemplateResponse> {
    const response = await httpService.get<{ template: Template }>(
      `${TEMPLATE_ENDPOINTS.getTemplateById}?id=${templateId}`,
      { showLoader }
    );

    if (response.data && typeof response.data === 'object' && 'data' in response.data) {
      return response.data as TemplateResponse;
    }
    return {
      success: true,
      msg: 'Template fetched successfully',
      data: response.data as { template: Template },
    };
  }

  async createTemplate(payload: CreateTemplatePayload, showLoader = true): Promise<TemplateResponse> {
    const response = await httpService.post<{ template: Template }>(
      TEMPLATE_ENDPOINTS.createTemplate,
      payload,
      { showLoader }
    );

    if (response.data && typeof response.data === 'object' && 'data' in response.data) {
      return response.data as TemplateResponse;
    }
    return {
      success: true,
      msg: 'Template created successfully',
      data: response.data as { template: Template },
    };
  }

  async cloneTemplate(payload: CloneTemplatePayload, showLoader = true): Promise<TemplateResponse> {
    const response = await httpService.post<{ template: Template }>(
      TEMPLATE_ENDPOINTS.cloneTemplate,
      payload,
      { showLoader }
    );

    if (response.data && typeof response.data === 'object' && 'data' in response.data) {
      return response.data as TemplateResponse;
    }
    return {
      success: true,
      msg: 'Template cloned successfully',
      data: response.data as { template: Template },
    };
  }

  async deleteTemplate(templateId: number, showLoader = true): Promise<{ success: boolean; msg?: string }> {
    const response = await httpService.delete(
      TEMPLATE_ENDPOINTS.deleteTemplate(templateId),
      { showLoader }
    );
    return {
      success: true,
      msg: response.data?.msg || 'Template deleted successfully',
    };
  }
}

export default new TemplateService();

