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
import { closeRenameStackDialog, updateStack } from '../store/notebooksSlice';

const schema = yup.object().shape({
  name: yup.string().required('Stack name is required'),
});

function RenameStackDialog() {
  const dispatch = useDispatch();
  const { open, stack } = useSelector((state) => state.notebooksApp?.notebooks?.renameStackDialog || { open: false, stack: null });

  const { control, handleSubmit, reset, formState } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { name: '' },
  });

  useEffect(() => {
    if (open && stack) {
      reset({ name: stack.name || '' });
    }
  }, [open, stack, reset]);

  const handleClose = () => {
    dispatch(closeRenameStackDialog());
    reset();
  };

  const onSubmit = (data) => {
    if (stack) {
      dispatch(updateStack({ id: stack.id, data: { name: data.name } }));
    }
  };

  if (!stack) return null;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Rename Stack</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent dividers className="flex flex-col gap-16">
          <Controller
            name="name"
            control={control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                label="Stack Name"
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

export default RenameStackDialog;

