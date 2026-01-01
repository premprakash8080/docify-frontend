/**
 * API Endpoints - Relative paths only
 * Base URL is automatically prefixed by HttpService
 */
export const ENDPOINTS = {
  getAllNotes: '/notes/getAllNotes',
  createNote: '/notes',
  updateNote: (noteId: string) => `/notes/${noteId}`,
  deleteNote: (noteId: string) => `/notes/${noteId}`,
  getAllNotebooks: '/notebooks/list',
} as const;

