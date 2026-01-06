import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Table, Spinner } from 'react-bootstrap';
import { format } from 'date-fns';
import { TbChevronDown, TbChevronRight, TbFolder, TbFileText, TbFile } from 'react-icons/tb';
import {
  fetchStacks,
  fetchNotebooks,
  fetchNotebookNotes,
  toggleStackExpanded,
  toggleNotebookExpanded,
  selectStacks,
  selectStandaloneNotebooks,
  selectNotebooksLoading,
  selectExpandedStacks,
  selectExpandedNotebooks,
} from '../store/notebooksSlice';
import StackActionsMenu from './StackActionsMenu';
import NotebookActionsMenu from './NotebookActionsMenu';
import NoteActionsMenu from './NoteActionsMenu';
import { useNotebooksNavigation } from '../utils/navigation';
import type { StackWithNotebooks, NotebookWithNotes } from '../types';
import type { Note } from '@/views/Dashboard/types';
import type { AppDispatch } from '@/store/types';

interface StackRowProps {
  stack: StackWithNotebooks;
  onStackNameClick: (stack: StackWithNotebooks, isExpanded: boolean, onExpand: () => void) => void;
  onNotebookClick: (notebook: NotebookWithNotes) => void;
  onNoteClick: (note: Note) => void;
}

function StackRow({ stack, onStackNameClick, onNotebookClick, onNoteClick }: StackRowProps) {
  const dispatch: AppDispatch = useDispatch();
  const expandedStacks = useSelector(selectExpandedStacks);
  const isExpanded = expandedStacks[stack.id] || false;
  const notebooks = stack.notebooks || [];

  const handleToggle = () => {
    dispatch(toggleStackExpanded(stack.id));
  };

  const handleStackNameClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onStackNameClick(stack, isExpanded, handleToggle);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), 'dd MMM');
    } catch {
      return '-';
    }
  };

  return (
    <>
      <tr className={isExpanded ? 'table-active' : ''}>
        <td style={{ width: '40px', paddingLeft: '12px' }}>
          <button
            type="button"
            className="btn btn-sm btn-link p-0"
            onClick={handleToggle}
            aria-label="expand row"
          >
            {isExpanded ? <TbChevronDown size={20} /> : <TbChevronRight size={20} />}
          </button>
        </td>
        <td>
          <div className="d-flex align-items-center gap-2">
            <TbFolder size={20} className="text-primary" />
            <span
              className="fw-medium"
              style={{ cursor: 'pointer' }}
              onClick={handleStackNameClick}
            >
              {stack.name || 'Untitled Stack'}
            </span>
            {notebooks.length > 0 && (
              <span className="text-muted small">{notebooks.length}</span>
            )}
          </div>
        </td>
        <td>-</td>
        <td>{stack.created_by || '-'}</td>
        <td>{formatDate(stack.updated_at)}</td>
        <td>-</td>
        <td align="right" style={{ width: '80px', padding: '8px' }}>
          <div className="d-flex justify-content-end align-items-center">
            <StackActionsMenu stack={stack} />
          </div>
        </td>
      </tr>
      {isExpanded && notebooks.length > 0 && (
        notebooks.map((notebook) => (
          <NotebookRow
            key={notebook.id}
            notebook={notebook}
            level={1}
            onNotebookClick={onNotebookClick}
            onNoteClick={onNoteClick}
          />
        ))
      )}
      {isExpanded && notebooks.length === 0 && (
        <tr>
          <td colSpan={7} style={{ paddingLeft: '52px', paddingTop: '8px', paddingBottom: '8px' }}>
            <div className="text-muted">No notebooks in this stack</div>
          </td>
        </tr>
      )}
    </>
  );
}

interface NotebookRowProps {
  notebook: NotebookWithNotes;
  level?: number;
  onNotebookClick: (notebook: NotebookWithNotes) => void;
  onNoteClick?: (note: Note) => void;
}

function NotebookRow({ notebook, level = 0, onNotebookClick, onNoteClick }: NotebookRowProps) {
  const dispatch: AppDispatch = useDispatch();
  const expandedNotebooks = useSelector(selectExpandedNotebooks);
  const isExpanded = expandedNotebooks[notebook.id] || false;
  const notes = notebook.notes || [];

  const handleToggle = async () => {
    if (!isExpanded && (!notes || notes.length === 0)) {
      // Fetch notes when expanding for the first time
      await dispatch(fetchNotebookNotes(notebook.id));
    }
    dispatch(toggleNotebookExpanded(notebook.id));
  };

  const handleNotebookNameClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onNotebookClick(notebook);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), 'dd MMM');
    } catch {
      return '-';
    }
  };

  // Calculate padding: level 0 = 12px, level 1 = 36px
  const paddingLeft = level === 0 ? '12px' : '36px';

  return (
    <>
      <tr className={isExpanded ? 'table-active' : ''}>
        <td style={{ width: '40px', paddingLeft }}>
          <button
            type="button"
            className="btn btn-sm btn-link p-0"
            onClick={handleToggle}
            aria-label="expand row"
          >
            {isExpanded ? <TbChevronDown size={20} /> : <TbChevronRight size={20} />}
          </button>
        </td>
        <td>
          <div className="d-flex align-items-center gap-2">
            <TbFileText size={20} className="text-muted" />
            <span
              style={{ cursor: 'pointer' }}
              onClick={handleNotebookNameClick}
            >
              {notebook.name || 'Untitled Notebook'}
            </span>
            {(notebook.note_count !== undefined && notebook.note_count !== null) && (
              <span className="text-muted small">{notebook.note_count}</span>
            )}
          </div>
        </td>
        <td>--</td>
        <td>{notebook.created_by || '-'}</td>
        <td>{formatDate(notebook.updated_at)}</td>
        <td>Only you</td>
        <td align="right" style={{ width: '80px', padding: '8px' }}>
          <div className="d-flex justify-content-end align-items-center">
            <NotebookActionsMenu notebook={notebook} />
          </div>
        </td>
      </tr>
      {isExpanded && notes.length > 0 && (
        notes.map((note) => (
          <NoteRow
            key={note.id}
            note={note}
            level={2}
            onNoteClick={onNoteClick}
          />
        ))
      )}
      {isExpanded && notes.length === 0 && (
        <tr>
          <td colSpan={7} style={{ paddingLeft: '60px', paddingTop: '8px', paddingBottom: '8px' }}>
            <div className="text-muted">No notes in this notebook</div>
          </td>
        </tr>
      )}
    </>
  );
}

