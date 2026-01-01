import { useDispatch } from 'react-redux';
import { styled } from '@mui/material/styles';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import FuseLoading from '@fuse/core/FuseLoading';
import { createNote } from '../store/notesSlice';
import { useNavigate } from 'react-router-dom';

const Root = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontSize: '18px',
  fontWeight: 600,
  marginBottom: '16px',
}));

const NotesGrid = styled('div')(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: '12px',
  [theme.breakpoints.down('lg')]: {
    gridTemplateColumns: 'repeat(2, 1fr)',
  },
  [theme.breakpoints.down('sm')]: {
    gridTemplateColumns: '1fr',
  },
}));

const NoteCard = styled(Card)(({ theme }) => ({
  cursor: 'pointer',
  transition: 'all 0.2s ease-in-out',
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: '8px',
  '&:hover': {
    boxShadow: theme.shadows[4],
    transform: 'translateY(-2px)',
  },
}));

const CreateCard = styled(Card)(({ theme }) => ({
  cursor: 'pointer',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '120px',
  border: `2px dashed ${theme.palette.divider}`,
  borderRadius: '8px',
  '&:hover': {
    borderColor: theme.palette.primary.main,
    backgroundColor: theme.palette.action.hover,
  },
}));

function NotesSection({ notes, notebooks, loading }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Ensure notebooks is always an array
  const notebooksArray = Array.isArray(notebooks) ? notebooks : [];
  // Ensure notes is always an array
  const notesArray = Array.isArray(notes) ? notes : [];

  const handleCreateNote = () => {
    dispatch(createNote({ title: 'Untitled Note' }))
      .unwrap()
      .then((note) => {
        navigate('/dashboard/notes');
      })
      .catch((error) => {
        console.error('Failed to create note:', error);
      });
  };

  if (loading && notesArray.length === 0) {
    return (
      <Root>
        <SectionTitle>Notes</SectionTitle>
        <FuseLoading />
      </Root>
    );
  }

  return (
    <Root>
      <SectionTitle>Notes</SectionTitle>
      <NotesGrid>
        {notesArray.slice(0, 2).map((note) => (
          <NoteCard key={note.id}>
            <CardContent>
              <Typography variant="caption" color="text.secondary" className="mb-4">
                {notebooksArray.find((nb) => nb.id === note.notebook_id)?.name || 'Note'}
              </Typography>
              <Typography variant="body1" className="font-semibold mb-8">
                {note.title || 'Untitled Note'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {note.created_at
                  ? new Date(note.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })
                  : 'Dec 13'}
              </Typography>
            </CardContent>
          </NoteCard>
        ))}
        <CreateCard onClick={handleCreateNote}>
          <FuseSvgIcon size={48} color="success" className="mb-8">
            heroicons-outline:document-plus
          </FuseSvgIcon>
          <Typography variant="body2" color="text.secondary" className="text-center">
            Create new note
          </Typography>
        </CreateCard>
      </NotesGrid>
    </Root>
  );
}

export default NotesSection;

