import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import { closeMoveNoteDialog, selectStacks, fetchNotebooks } from '../store/notebooksSlice';
import noteService from '../../Dashboard/services/note.service';

const validationSchema = yup.object().shape({
  notebookId: yup.number().required('Notebook is required'),
});

function MoveNoteDialog() {
  const dispatch = useDispatch();
  const stacks = useSelector(selectStacks);
  const standaloneNotebooks = useSelector((state) => state.notebooksApp?.notebooks?.standaloneNotebooks || []);
  const { open, note } = useSelector(
    (state) => state.notebooksApp?.notebooks?.moveNoteDialog || { open: false, note: null }
  );

  const { control, handleSubmit, reset } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: { notebookId: null },
  });

  useEffect(() => {
    if (open) {
      dispatch(fetchNotebooks({ archived: false, trashed: false }));
      reset({ notebookId: note?.notebook_id || null });
    }
  }, [open, note, reset, dispatch]);

  const handleClose = () => {
    dispatch(closeMoveNoteDialog());
    reset();
  };

  const onSubmit = async (data) => {
    if (note) {
      try {
        await noteService.updateNote(note.id, { notebook_id: data.notebookId });
        dispatch(closeMoveNoteDialog());
      } catch (error) {
        console.error('Failed to move note:', error);
      }
    }
  };

  if (!note) return null;

  const allNotebooks = [
    ...stacks.flatMap((stack) => stack.notebooks || []),
    ...standaloneNotebooks,
  ];

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Move Note to Notebook</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent dividers className="flex flex-col gap-16">
          <Typography variant="body2" color="text.secondary">
            Move &quot;{note.title || 'Untitled'}&quot; to a notebook
          </Typography>

          <Controller
            name="notebookId"
            control={control}
            render={({ field, fieldState }) => (
              <FormControl fullWidth error={!!fieldState.error}>
                <InputLabel>Select Notebook</InputLabel>
                <Select {...field} label="Select Notebook">
                  {allNotebooks.map((notebook) => (
                    <MenuItem key={notebook.id} value={notebook.id}>
                      {notebook.name || 'Untitled Notebook'}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          />
        </DialogContent>
        <DialogActions className="px-24 py-16">
          <Button onClick={handleClose} color="inherit">
            Cancel
          </Button>
          <Button type="submit" variant="contained" color="primary">
            Move
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default MoveNoteDialog;

