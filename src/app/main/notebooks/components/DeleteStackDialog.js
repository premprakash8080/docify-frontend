import { useDispatch, useSelector } from 'react-redux';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';
import { closeDeleteStackDialog, deleteStack } from '../store/notebooksSlice';

function DeleteStackDialog() {
  const dispatch = useDispatch();
  const { open, stack } = useSelector((state) => state.notebooksApp?.notebooks?.deleteStackDialog || { open: false, stack: null });

  const handleClose = () => {
    dispatch(closeDeleteStackDialog());
  };

  const handleDelete = () => {
    if (stack) {
      dispatch(deleteStack(stack.id));
    }
  };

  if (!stack) return null;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Delete Stack</DialogTitle>
      <DialogContent dividers>
        <Typography>
          Are you sure you want to delete &quot;{stack.name || 'Untitled Stack'}&quot;? This action cannot be undone.
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

export default DeleteStackDialog;

