import { useDispatch, useSelector } from 'react-redux';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';
import { closeDeleteNoteDialog } from '../store/notebooksSlice';
import noteService from '../../Dashboard/services/note.service';

function DeleteNoteDialog() {
  const dispatch = useDispatch();
  const { open, note } = useSelector((state) => state.notebooksApp?.notebooks?.deleteNoteDialog || { open: false, note: null });

  const handleClose = () => {
    dispatch(closeDeleteNoteDialog());
  };

  const handleDelete = async () => {
    if (note) {
      try {
        await noteService.deleteNote(note.id);
        dispatch(closeDeleteNoteDialog());
      } catch (error) {
        console.error('Failed to delete note:', error);
      }
    }
  };

  if (!note) return null;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Delete Note</DialogTitle>
      <DialogContent dividers>
        <Typography>
          Are you sure you want to delete &quot;{note.title || 'Untitled'}&quot;? This action cannot be undone.
        </Typography>
      </DialogContent>
      <DialogActions className="px-24 py-16">
        <Button onClick={handleClose} color="inherit">
          Cancel
        </Button>
        <Button onClick={handleDelete} variant="contained" color="error">
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default DeleteNoteDialog;

