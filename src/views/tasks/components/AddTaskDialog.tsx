import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Select from 'react-select';
import {
  Button,
  Form,
  FormControl,
  FormLabel,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  Alert,
  Spinner,
} from 'react-bootstrap';
import { createTask, updateTask, fetchTasks, fetchTaskById } from '../store/tasksSlice';
import httpService from '@/core/http';
import type { AppDispatch } from '@/store/types';
import type { CreateTaskPayload, UpdateTaskPayload, TaskResponse } from '../types';

interface NoteOption {
  value: string;
  label: string;
}

const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

const validationSchema = yup.object().shape({
  note_id: yup.string().nullable().optional(),
  label: yup.string().required('Task name is required'),
  description: yup.string().required('Task description is required'),
  due_date: yup.string().nullable().optional(),
  start_time: yup.string().nullable().optional(),
  end_time: yup.string().nullable().optional(),
  reminder: yup.string().nullable().optional(),
  assigned_to: yup.string().nullable().optional(),
  priority: yup.string().oneOf(['low', 'medium', 'high'], 'Invalid priority').nullable().optional(),
  flagged: yup.boolean().optional(),
  completed: yup.boolean().optional(),
}).test('end-time-after-start', 'End time must be after start time', function(value) {
  if (value?.start_time && value?.end_time) {
    const start = value.start_time;
    const end = value.end_time;
    const startMinutes = timeToMinutes(start);
    const endMinutes = timeToMinutes(end);
    if (startMinutes >= endMinutes) {
      return this.createError({
        path: 'end_time',
        message: 'End time must be after start time',
      });
    }
  }
  return true;
});

// Generate time options in 30-minute intervals from 7:00 AM to 9:00 PM
const generateTimeOptions = (): string[] => {
  const options: string[] = [];
  for (let hour = 7; hour <= 21; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      if (hour === 21 && minute > 0) break; // Stop at 9:00 PM
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      options.push(timeString);
    }
  }
  return options;
};

const TIME_OPTIONS = generateTimeOptions();

type FormValues = {
  note_id: string | null;
  label: string;
  description: string;
  due_date: string | null;
  start_time: string | null;
  end_time: string | null;
  reminder: string | null;
  assigned_to: string | null;
  priority: 'low' | 'medium' | 'high' | null;
  flagged: boolean;
  completed: boolean;
};

type DialogMode = 'add' | 'edit' | 'view';

interface AddTaskDialogProps {
  show: boolean;
  onHide: () => void;
  mode?: DialogMode;
  taskId?: number | null;
}

