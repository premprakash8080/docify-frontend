import { useState, useEffect } from 'react';
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
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import {
  selectStacks,
  closeMoveNotebookDialog,
  createStack,
  moveNotebookToStack,
} from '../store/notebooksSlice';

// Validation schema: stackId can be a number (existing stack), empty string (standalone), or "new" (create new)
// Material-UI Select returns strings, so we accept string numbers and convert them
const validationSchema = yup.object().shape({
  stackId: yup
    .mixed()
    .test('is-valid-stack-id', 'Invalid stack selection', (value) => {
      // Accept: number, empty string, or "new"
      if (value === '' || value === 'new') return true;
      // Accept numeric strings and numbers
      if (typeof value === 'number' && Number.isFinite(value)) return true;
      if (typeof value === 'string' && value.trim() !== '') {
        const numValue = Number(value);
        return Number.isFinite(numValue);
      }
      return false;
    })
    .transform((value) => {
      // Convert numeric strings to numbers for API consistency
      if (typeof value === 'string' && value !== '' && value !== 'new') {
        const numValue = Number(value);
        if (Number.isFinite(numValue)) {
          return numValue;
        }
      }
      return value;
    }),
  newStackName: yup.string().when('stackId', {
    is: 'new',
    then: (schema) => schema.required('Stack name is required'),
    otherwise: (schema) => schema.notRequired(),
  }),
});

function MoveNotebookDialog() {
  const dispatch = useDispatch();
  const stacks = useSelector(selectStacks);
  const { open, notebook } = useSelector(
    (state) => state.notebooksApp?.notebooks?.moveNotebookDialog || { open: false, notebook: null }
  );
  const [createNew, setCreateNew] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      stackId: '',
      newStackName: '',
    },
  });

  const stackId = watch('stackId');

  useEffect(() => {
    if (open) {
      reset({ stackId: '', newStackName: '' });
      setCreateNew(false);
      setLoading(false);
      setError(null);
    }
  }, [open, reset]);

  // Handle "new" selection: show the new stack name field
  // Note: We keep stackId as "new" in the form state for validation purposes
  useEffect(() => {
    if (stackId === 'new') {
      setCreateNew(true);
    } else {
      setCreateNew(false);
    }
  }, [stackId]);

  const handleClose = () => {
    if (!loading) {
      dispatch(closeMoveNotebookDialog());
      reset();
      setCreateNew(false);
      setError(null);
    }
  };

  const onSubmit = async (data) => {
    // Debug log to confirm form submission is triggered
    console.log('MoveNotebookDialog: onSubmit called with data:', data);

    setLoading(true);
    setError(null);

    try {
      // Handle "new" stack creation
      if (data.stackId === 'new') {
        if (!data.newStackName || data.newStackName.trim() === '') {
          setError('Stack name is required');
          setLoading(false);
          return;
        }

        // First create the new stack
        const createStackResult = await dispatch(createStack({ name: data.newStackName.trim() }));
        if (createStackResult.type.endsWith('/fulfilled')) {
          const { payload } = createStackResult;
          const newStack = payload?.data?.stack || payload?.stack;
          if (newStack?.id) {
            // Then move the notebook to the new stack using the correct API
            const moveResult = await dispatch(
              moveNotebookToStack({
                notebookId: notebook.id,
                stackId: newStack.id,
              })
            );
            if (moveResult.type.endsWith('/fulfilled')) {
              handleClose();
            } else {
              setError(moveResult.payload || 'Failed to move notebook to stack');
              setLoading(false);
            }
          } else {
            setError('Failed to create stack: Invalid response');
            setLoading(false);
          }
        } else {
          setError(createStackResult.payload || 'Failed to create stack');
          setLoading(false);
        }
      } else {
        // Move to existing stack (stackId is a number after transform) or make standalone (stackId is empty string, convert to null)
        // The schema transform ensures stackId is a number for existing stacks
        const stackIdToSend = data.stackId === '' ? null : data.stackId;

        // Defensive check: ensure stackId is a valid number if not null/empty
        if (stackIdToSend !== null && typeof stackIdToSend !== 'number') {
          setError('Invalid stack ID type');
          setLoading(false);
          return;
        }

        const moveResult = await dispatch(
          moveNotebookToStack({ notebookId: notebook.id, stackId: stackIdToSend })
        );
        if (moveResult.type.endsWith('/fulfilled')) {
          handleClose();
        } else {
          setError(moveResult.payload || 'Failed to move notebook to stack');
          setLoading(false);
        }
      }
    } catch (err) {
      console.error('MoveNotebookDialog: Unexpected error:', err);
      setError(err.message || 'An unexpected error occurred');
      setLoading(false);
    }
  };

  if (!notebook) return null;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Move Notebook to Stack</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent dividers className="flex flex-col gap-16">
          <Typography variant="body2" color="text.secondary">
            Move &quot;{notebook.name || 'Untitled Notebook'}&quot; to a stack
          </Typography>

          <Controller
            name="stackId"
            control={control}
            render={({ field, fieldState }) => (
              <FormControl fullWidth error={!!fieldState.error} disabled={loading}>
                <InputLabel>Select Stack</InputLabel>
                <Select
                  {...field}
                  label="Select Stack"
                  onChange={(e) => {
                    // Material-UI Select returns string values, but we need to preserve the type
                    // The transform in the schema will convert numeric strings to numbers
                    const { value } = e.target;
                    field.onChange(value);
                  }}
                >
                  <MenuItem value="">
                    <em>None (Standalone)</em>
                  </MenuItem>
                  {stacks.map((stack) => (
                    <MenuItem key={stack.id} value={stack.id}>
                      {stack.name || 'Untitled Stack'}
                    </MenuItem>
                  ))}
                  <MenuItem value="new">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <FuseSvgIcon size={16}>heroicons-outline:plus</FuseSvgIcon>
                      <span>Create New Stack</span>
                    </Box>
                  </MenuItem>
                </Select>
                {fieldState.error && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                    {fieldState.error.message}
                  </Typography>
                )}
              </FormControl>
            )}
          />

          {createNew && (
            <Controller
              name="newStackName"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label="New Stack Name"
                  variant="outlined"
                  fullWidth
                  required
                  autoFocus
                  disabled={loading}
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
          )}

          {error && (
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}
        </DialogContent>
        <DialogActions className="px-24 py-16">
          <Button onClick={handleClose} color="inherit" disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" color="primary" disabled={loading}>
            {loading ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={16} />
                <span>Moving...</span>
              </Box>
            ) : (
              'Move'
            )}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default MoveNotebookDialog;
