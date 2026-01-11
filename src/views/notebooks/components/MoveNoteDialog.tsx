import { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Select from 'react-select';
import { Button, Form, FormLabel, Modal, ModalBody, ModalFooter, ModalHeader, ModalTitle, Spinner, Alert } from 'react-bootstrap';
import { closeMoveNoteDialog, fetchNotebooks, fetchStacks, fetchNotebookNotes } from '../store/notebooksSlice';
import notebookService from '../services/notebook.service';
import noteService from '@/views/notes/services/note.service';
import type { AppDispatch } from '@/store/types';
import type { Notebook } from '../types';

interface NotebookOption {
  value: string;
  label: string;
}

const schema = yup.object().shape({
  notebook_id: yup.string().required('Please select a notebook'),
});

function MoveNoteDialog() {
  const dispatch: AppDispatch = useDispatch();
  const { open, note } = useSelector((state: any) => state.notebooksApp?.notebooks?.moveNoteDialog || { open: false, note: null });
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [selectedNotebook, setSelectedNotebook] = useState<NotebookOption | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { notebook_id: '' },
  });

  useEffect(() => {
    const fetchNotebooks = async () => {
      if (open) {
        setLoading(true);
        setError(null);
        try {
          const response = await notebookService.getAllNotebooks(false);
          let notebooksData: Notebook[] = [];
          
          if (response.data && typeof response.data === 'object') {
            if ('data' in response.data) {
              const data = (response.data as any).data;
              if (Array.isArray(data)) {
                notebooksData = data;
              } else if (data && typeof data === 'object' && 'notebooks' in data && Array.isArray(data.notebooks)) {
                notebooksData = data.notebooks;
              }
            } else if (Array.isArray(response.data)) {
              notebooksData = response.data;
            }
          }
          
          setNotebooks(notebooksData);
        } catch (err: any) {
          console.error('Failed to fetch notebooks:', err);
          setError(err.msg || err.message || 'Failed to load notebooks');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchNotebooks();
  }, [open]);

  const notebookOptions: NotebookOption[] = useMemo(() => {
    return notebooks.map((nb) => ({
      value: nb.id,
      label: nb.name,
    }));
  }, [notebooks]);

  useEffect(() => {
    if (open && note) {
      const notebookId = note.notebook_id || '';
      reset({ notebook_id: notebookId });
      if (notebookId && notebooks.length > 0) {
        const option = notebookOptions.find((opt) => opt.value === notebookId);
        setSelectedNotebook(option || null);
      } else {
        setSelectedNotebook(null);
      }
    } else if (open && !note) {
      reset({ notebook_id: '' });
      setSelectedNotebook(null);
    }
  }, [open, note, reset, notebooks, notebookOptions]);

  const handleClose = () => {
    dispatch(closeMoveNoteDialog());
    reset();
    setError(null);
    setSelectedNotebook(null);
  };

  const handleNotebookChange = (option: NotebookOption | null) => {
    setSelectedNotebook(option);
    if (option) {
      setValue('notebook_id', option.value);
    } else {
      setValue('notebook_id', '');
    }
  };

  const onSubmit = async (data: { notebook_id: string }) => {
    if (!note || !data.notebook_id) return;
    
    setSubmitting(true);
    setError(null);
    
    try {
      const result = await noteService.moveNoteToNotebook(note.id, { notebook_id: data.notebook_id });
      
      if (result.success) {
        dispatch(fetchNotebooks());
        dispatch(fetchStacks());
        
        if (data.notebook_id) {
          dispatch(fetchNotebookNotes(data.notebook_id));
        }
        if (note.notebook_id) {
          dispatch(fetchNotebookNotes(note.notebook_id));
        }
        
        dispatch(closeMoveNoteDialog());
        reset();
      }
    } catch (err: any) {
      console.error('Failed to move note:', err);
      setError(err.msg || err.message || 'Failed to move note');
    } finally {
      setSubmitting(false);
    }
  };

  if (!note) return null;

  return (
    <Modal show={open} onHide={handleClose} centered>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <ModalHeader>
          <ModalTitle>Move Note to Notebook</ModalTitle>
          <button type="button" className="btn-close" onClick={handleClose}></button>
        </ModalHeader>
        <ModalBody>
          <p className="text-muted mb-3">
            Move &quot;{note.title || 'Untitled'}&quot; to a notebook
          </p>

          {error && (
            <Alert variant="danger" className="mb-3">
              {error}
            </Alert>
          )}

          {loading ? (
            <div className="text-center py-3">
              <Spinner animation="border" size="sm" className="text-primary" />
              <p className="text-muted mt-2 mb-0">Loading notebooks...</p>
            </div>
          ) : (
            <div className="mb-3">
              <FormLabel className="fw-semibold mb-2">Select Notebook</FormLabel>
              <Controller
                name="notebook_id"
                control={control}
                render={({ field, fieldState }) => (
                  <>
                    <Select
                      className="react-select"
                      classNamePrefix="react-select"
                      placeholder="Select a notebook"
                      options={notebookOptions}
                      value={selectedNotebook}
                      onChange={handleNotebookChange}
                      isDisabled={submitting}
                      isLoading={loading}
                      isSearchable
                      styles={{
                        control: (base, state) => ({
                          ...base,
                          borderColor: fieldState.error
                            ? 'var(--bs-form-invalid-border-color)'
                            : state.isFocused
                            ? 'var(--bs-primary)'
                            : base.borderColor,
                          boxShadow: fieldState.error
                            ? '0 0 0 0.25rem rgba(var(--bs-danger-rgb), 0.25)'
                            : state.isFocused
                            ? '0 0 0 0.25rem rgba(var(--bs-primary-rgb), 0.25)'
                            : 'none',
                          '&:hover': {
                            borderColor: fieldState.error
                              ? 'var(--bs-form-invalid-border-color)'
                              : 'var(--bs-primary)',
                          },
                        }),
                      }}
                    />
                    <input type="hidden" {...field} />
                    {fieldState.error && (
                      <div className="invalid-feedback d-block mt-1">{fieldState.error.message}</div>
                    )}
                  </>
                )}
              />
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onClick={handleClose} disabled={submitting || loading}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={submitting || loading}>
            {submitting ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Moving...
              </>
            ) : (
              'Move'
            )}
          </Button>
        </ModalFooter>
      </Form>
    </Modal>
  );
}

export default MoveNoteDialog;