interface NoteRowProps {
  note: Note;
  level?: number;
  onNoteClick?: (note: Note) => void;
}

function NoteRow({ note, level = 2, onNoteClick }: NoteRowProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), 'dd MMM');
    } catch {
      return '-';
    }
  };

  const handleNoteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onNoteClick) {
      onNoteClick(note);
    }
  };

  // Calculate padding: level 2 = 60px, level 3+ = 60 + (level-2)*24
  const paddingLeft = level === 2 ? '60px' : `${60 + (level - 2) * 24}px`;

  return (
    <tr>
      <td style={{ width: '40px', paddingLeft }} />
      <td>
        <div className="d-flex align-items-center gap-2">
          <TbFile size={20} className="text-muted" />
          <span
            className="text-truncate"
            style={{ maxWidth: '400px', cursor: onNoteClick ? 'pointer' : 'default' }}
            onClick={handleNoteClick}
          >
            {note.title || 'Untitled'}
          </span>
        </div>
      </td>
      <td>--</td>
      <td>-</td>
      <td>{formatDate(note.updated_at)}</td>
      <td>Only you</td>
      <td align="right" style={{ width: '80px', padding: '8px' }}>
        <div className="d-flex justify-content-end align-items-center">
          <NoteActionsMenu note={note} />
        </div>
      </td>
    </tr>
  );
}

export default function NotebooksTable() {
  const dispatch: AppDispatch = useDispatch();
  const stacks = useSelector(selectStacks);
  const standaloneNotebooks = useSelector(selectStandaloneNotebooks);
  const loading = useSelector(selectNotebooksLoading);
  const searchText = useSelector((state: any) => state.notebooksApp?.notebooks?.searchText || '');

  // Get navigation handlers
  const navigation = useNotebooksNavigation(stacks);

  useEffect(() => {
    // Fetch both stacks and notebooks in parallel
    dispatch(fetchStacks());
    dispatch(fetchNotebooks());
  }, [dispatch]);

  const filteredStacks = useMemo(() => {
    if (!searchText) return stacks;
    const lowerSearch = searchText.toLowerCase();
    return stacks
      .map((stack) => {
        const matchesStack = stack.name?.toLowerCase().includes(lowerSearch);
        const filteredNotebooks =
          stack.notebooks?.filter((nb) => nb.name?.toLowerCase().includes(lowerSearch)) || [];
        if (matchesStack || filteredNotebooks.length > 0) {
          return { ...stack, notebooks: matchesStack ? stack.notebooks : filteredNotebooks };
        }
        return null;
      })
      .filter(Boolean) as StackWithNotebooks[];
  }, [stacks, searchText]);

  const filteredStandaloneNotebooks = useMemo(() => {
    if (!searchText) return standaloneNotebooks;
    const lowerSearch = searchText.toLowerCase();
    return standaloneNotebooks.filter((nb) => nb.name?.toLowerCase().includes(lowerSearch));
  }, [standaloneNotebooks, searchText]);

  if (loading && stacks.length === 0 && standaloneNotebooks.length === 0) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <Spinner animation="border" role="status" className="text-primary">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  return (
    <div className="w-100 h-100 d-flex flex-column" style={{ overflow: 'auto' }}>
      <Table hover className="mb-0">
        <thead>
          <tr>
            <th style={{ width: '40px' }}></th>
            <th>
              <div className="d-flex align-items-center gap-1">
                Title
                <TbChevronDown size={16} className="text-muted" />
              </div>
            </th>
            <th>Space</th>
            <th>Created by</th>
            <th>Updated</th>
            <th>Shared with</th>
            <th align="right" style={{ width: '80px' }}>
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {filteredStacks.map((stack) => (
            <StackRow
              key={stack.id}
              stack={stack}
              onStackNameClick={navigation.onStackNameClick}
              onNotebookClick={navigation.onNotebookClick}
              onNoteClick={navigation.onNoteClick}
            />
          ))}
          {filteredStandaloneNotebooks.map((notebook) => (
            <NotebookRow
              key={notebook.id}
              notebook={notebook}
              level={0}
              onNotebookClick={navigation.onNotebookClick}
              onNoteClick={navigation.onNoteClick}
            />
          ))}
          {filteredStacks.length === 0 && filteredStandaloneNotebooks.length === 0 && !loading && (
            <tr>
              <td colSpan={7} align="center" className="py-4">
                <div className="text-muted">No notebooks found</div>
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  );
}

