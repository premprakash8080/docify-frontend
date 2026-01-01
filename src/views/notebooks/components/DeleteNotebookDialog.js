import { useDispatch, useSelector } from 'react-redux';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';
import { closeDeleteNotebookDialog, deleteNotebook } from '../store/notebooksSlice';

function DeleteNotebookDialog() {
  const dispatch = useDispatch();
  const { open, notebook } = useSelector((state) => state.notebooksApp?.notebooks?.deleteNotebookDialog || { open: false, notebook: null });

  const handleClose = () => {
    dispatch(closeDeleteNotebookDialog());
  };

  const handleDelete = () => {
    if (notebook) {
      dispatch(deleteNotebook(notebook.id));
    }
  };

  if (!notebook) return null;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Delete Notebook</DialogTitle>
      <DialogContent dividers>
        <Typography>
          Are you sure you want to delete &quot;{notebook.name || 'Untitled Notebook'}&quot;? This action cannot be undone.
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

export default DeleteNotebookDialog;

