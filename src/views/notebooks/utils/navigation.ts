import { useNavigate } from 'react-router';
import type { StackWithNotebooks, NotebookWithNotes } from '../types';
import type { Note } from '@/views/Dashboard/types';

/**
 * Helper function to find which stack contains a notebook
 */
export const findStackIdForNotebook = (
  notebookId: string,
  stacks: StackWithNotebooks[]
): string | null => {
  for (const stack of stacks) {
    const notebook = stack.notebooks?.find((nb) => nb.id === notebookId);
    if (notebook) {
      return stack.id;
    }
  }
  return null;
};

/**
 * Navigation handlers for notebooks view
 */
export const useNotebooksNavigation = (stacks: StackWithNotebooks[]) => {
  const navigate = useNavigate();

  /**
   * Navigate to notebook notes page
   */
  const onNotebookClick = (notebook: NotebookWithNotes) => {
    navigate(`/notes/notebook/${notebook.id}/notes`);
  };

  /**
   * Navigate to note page based on notebook's stack status
   */
  const onNoteClick = (note: Note) => {
    const notebookId = note.notebook_id;
    
    if (!notebookId) {
      // Fallback: Navigate to note directly
      navigate(`/notes/${note.id}`);
      return;
    }

    // Convert notebookId to string for comparison (notebooks have string IDs)
    const notebookIdStr = String(notebookId);
    
    // Check if notebook is in a stack
    const stackId = findStackIdForNotebook(notebookIdStr, stacks);
    
    if (stackId) {
      // Notebook is in a stack
      navigate(`/notes/stack/${stackId}/notebook/${notebookIdStr}/note/${note.id}`);
    } else {
      // Notebook is unstacked
      navigate(`/notes/notebook/${notebookIdStr}/note/${note.id}`);
    }
  };

  /**
   * Navigate to stack notebooks page
   * If stack not expanded, expand it first
   */
  const onStackNameClick = (
    stack: StackWithNotebooks,
    isExpanded: boolean,
    onExpand: () => void
  ) => {
    if (!isExpanded) {
      onExpand();
    }
    navigate(`/notes/stack/${stack.id}/notebooks`);
  };

  /**
   * Navigate to stack notebooks page (from grid view)
   */
  const onGridStackClick = (stack: StackWithNotebooks) => {
    navigate(`/notes/stack/${stack.id}/notebooks`);
  };

  /**
   * Navigate based on row type (note or notebook) from grid view
   */
  const onGridNotebookOrNoteClick = (row: NotebookWithNotes | Note) => {
    // Check if it's a note (has title property)
    if ('title' in row && row.title !== undefined) {
      // It's a note
      onNoteClick(row as Note);
    } else {
      // It's a notebook
      onNotebookClick(row as NotebookWithNotes);
    }
  };

  return {
    onNotebookClick,
    onNoteClick,
    onStackNameClick,
    onGridStackClick,
    onGridNotebookOrNoteClick,
    findStackIdForNotebook: (notebookId: string) => findStackIdForNotebook(notebookId, stacks),
  };
};

