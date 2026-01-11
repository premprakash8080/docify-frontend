/**
 * Notebook API Endpoints - Relative paths only
 * Base URL is automatically prefixed by HttpService
 */
export const ENDPOINTS = {
  getAllStacks: '/stacks',
  createStack: '/stacks',
  updateStack: (stackId: string) => `/stacks/${stackId}`,
  deleteStack: (stackId: string) => `/stacks/${stackId}`,
  getAllNotebooks: '/notebooks/list',
  createNotebook: '/notebooks/createNotebook',
  updateNotebook: (notebookId: string) => `/notebooks/${notebookId}`,
  deleteNotebook: (notebookId: string) => `/notebooks/${notebookId}`,
  moveNotebookToStack: '/notebooks/stack/updateNotebookStack',
  getStackNotebooks: (stackId: string) => `/stacks/${stackId}/notebooks`,
  getNotebookNotes: (notebookId: string) => `/notebooks/${notebookId}/notes`,
  getNotebookNotesById: '/notebooks/getNotebookNotesById',
  deleteNotes: '/notes/deleteNotes',
} as const;

