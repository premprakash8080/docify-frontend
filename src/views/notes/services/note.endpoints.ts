/**
 * API Endpoints for Notes - Relative paths only
 * Base URL is automatically prefixed by HttpService
 */
export const NOTES_ENDPOINTS = {
  // CRUD
  getAllNotes: '/notes/getAllNotes',
  getNotesName: '/notes/getNotesName',
  getNoteById: '/notes/getNoteById',
  createNote: '/notes',
  updateNote: (id: string) => `/notes/${id}`,
  deleteNote: '/notes/deleteNote',

  // Notebook operations
  moveNoteToNotebook: (id: string, notebookId: string) => `/notes/${id}/notebook/${notebookId}`,
  createNotebook: '/notebooks/createNotebook',

  // State operations
  pinNote: (id: string) => `/notes/${id}/pin`,
  unpinNote: (id: string) => `/notes/${id}/unpin`,
  archiveNote: (id: string) => `/notes/${id}/archive`,
  unarchiveNote: (id: string) => `/notes/${id}/unarchive`,
  trashNote: (id: string) => `/notes/${id}/trash`,
  restoreNote: (id: string) => `/notes/${id}/restore`,

  // Sync
  markNoteSynced: (id: string) => `/notes/${id}/synced`,

  // Files & Tasks
  getNoteFiles: (id: string) => `/notes/${id}/files`,
  getNoteTasks: (id: string) => `/notes/${id}/tasks`,

  // Content operations
  saveNoteContent: (id: string) => `/notes/${id}/content`,

  // Image operations
  uploadNoteImage: '/notes/images',
  getNoteImages: '/notes/images',
  deleteNoteImage: (id: string) => `/notes/images/${id}`,

  // Tags
  getUserTags: '/tags/getUserTags',
  addTagToNote: '/notes/addTagToNote',
  removeTagFromNote: '/notes/removeTagFromNote',
  createTag: '/tags/createTag',
  getTagById: (id: number) => `/tags/getTagById?id=${id}`,

  // Move / Stack
  getNoteWithStack: (noteId: string) => `/notes/${noteId}/with-stack`,
  getNotebooksWithStacks: '/notebooks/with-stacks',
} as const;

