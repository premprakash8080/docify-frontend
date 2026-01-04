import { useEffect, useState } from 'react';
import { Card, CardBody, ListGroup, ListGroupItem, Spinner } from 'react-bootstrap';
import { TbFileText, TbPin } from 'react-icons/tb';
import { format } from 'date-fns';
import noteService from '../services/note.service';
import type { Note } from '../types';

interface NotesListProps {
  filter?: {
    tag_id?: number;
    stack_id?: number;
    notebook_id?: string;
    archived?: boolean;
    trashed?: boolean;
    pinned?: boolean;
  };
  sortBy?: string;
  onNotesCountChange?: (count: number) => void;
  onNoteClick?: (note: Note) => void;
}

const NotesList = ({ filter, sortBy = 'updated', onNotesCountChange, onNoteClick }: NotesListProps) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotes = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await noteService.getAllNotes(filter || {}, true);
        let notesData: Note[] = [];
        
        if (Array.isArray(response)) {
          notesData = response;
        } else if (response && typeof response === 'object' && 'data' in response) {
          const data = (response as { data: { notes: Note[] } | Note[] }).data;
          if (Array.isArray(data)) {
            notesData = data;
          } else if (data && typeof data === 'object' && 'notes' in data) {
            notesData = (data as { notes: Note[] }).notes;
          }
        }
        
        // Sort notes based on sortBy
        const sortedNotes = [...notesData].sort((a, b) => {
          if (sortBy === 'title-asc') {
            return (a.title || '').localeCompare(b.title || '');
          } else if (sortBy === 'updated') {
            return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
          } else if (sortBy === 'created') {
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          }
          return 0;
        });
        
        setNotes(sortedNotes);
        onNotesCountChange?.(sortedNotes.length);
      } catch (err: any) {
        setError(err.msg || 'Failed to load notes');
        setNotes([]);
        onNotesCountChange?.(0);
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, [filter, sortBy, onNotesCountChange]);

  if (loading) {
    return (
      <Card className="mt-3">
        <CardBody className="text-center py-3">
          <Spinner animation="border" size="sm" className="text-primary" />
        </CardBody>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="mt-3">
        <CardBody className="text-center py-3">
          <p className="text-danger mb-0 small">{error}</p>
        </CardBody>
      </Card>
    );
  }

  if (notes.length === 0) {
    return (
      <Card className="mt-3">
        <CardBody className="text-center py-3">
          <TbFileText size={32} className="text-muted mb-2 opacity-50" />
          <p className="text-muted mb-0 small">No notes found</p>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card className="mt-3">
      <CardBody className="p-0">
        <ListGroup variant="flush" className="list-custom">
          {notes.map((note) => (
            <ListGroupItem
              key={note.id}
              action
              className="px-3 py-2"
              style={{ cursor: 'pointer' }}
              onClick={() => onNoteClick?.(note)}
            >
              <div className="d-flex align-items-start gap-2">
                <div className="flex-shrink-0 mt-1">
                  {note.pinned ? (
                    <TbPin size={16} className="text-warning" />
                  ) : (
                    <TbFileText size={16} className="text-muted opacity-75" />
                  )}
                </div>
                <div className="flex-grow-1 min-w-0">
                  <div className="d-flex align-items-center justify-content-between mb-1">
                    <h6 className="mb-0 fs-sm fw-semibold text-truncate" style={{ maxWidth: '200px' }}>
                      {note.title || 'Untitled Note'}
                    </h6>
                    {note.pinned && (
                      <TbPin size={12} className="text-warning flex-shrink-0" />
                    )}
                  </div>
                  {note.updated_at && (
                    <p className="text-muted mb-0 fs-xs">
                      {format(new Date(note.updated_at), 'MMM dd, yyyy')}
                    </p>
                  )}
                </div>
              </div>
            </ListGroupItem>
          ))}
        </ListGroup>
      </CardBody>
    </Card>
  );
};

export default NotesList;