function AddTaskDialog({ show, onHide, mode = 'add', taskId = null }: AddTaskDialogProps) {
  const dispatch: AppDispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState<NoteOption[]>([]);
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [loadingTask, setLoadingTask] = useState(false);
  const [selectedNote, setSelectedNote] = useState<NoteOption | null>(null);
  const isViewMode = mode === 'view';
  const isEditMode = mode === 'edit';

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    getValues,
  } = useForm<FormValues>({
    resolver: yupResolver(validationSchema) as any,
    defaultValues: {
      note_id: null,
      label: '',
      description: '',
      due_date: null,
      start_time: null,
      end_time: null,
      reminder: null,
      assigned_to: null,
      priority: null,
      flagged: false,
      completed: false,
    },
  });

  const selectedStartTime = watch('start_time');

  useEffect(() => {
    const fetchNotes = async () => {
      if (show) {
        setLoadingNotes(true);
        try {
          const response = await httpService.get<{ success: boolean; data: { notes: Array<{ id: string; title: string }> } }>(
            '/notes/getNotesName?archived=false&trashed=false',
            { showLoader: false }
          );
          
          if (response.data && typeof response.data === 'object' && 'data' in response.data) {
            const notesData = (response.data as { data: { notes: Array<{ id: string; title: string }> } }).data.notes;
            setNotes(notesData.map((note) => ({ value: note.id, label: note.title })));
          }
        } catch (error: any) {
          console.error('Failed to load notes:', error);
          setNotes([]);
        } finally {
          setLoadingNotes(false);
        }
      }
    };

    fetchNotes();
  }, [show]);

  // Fetch task data when in edit or view mode
  useEffect(() => {
    const fetchTaskData = async () => {
      if (show && taskId && (isEditMode || isViewMode)) {
        setLoadingTask(true);
        setError(null);
        try {
          const result = await dispatch(fetchTaskById(taskId));
          if (result.type.endsWith('/fulfilled')) {
            const payload = result.payload as TaskResponse;
            // Extract task from response: { success: true, data: { task: Task } }
            const taskData = payload?.data?.task;
            
            if (!taskData) {
              setError('Task data not found');
              setLoadingTask(false);
              return;
            }
            
            // Helper function to extract date from ISO string or date string
            const extractDate = (dateValue: string | null | undefined): string | null => {
              if (!dateValue) return null;
              // If it's already in YYYY-MM-DD format, return as is
              if (typeof dateValue === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
                return dateValue;
              }
              // If it's an ISO string, extract date part
              if (typeof dateValue === 'string' && dateValue.includes('T')) {
                return dateValue.split('T')[0];
              }
              // Try to parse and format
              try {
                const date = new Date(dateValue);
                if (!isNaN(date.getTime())) {
                  return date.toISOString().split('T')[0];
                }
              } catch (e) {
                // Ignore parsing errors
              }
              return null;
            };
            
            // Helper function to extract time from ISO string or time string
            const extractTime = (timeValue: string | null | undefined): string | null => {
              if (!timeValue) return null;
              // If it's already in HH:MM format, return as is
              if (typeof timeValue === 'string' && /^\d{2}:\d{2}$/.test(timeValue)) {
                return timeValue;
              }
              // If it's an ISO string, extract time part
              if (typeof timeValue === 'string' && timeValue.includes('T')) {
                const timePart = timeValue.split('T')[1];
                if (timePart) {
                  // Extract HH:MM from HH:MM:SS or HH:MM:SS.mmm
                  const timeMatch = timePart.match(/^(\d{2}:\d{2})/);
                  return timeMatch ? timeMatch[1] : null;
                }
              }
              // Try to parse as time string
              if (typeof timeValue === 'string' && timeValue.includes(':')) {
                const timeMatch = timeValue.match(/^(\d{2}:\d{2})/);
                return timeMatch ? timeMatch[1] : null;
              }
              return null;
            };
            
            // Extract dates and times
            const dueDate = extractDate(taskData.due_date || taskData.start_date);
            const startTime = extractTime(taskData.start_time);
            const endTime = extractTime(taskData.end_time);
            const reminder = extractTime(taskData.reminder);
            
            // Find the note option if note_id exists
            // Wait for notes to be loaded if they're not available yet
            let noteOption: NoteOption | null = null;
            if (taskData.note_id && notes.length > 0) {
              noteOption = notes.find((n) => n.value === taskData.note_id) || null;
            }
            
            // Reset form with task data
            reset({
              note_id: taskData.note_id || null,
              label: taskData.label || '',
              description: taskData.description || '',
              due_date: dueDate,
              start_time: startTime,
              end_time: endTime,
              reminder: reminder,
              assigned_to: taskData.assigned_to || null,
              priority: (taskData.priority as 'low' | 'medium' | 'high' | null) || null,
              flagged: taskData.flagged || false,
              completed: taskData.completed || false,
            });
            
            // Set selected note if found
            if (noteOption) {
              setSelectedNote(noteOption);
            }
          } else {
            setError((result.payload as string) || 'Failed to load task');
          }
        } catch (err: any) {
          console.error('Error fetching task:', err);
          setError(err.message || 'Failed to load task');
        } finally {
          setLoadingTask(false);
        }
      } else if (show && mode === 'add') {
        // Reset form for add mode
        reset({
          note_id: null,
          label: '',
          description: '',
          due_date: null,
          start_time: null,
          end_time: null,
          reminder: null,
          assigned_to: null,
          priority: null,
          flagged: false,
          completed: false,
        });
        setSelectedNote(null);
        setError(null);
      }
    };

    fetchTaskData();
  }, [show, taskId, isEditMode, isViewMode, dispatch, reset, notes]);
  
  // Update note selection when notes are loaded and we have a task with note_id
  useEffect(() => {
    if (show && taskId && (isEditMode || isViewMode) && notes.length > 0) {
      // Get the current note_id from the form
      const currentNoteId = getValues('note_id');
      if (currentNoteId) {
        const noteOption = notes.find((n) => n.value === currentNoteId);
        if (noteOption && (!selectedNote || selectedNote.value !== currentNoteId)) {
          setSelectedNote(noteOption);
        }
      }
    }
  }, [notes, show, taskId, isEditMode, isViewMode, getValues, selectedNote]);

  // Reset end_time when start_time changes
  useEffect(() => {
    if (!selectedStartTime) {
      setValue('end_time', null);
    }
  }, [selectedStartTime, setValue]);

  const handleNoteChange = (option: NoteOption | null) => {
    setSelectedNote(option);
    setValue('note_id', option?.value || null);
  };

  const getEndTimeOptions = (): string[] => {
    if (!selectedStartTime) return TIME_OPTIONS;
    const startMinutes = timeToMinutes(selectedStartTime);
    return TIME_OPTIONS.filter((time) => timeToMinutes(time) > startMinutes);
  };

  const formatTimeDisplay = (time: string): string => {
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  const onSubmit = async (data: FormValues) => {
    if (isViewMode) {
      // View mode - do nothing on submit
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (isEditMode && taskId) {
        // Update existing task
        const payload: UpdateTaskPayload = {
          id: taskId,
          label: data.label,
          description: data.description || null,
          due_date: data.due_date || null,
          start_time: data.start_time || null,
          end_time: data.end_time || null,
          reminder: data.reminder || null,
          assigned_to: data.assigned_to || null,
          priority: (data.priority as 'low' | 'medium' | 'high' | null) || null,
          flagged: data.flagged || false,
          completed: data.completed || false,
        };

        const result = await dispatch(updateTask(payload));

        if (result.type.endsWith('/fulfilled')) {
          dispatch(fetchTasks());
          handleClose();
        } else {
          setError(result.payload as string || 'Failed to update task');
        }
      } else {
        // Create new task
        const payload: CreateTaskPayload = {
          note_id: data.note_id || null,
          label: data.label,
          description: data.description || null,
          due_date: data.due_date || null,
          start_time: data.start_time || null,
          end_time: data.end_time || null,
          reminder: data.reminder || null,
          assigned_to: data.assigned_to || null,
          priority: (data.priority as 'low' | 'medium' | 'high' | null) || null,
          flagged: data.flagged || false,
          completed: data.completed || false,
        };

        const result = await dispatch(createTask(payload));

        if (result.type.endsWith('/fulfilled')) {
          dispatch(fetchTasks());
          handleClose();
        } else {
          setError(result.payload as string || 'Failed to create task');
        }
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    setSelectedNote(null);
    setError(null);
    onHide();
  };

  const getModalTitle = () => {
    if (isViewMode) return 'View Task';
    if (isEditMode) return 'Edit Task';
    return 'Add Task';
  };

  const getSubmitButtonText = () => {
    if (isViewMode) return 'Close';
    if (isEditMode) return loading ? 'Updating...' : 'Update Task';
    return loading ? 'Creating...' : 'Create Task';
  };

  return (
    <Modal show={show} onHide={handleClose} centered size="lg">
      <Form onSubmit={handleSubmit(onSubmit)}>
        <ModalHeader>
          <ModalTitle as="h4">{getModalTitle()}</ModalTitle>
          <button
            type="button"
            className="btn-close"
            onClick={handleClose}
            disabled={loading || loadingTask}
          ></button>
        </ModalHeader>
        <ModalBody>
          {(loadingTask && (isEditMode || isViewMode)) && (
            <div className="text-center py-3">
              <Spinner animation="border" size="sm" className="text-primary" />
              <p className="text-muted mt-2 mb-0">Loading task...</p>
            </div>
          )}

          {error && (
            <Alert variant="danger" className="mb-3">
              {error}
            </Alert>
          )}

          {!loadingTask && (
            <>

          <div className="mb-3">
            <FormLabel>Note (Optional)</FormLabel>
            <Select
              className="react-select"
              classNamePrefix="react-select"
              placeholder="Select a note"
              options={notes}
              value={selectedNote}
              onChange={handleNoteChange}
              isClearable
              isDisabled={loading || loadingNotes || isViewMode}
              isLoading={loadingNotes}
            />
            <input type="hidden" {...control.register('note_id')} />
          </div>

          <div className="mb-3">
            <FormLabel>
              Task Name <span className="text-danger">*</span>
            </FormLabel>
            <Controller
              name="label"
              control={control}
              render={({ field, fieldState }) => (
                <>
                  <FormControl
                    {...field}
                    type="text"
                    placeholder="Enter task name"
                    isInvalid={!!fieldState.error}
                    disabled={loading || isViewMode}
                    readOnly={isViewMode}
                  />
                  {fieldState.error && (
                    <div className="invalid-feedback d-block">{fieldState.error.message}</div>
                  )}
                </>
              )}
            />
          </div>

          <div className="mb-3">
            <FormLabel>
              Task Description <span className="text-danger">*</span>
            </FormLabel>
            <Controller
              name="description"
              control={control}
              render={({ field, fieldState }) => (
                <>
                  <FormControl
                    {...field}
                    as="textarea"
                    rows={3}
                    placeholder="Enter task description"
                    isInvalid={!!fieldState.error}
                    disabled={loading || isViewMode}
                    readOnly={isViewMode}
                    value={field.value || ''}
                  />
                  {fieldState.error && (
                    <div className="invalid-feedback d-block">{fieldState.error.message}</div>
                  )}
                </>
              )}
            />
          </div>

          <div className="row">
            <div className="col-md-4 mb-3">
              <FormLabel>Due Date</FormLabel>
              <Controller
                name="due_date"
                control={control}
                render={({ field }) => (
                  <FormControl
                    {...field}
                    type="date"
                    disabled={loading || isViewMode}
                    readOnly={isViewMode}
                    value={field.value || ''}
                  />
                )}
              />
            </div>

            <div className="col-md-4 mb-3">
              <FormLabel>Start Time</FormLabel>
              <Controller
                name="start_time"
                control={control}
                render={({ field, fieldState }) => (
                  <>
                    <FormControl
                      {...field}
                      as="select"
                      isInvalid={!!fieldState.error}
                      disabled={loading || isViewMode}
                      value={field.value || ''}
                    >
                      <option value="">Select start time</option>
                      {TIME_OPTIONS.map((time) => (
                        <option key={time} value={time}>
                          {formatTimeDisplay(time)}
                        </option>
                      ))}
                    </FormControl>
                    {fieldState.error && (
                      <div className="invalid-feedback d-block">{fieldState.error.message}</div>
                    )}
                  </>
                )}
              />
            </div>

            <div className="col-md-4 mb-3">
              <FormLabel>End Time</FormLabel>
              <Controller
                name="end_time"
                control={control}
                render={({ field, fieldState }) => (
                  <>
                    <FormControl
                      {...field}
                      as="select"
                      isInvalid={!!fieldState.error}
                      disabled={loading || !selectedStartTime || isViewMode}
                      value={field.value || ''}
                    >
                      <option value="">Select end time</option>
                      {getEndTimeOptions().map((time) => (
                        <option key={time} value={time}>
                          {formatTimeDisplay(time)}
                        </option>
                      ))}
                    </FormControl>
                    {fieldState.error && (
                      <div className="invalid-feedback d-block">{fieldState.error.message}</div>
                    )}
                  </>
                )}
              />
            </div>
          </div>

          <div className="row">
            <div className="col-md-4 mb-3">
              <FormLabel>Reminder</FormLabel>
              <Controller
                name="reminder"
                control={control}
                render={({ field }) => (
                  <FormControl
                    {...field}
                    as="select"
                    disabled={loading || isViewMode}
                    value={field.value || ''}
                  >
                    <option value="">No reminder</option>
                    {TIME_OPTIONS.map((time) => (
                      <option key={time} value={time}>
                        {formatTimeDisplay(time)}
                      </option>
                    ))}
                  </FormControl>
                )}
              />
            </div>

            <div className="col-md-4 mb-3">
              <FormLabel>Assigned To</FormLabel>
              <Controller
                name="assigned_to"
                control={control}
                render={({ field }) => (
                  <FormControl
                    {...field}
                    type="text"
                    placeholder="User ID or email"
                    disabled={loading || isViewMode}
                    readOnly={isViewMode}
                    value={field.value || ''}
                  />
                )}
              />
            </div>

            <div className="col-md-4 mb-3">
              <FormLabel>Priority</FormLabel>
              <Controller
                name="priority"
                control={control}
                render={({ field, fieldState }) => (
                  <>
                    <FormControl
                      {...field}
                      as="select"
                      isInvalid={!!fieldState.error}
                      disabled={loading || isViewMode}
                      value={field.value || ''}
                    >
                      <option value="">Select priority</option>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </FormControl>
                    {fieldState.error && (
                      <div className="invalid-feedback d-block">{fieldState.error.message}</div>
                    )}
                  </>
                )}
              />
            </div>
          </div>

          <div className="mb-3">
            <Controller
              name="flagged"
              control={control}
              render={({ field }) => (
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={field.value || false}
                    onChange={(e) => field.onChange(e.target.checked)}
                    disabled={loading || isViewMode}
                  />
                  <FormLabel className="form-check-label">Flagged</FormLabel>
                </div>
              )}
            />
          </div>
            </>
          )}
        </ModalBody>
        <ModalFooter>
          {isViewMode ? (
            <Button variant="primary" onClick={handleClose}>
              Close
            </Button>
          ) : (
            <>
              <Button variant="light" onClick={handleClose} disabled={loading || loadingTask}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={loading || loadingTask}>
                {loading ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    {isEditMode ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                    getSubmitButtonText()
                  )}
              </Button>
            </>
          )}
        </ModalFooter>
      </Form>
    </Modal>
  );
}

export default AddTaskDialog;

