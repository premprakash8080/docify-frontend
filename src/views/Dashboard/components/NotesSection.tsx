import { useState, useEffect } from 'react';
import { Card, CardBody } from 'react-bootstrap';
import { useNavigate } from 'react-router';
import { TbFileText, TbPlus } from 'react-icons/tb';
import noteService from '../services/note.service';
import type { Note, Notebook } from '../types';

interface NotesSectionProps {
  notebooks?: Notebook[];
}

function NotesSection({ notebooks = [] }: NotesSectionProps) {
  const navigate = useNavigate();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        setLoading(true);
        const response = await noteService.getAllNotes(
          { archived: false, trashed: false },
          false
        );
        
        console.log('Notes API Response:', response);
        
        // Handle different response formats
        let notesData: Note[] = [];
        
        if (Array.isArray(response)) {
          // Direct array: Note[]
          notesData = response;
        } else if (response && typeof response === 'object') {
          // Handle { success: true, data: Note[] }
          if ('data' in response) {
            const data = (response as any).data;
            if (Array.isArray(data)) {
              notesData = data;
            } else if (data && typeof data === 'object' && 'notes' in data && Array.isArray(data.notes)) {
              // Handle { success: true, data: { notes: Note[] } }
              notesData = data.notes;
            }
          }
        }
        
        console.log('Extracted notes:', notesData);
        
        // Sort by updated_at (most recent first) and take latest 4
        const sortedNotes = notesData
          .filter((note) => note && note.id) // Filter out invalid notes
          .sort((a: Note, b: Note) => {
            const dateA = new Date(a.updated_at || a.created_at || 0).getTime();
            const dateB = new Date(b.updated_at || b.created_at || 0).getTime();
            return dateB - dateA;
          })
          .slice(0, 4);
        
        console.log('Sorted notes (latest 4):', sortedNotes);
        setNotes(sortedNotes);
      } catch (error) {
        console.error('Failed to fetch notes:', error);
        setNotes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, []);

  const handleCreateNote = () => {
    // Navigate to new note page
    navigate('/notes/new');
  };

  const handleNoteClick = (note: Note) => {
    // Navigate to note page
    if (note.notebook_id) {
      navigate(`/notes/notebook/${note.notebook_id}/note/${note.id}`);
    } else {
      navigate(`/notes/${note.id}`);
    }
  };

  const notebooksArray: Notebook[] = Array.isArray(notebooks) ? notebooks : [];
  const notesArray: Note[] = Array.isArray(notes) ? notes : [];

  if (loading && notesArray.length === 0) {
    return (
      <Card>
        <CardBody>
          <h5 className="mb-3">Recent Notes</h5>
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </CardBody>
      </Card>
    );
  }

  // Display latest 4 notes + 1 empty card for creating new note
  const displayNotes = notesArray.slice(0, 4);

  return (
    <Card>
      <CardBody>
        <h5 className="mb-3">Recent Notes</h5>
        <div className="row g-3">
          {displayNotes.map((note) => (
            <div key={note.id} className="col-md-6">
              <Card
                className="border h-100 cursor-pointer"
                style={{ cursor: 'pointer' }}
                onClick={() => handleNoteClick(note)}
              >
                <CardBody>
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <div className="flex-shrink-0 avatar-sm bg-light bg-opacity-50 text-muted rounded-2">
                      <span className="avatar-title">
                        <TbFileText className="fs-lg" />
                      </span>
                    </div>
                    <div className="flex-grow-1">
                      <p className="text-muted mb-0 fs-xs">
                        {notebooksArray.find((nb) => nb.id === note.notebook_id)?.name || 'Note'}
                      </p>
                    </div>
                  </div>
                  <h6 className="mb-2">{note.title || 'Untitled Note'}</h6>
                  <p className="text-muted mb-0 fs-xs">
                    {note.updated_at || note.created_at
                      ? new Date(note.updated_at || note.created_at || '').toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })
                      : '—'}
                  </p>
                </CardBody>
              </Card>
            </div>
          ))}
          {/* Empty card for creating new note - always shown */}
          <div className="col-md-6">
            <Card
              className="border border-dashed h-100 d-flex align-items-center justify-content-center cursor-pointer"
              style={{ cursor: 'pointer', minHeight: '120px' }}
              onClick={handleCreateNote}
            >
              <CardBody className="text-center">
                <div className="mb-2">
                  <TbPlus className="fs-xl text-success" />
                </div>
                <p className="text-muted mb-0 fs-sm">Create new note</p>
              </CardBody>
            </Card>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

export default NotesSection;
