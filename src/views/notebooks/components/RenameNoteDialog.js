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
import TextField from '@mui/material/TextField';
import { closeRenameNoteDialog } from '../store/notebooksSlice';
import noteService from '../../Dashboard/services/note.service';

const schema = yup.object().shape({
  title: yup.string().required('Note title is required'),
});

function RenameNoteDialog() {
  const dispatch = useDispatch();
  const { open, note } = useSelector((state) => state.notebooksApp?.notebooks?.renameNoteDialog || { open: false, note: null });

  const { control, handleSubmit, reset, formState } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { title: '' },
  });

  useEffect(() => {
    if (open && note) {
      reset({ title: note.title || '' });
    }
  }, [open, note, reset]);

  const handleClose = () => {
    dispatch(closeRenameNoteDialog());
    reset();
  };

  const onSubmit = async (data) => {
    if (note) {
      try {
        await noteService.updateNote(note.id, { title: data.title });
        dispatch(closeRenameNoteDialog());
      } catch (error) {
        console.error('Failed to update note:', error);
      }
    }
  };

  if (!note) return null;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Rename Note</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent dividers className="flex flex-col gap-16">
          <Controller
            name="title"
            control={control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                label="Note Title"
                variant="outlined"
                fullWidth
                required
                autoFocus
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              />
            )}
          />
        </DialogContent>
        <DialogActions className="px-24 py-16">
          <Button onClick={handleClose} color="inherit">
            Cancel
          </Button>
          <Button type="submit" variant="contained" color="primary" disabled={!formState.isValid}>
            Rename
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default RenameNoteDialog;

