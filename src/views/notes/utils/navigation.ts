import { useLocation, useNavigate, useParams } from 'react-router';
import type { Note } from '../types';

/**
 * Route parameters interface
 */
export interface RouteParams {
  noteId?: string;
  notebookId?: string;
  stackId?: string;
  tagId?: string;
}

/**
 * Navigation context from current route
 */
export interface NavigationContext {
  stackId?: string;
  notebookId?: string;
  tagId?: string;
  noteId?: string;
  routeType: 'dashboard' | 'new' | 'tag' | 'stack' | 'notebook' | 'note' | 'unknown';
}

/**
 * Get all params from route (parent + current)
 * Collects params from route tree and returns merged params object
 */
export const getAllParams = (params: Record<string, string | undefined>): RouteParams => {
  return {
    noteId: params.noteId,
    notebookId: params.notebookId,
    stackId: params.stackId,
    tagId: params.tagId,
  };
};

/**
 * Parse navigation context from current route
 */
export const parseNavigationContext = (location: ReturnType<typeof useLocation>): NavigationContext => {
  const pathSegments = location.pathname.split('/').filter(Boolean);
  
  // Check for static routes first (priority)
  if (pathSegments[1] === 'dashboard') {
    return {
      routeType: 'dashboard',
    };
  }
  
  if (pathSegments[1] === 'new') {
    return {
      routeType: 'new',
    };
  }
  
  // Check for tag route
  if (pathSegments[1] === 'tags' && pathSegments[2]) {
    return {
      tagId: pathSegments[2],
      routeType: 'tag',
    };
  }
  
  // Check for stack routes (priority over notebook routes)
  const stackIndex = pathSegments.indexOf('stack');
  if (stackIndex !== -1) {
    const stackId = pathSegments[stackIndex + 1];
    const notebookIndex = pathSegments.indexOf('notebook', stackIndex);
    const noteIndex = pathSegments.indexOf('note', notebookIndex);
    
    if (notebookIndex !== -1 && noteIndex !== -1) {
      // /notes/stack/{stackId}/notebook/{notebookId}/note/{noteId}
      return {
        stackId,
        notebookId: pathSegments[notebookIndex + 1],
        noteId: pathSegments[noteIndex + 1],
        routeType: 'note',
      };
    } else if (notebookIndex !== -1 && pathSegments[notebookIndex + 2] === 'notes') {
      // /notes/stack/{stackId}/notebook/{notebookId}/notes
      return {
        stackId,
        notebookId: pathSegments[notebookIndex + 1],
        routeType: 'notebook',
      };
    } else if (pathSegments[stackIndex + 2] === 'notebooks') {
      // /notes/stack/{stackId}/notebooks
      return {
        stackId,
        routeType: 'stack',
      };
    }
  }
  
  // Check for notebook routes (only if not in stack)
  const notebookIndex = pathSegments.indexOf('notebook');
  if (notebookIndex !== -1 && stackIndex === -1) {
    const noteIndex = pathSegments.indexOf('note', notebookIndex);
    
    if (noteIndex !== -1) {
      // /notes/notebook/{notebookId}/note/{noteId}
      return {
        notebookId: pathSegments[notebookIndex + 1],
        noteId: pathSegments[noteIndex + 1],
        routeType: 'note',
      };
    } else if (pathSegments[notebookIndex + 2] === 'notes') {
      // /notes/notebook/{notebookId}/notes
      return {
        notebookId: pathSegments[notebookIndex + 1],
        routeType: 'notebook',
      };
    }
  }
  
  // Check for single note (no context)
  if (pathSegments.length === 2 && pathSegments[0] === 'notes') {
    const noteId = pathSegments[1];
    // Exclude static routes
    if (noteId !== 'dashboard' && noteId !== 'new' && noteId !== 'tags' && noteId !== 'stack' && noteId !== 'notebook') {
      return {
        noteId,
        routeType: 'note',
      };
    }
  }
  
  return {
    routeType: 'unknown',
  };
};

/**
 * Select note with context preservation
 * Preserves current context (stack/notebook) when navigating to a note
 */
export const useNoteNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();
  
  /**
   * Select a note, preserving the current navigation context
   */
  const selectNote = (noteId: string, replaceUrl = false) => {
    const context = parseNavigationContext(location);
    const allParams = getAllParams(params);
    
    // Preserve current context
    const currentStackId = context.stackId || allParams.stackId;
    const currentNotebookId = context.notebookId || allParams.notebookId;
    
    let targetPath = '';
    
    if (currentStackId && currentNotebookId) {
      // In stack context: /notes/stack/{stackId}/notebook/{notebookId}/note/{noteId}
      targetPath = `/notes/stack/${currentStackId}/notebook/${currentNotebookId}/note/${noteId}`;
    } else if (currentNotebookId) {
      // In notebook context (no stack): /notes/notebook/{notebookId}/note/{noteId}
      targetPath = `/notes/notebook/${currentNotebookId}/note/${noteId}`;
    } else {
      // No context: /notes/{noteId}
      targetPath = `/notes/${noteId}`;
    }
    
    if (replaceUrl) {
      navigate(targetPath, { replace: true });
    } else {
      navigate(targetPath);
    }
  };
  
  /**
   * Handle note selection with mobile/desktop behavior
   * Fetches full note using POST /notes/getNoteById first
   */
  const onNoteSelected = async (note: Note, isMobile = false, noteService?: any) => {
    const noteId = note.id;
    
    // Fetch full note using POST API
    if (noteService) {
      try {
        await noteService.getNoteById(noteId, true);
      } catch (error) {
        console.error('Failed to fetch note:', error);
      }
    }
    
    if (isMobile) {
      // On mobile: Navigate with full URL (preserves context)
      selectNote(noteId, false);
    } else {
      // On desktop: Update URL without full page reload (use replaceUrl: true)
      selectNote(noteId, true);
    }
  };
  
  return {
    selectNote,
    onNoteSelected,
    parseNavigationContext: () => parseNavigationContext(location),
    getAllParams: () => getAllParams(params),
  };
};

/**
 * Route parameter handler
 * Extracts params from route and builds filter for fetching notes
 */
export interface RouteParamsFilter {
  tag_id?: number;
  stack_id?: string; // UUID
  notebook_id?: string; // UUID
  archived?: boolean;
  trashed?: boolean;
  pinned?: boolean;
}

export const handleRouteParams = (
  params: RouteParams,
  context: NavigationContext
): RouteParamsFilter => {
  const filter: RouteParamsFilter = {
    archived: false,
    trashed: false,
  };

  // Priority: tagId > notebookId > stackId > default (all notes)
  if (params.tagId || context.tagId) {
    // Fetch notes by tag (tag_id is a number)
    const tagId = params.tagId || context.tagId;
    if (tagId) {
      filter.tag_id = typeof tagId === 'string' ? parseInt(tagId, 10) : tagId;
    }
  } else if (params.notebookId || context.notebookId) {
    // Fetch notes by notebook (notebook_id is a UUID string)
    const notebookId = params.notebookId || context.notebookId;
    if (notebookId) {
      filter.notebook_id = String(notebookId);
    }
  } else if (params.stackId || context.stackId) {
    // Fetch notes by stack (only if no notebookId) (stack_id is a UUID string)
    const stackId = params.stackId || context.stackId;
    if (stackId) {
      filter.stack_id = String(stackId);
    }
  }
  // Default: fetch all notes (archived=false, trashed=false already set)

  return filter;
};

