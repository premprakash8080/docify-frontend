import { useAppDispatch } from '@/store';
import { Card, CardBody } from 'react-bootstrap';
import { useNavigate } from 'react-router';
import { TbFileText, TbPlus } from 'react-icons/tb';
import { createNote } from '../store/notesSlice';
import type { Note, Notebook } from '../types';

interface NotesSectionProps {
  notes: Note[];
  notebooks: Notebook[];
  loading: boolean;
}

function NotesSection({ notes, notebooks, loading }: NotesSectionProps) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const notebooksArray: Notebook[] = Array.isArray(notebooks) ? notebooks : [];
  const notesArray: Note[] = Array.isArray(notes) ? notes : [];

  const handleCreateNote = () => {
    dispatch(createNote({ title: 'Untitled Note' }))
      .unwrap()
      .then((note: any) => {
        const noteId = note?.data?.note?.id || note?.id;
        if (noteId) {
          navigate('/dashboard/notes');
        }
      })
      .catch((error: unknown) => {
        console.error('Failed to create note:', error);
      });
  };

  if (loading && notesArray.length === 0) {
    return (
      <Card>
        <CardBody>
          <h5 className="mb-3">Notes</h5>
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardBody>
        <h5 className="mb-3">Notes</h5>
        <div className="row g-3">
          {notesArray.slice(0, 2).map((note) => (
            <div key={note.id} className="col-md-6">
              <Card className="border h-100 cursor-pointer" style={{ cursor: 'pointer' }}>
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
                    {note.created_at
                      ? new Date(note.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })
                      : 'Dec 13'}
                  </p>
                </CardBody>
              </Card>
            </div>
          ))}
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
