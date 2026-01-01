import { yupResolver } from '@hookform/resolvers/yup';
import { Controller, useForm } from 'react-hook-form';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import * as yup from 'yup';
import { styled } from '@mui/material/styles';
import Grid from '@mui/material/Grid';
import { format } from 'date-fns';
import { createTask, updateTask, clearSelectedTask } from '../store/tasksSlice';

const Root = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: '8px',
    maxWidth: '600px',
    width: '100%',
  },
}));

const schema = yup.object().shape({
  label: yup.string().required('Task title is required'),
  description: yup.string(),
  priority: yup.string().oneOf(['low', 'medium', 'high', null]),
  due_date: yup.date().nullable(),
  start_time: yup.date().nullable(),
  end_time: yup.date().nullable(),
});

const defaultValues = {
  label: '',
  description: '',
  priority: null,
  due_date: null,
  start_time: null,
  end_time: null,
  flagged: false,
  completed: false,
};

const StyledGrid = styled(Grid)(({ theme }) => ({
  '& .MuiFormControl-root': {
    width: '100%',
  },
}));

function TaskDialog(props) {
  const { open, task, onClose } = props;
  const dispatch = useDispatch();

  const { reset, formState, control, handleSubmit, watch } = useForm({
    defaultValues,
    mode: 'onChange',
    resolver: yupResolver(schema),
  });

  const { isValid, dirtyFields } = formState;
  const isEdit = Boolean(task?.id);

  useEffect(() => {
    if (open) {
      if (task) {
        let dueDate = null;
        if (task.due_date) {
          dueDate = new Date(task.due_date);
        }

        let startTime = null;
        if (task.start_time) {
          if (typeof task.start_time === 'string' && task.start_time.includes(':')) {
            const baseDate = dueDate || new Date();
            const [hours, minutes, seconds] = task.start_time.split(':');
            startTime = new Date(baseDate);
            startTime.setHours(
              parseInt(hours, 10),
              parseInt(minutes, 10),
              parseInt(seconds || 0, 10)
            );
          } else {
            startTime = new Date(task.start_time);
          }
        }

        let endTime = null;
        if (task.end_time) {
          if (typeof task.end_time === 'string' && task.end_time.includes(':')) {
            const baseDate = dueDate || new Date();
            const [hours, minutes, seconds] = task.end_time.split(':');
            endTime = new Date(baseDate);
            endTime.setHours(
              parseInt(hours, 10),
              parseInt(minutes, 10),
              parseInt(seconds || 0, 10)
            );
          } else {
            endTime = new Date(task.end_time);
          }
        }

        reset({
          ...task,
          due_date: dueDate,
          start_time: startTime,
          end_time: endTime,
        });
      } else {
        reset(defaultValues);
      }
    }
  }, [open, task, reset]);

  const onSubmit = (data) => {
    const taskData = {
      ...data,
      due_date: data.due_date ? format(data.due_date, 'yyyy-MM-dd') : null,
      start_time: data.start_time ? format(data.start_time, 'HH:mm:ss') : null,
      end_time: data.end_time ? format(data.end_time, 'HH:mm:ss') : null,
    };

    if (isEdit) {
      dispatch(updateTask({ ...taskData, id: task.id })).then(() => {
        dispatch(clearSelectedTask());
        onClose();
      });
    } else {
      dispatch(createTask(taskData)).then(() => {
        onClose();
      });
    }
  };

  const handleClose = () => {
    dispatch(clearSelectedTask());
    onClose();
  };

  return (
    <Root open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle className="text-20 font-semibold">
        {isEdit ? 'Edit Task' : 'Create New Task'}
      </DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent dividers className="flex flex-col gap-16">
          <Controller
            name="label"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Task Title"
                variant="outlined"
                fullWidth
                required
                autoFocus
                placeholder="Enter task title"
              />
            )}
          />

          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Description"
                variant="outlined"
                fullWidth
                multiline
                rows={4}
                placeholder="Enter task description"
              />
            )}
          />

          <Controller
            name="priority"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select {...field} label="Priority">
                  <MenuItem value={null}>
                    <em>None</em>
                  </MenuItem>
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                </Select>
              </FormControl>
            )}
          />

          <Grid container spacing={2}>
            <StyledGrid item xs={12} sm={4}>
              <Controller
                name="due_date"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    {...field}
                    label="Due Date"
                    slotProps={{
                      textField: {
                        variant: 'outlined',
                        fullWidth: true,
                      },
                    }}
                  />
                )}
              />
            </StyledGrid>
            <StyledGrid item xs={12} sm={4}>
              <Controller
                name="start_time"
                control={control}
                render={({ field }) => (
                  <TimePicker
                    {...field}
                    label="Start Time"
                    slotProps={{
                      textField: {
                        variant: 'outlined',
                        fullWidth: true,
                      },
                    }}
                  />
                )}
              />
            </StyledGrid>
            <StyledGrid item xs={12} sm={4}>
              <Controller
                name="end_time"
                control={control}
                render={({ field }) => (
                  <TimePicker
                    {...field}
                    label="End Time"
                    slotProps={{
                      textField: {
                        variant: 'outlined',
                        fullWidth: true,
                      },
                    }}
                  />
                )}
              />
            </StyledGrid>
          </Grid>
        </DialogContent>
        <DialogActions className="px-24 py-16">
          <Button onClick={handleClose} color="inherit">
            Cancel
          </Button>
          <Button type="submit" variant="contained" color="primary" disabled={!isValid}>
            {isEdit ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Root>
  );
}

export default TaskDialog;
