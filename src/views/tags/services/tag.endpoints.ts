/**
 * Tag API Endpoints - Relative paths only
 * Base URL is automatically prefixed by HttpService
 */
export const TAG_ENDPOINTS = {
  getAllTags: '/tags',
  getTagById: '/tags/getTagById',
  createTag: '/tags',
  updateTag: (tagId: number) => `/tags/${tagId}`,
  deleteTag: (tagId: number) => `/tags/${tagId}`,
  getColors: '/tags/colors',
} as const;

