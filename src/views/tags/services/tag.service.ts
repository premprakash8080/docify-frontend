import httpService from '@/core/http';
import { TAG_ENDPOINTS } from './tag.endpoints';
import type {
  Tag,
  TagColor,
  TagsResponse,
  TagResponse,
  CreateTagPayload,
  UpdateTagPayload,
  DeleteTagPayload,
} from '../types';

/**
 * Tag Service - Using centralized HttpService
 * 
 * Handles all tag-related API calls:
 * - CRUD operations
 */
class TagService {
  /**
   * Get all tags
   * @param showLoader - Whether to show global loader (default: true)
   * @returns Tags response with tags array
   */
  async getAllTags(showLoader = true): Promise<TagsResponse> {
    const response = await httpService.get<{ tags: Tag[] }>(
      TAG_ENDPOINTS.getAllTags,
      { showLoader }
    );

    // Handle response format
    if (response.data && typeof response.data === 'object' && 'data' in response.data) {
      return response.data as TagsResponse;
    }
    return {
      success: true,
      msg: 'Tags fetched successfully',
      data: response.data as { tags: Tag[] },
    };
  }

  /**
   * Get tag by ID
   * @param tagId - Tag ID
   * @param showLoader - Whether to show global loader (default: true)
   * @returns Tag response
   */
  async getTagById(tagId: number, showLoader = true): Promise<TagResponse> {
    const response = await httpService.get<{ tag: Tag }>(
      `${TAG_ENDPOINTS.getTagById}?id=${tagId}`,
      { showLoader }
    );

    if (response.data && typeof response.data === 'object' && 'data' in response.data) {
      return response.data as TagResponse;
    }
    return {
      success: true,
      msg: 'Tag fetched successfully',
      data: response.data as { tag: Tag },
    };
  }

  /**
   * Create a new tag
   * @param payload - Tag creation payload
   * @param showLoader - Whether to show global loader (default: true)
   * @returns Tag response
   */
  async createTag(payload: CreateTagPayload, showLoader = true): Promise<TagResponse> {
    const response = await httpService.post<{ tag: Tag }>(
      TAG_ENDPOINTS.createTag,
      payload,
      { showLoader }
    );

    if (response.data && typeof response.data === 'object' && 'data' in response.data) {
      return response.data as TagResponse;
    }
    return {
      success: true,
      msg: 'Tag created successfully',
      data: response.data as { tag: Tag },
    };
  }

  /**
   * Update an existing tag
   * @param tagId - Tag ID
   * @param payload - Tag update payload
   * @param showLoader - Whether to show global loader (default: true)
   * @returns Tag response
   */
  async updateTag(
    tagId: number,
    payload: UpdateTagPayload,
    showLoader = true
  ): Promise<TagResponse> {
    const response = await httpService.put<{ tag: Tag }>(
      TAG_ENDPOINTS.updateTag(tagId),
      { id: tagId, ...payload },
      { showLoader }
    );

    if (response.data && typeof response.data === 'object' && 'data' in response.data) {
      return response.data as TagResponse;
    }
    return {
      success: true,
      msg: 'Tag updated successfully',
      data: response.data as { tag: Tag },
    };
  }

  /**
   * Delete a tag
   * @param tagId - Tag ID
   * @param showLoader - Whether to show global loader (default: true)
   * @returns Success response
   */
  async deleteTag(tagId: number, showLoader = true): Promise<{ success: boolean; msg?: string }> {
    const response = await httpService.delete(
      TAG_ENDPOINTS.deleteTag(tagId),
      { showLoader }
    );
    return {
      success: true,
      msg: response.data?.msg || 'Tag deleted successfully',
    };
  }

  /**
   * Get all available colors
   * @param showLoader - Whether to show global loader (default: true)
   * @returns Array of TagColor
   */
  async getColors(showLoader = true): Promise<TagColor[]> {
    const response = await httpService.get<{ colors: TagColor[] }>(
      TAG_ENDPOINTS.getColors,
      { showLoader }
    );

    if (response.data && typeof response.data === 'object' && 'data' in response.data) {
      const data = (response.data as { data: { colors: TagColor[] } }).data;
      if (data && 'colors' in data) {
        return data.colors;
      }
    }
    return response.data as TagColor[] || [];
  }
}

export default new TagService();

