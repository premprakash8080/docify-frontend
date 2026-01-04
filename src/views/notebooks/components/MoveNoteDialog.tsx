import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Button, Form, FormControl, FormLabel, Modal, ModalBody, ModalFooter, ModalHeader, ModalTitle } from 'react-bootstrap';
import { closeMoveNoteDialog } from '../store/notebooksSlice';
import noteService from '@/views/Dashboard/services/note.service';
import type { AppDispatch } from '@/store/types';

const schema = yup.object().shape({
  notebook_id: yup.number().nullable().required('Please select a notebook'),
});

function MoveNoteDialog() {
  const dispatch: AppDispatch = useDispatch();
  const { open, note } = useSelector((state: any) => state.notebooksApp?.notebooks?.moveNoteDialog || { open: false, note: null });
  // TODO: Fetch notebooks list for selection
  const notebooks: any[] = [];

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { notebook_id: null },
  });

  useEffect(() => {
    if (open && note) {
      reset({ notebook_id: note.notebook_id });
    }
  }, [open, note, reset]);

  const handleClose = () => {
    dispatch(closeMoveNoteDialog());
    reset();
  };

  const onSubmit = async (data: { notebook_id: number | null }) => {
    if (note) {
      try {
        await noteService.updateNote(note.id, { notebook_id: data.notebook_id });
        dispatch(closeMoveNoteDialog());
      } catch (error) {
        console.error('Failed to move note:', error);
      }
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

          <div className="mb-3">
            <FormLabel>Select Notebook</FormLabel>
            <Controller
              name="notebook_id"
              control={control}
              render={({ field, fieldState }) => (
                <>
                  <FormControl
                    as="select"
                    {...field}
                    value={field.value || ''}
                    isInvalid={!!fieldState.error}
                  >
                    <option value="">None</option>
                    {notebooks.map((nb) => (
                      <option key={nb.id} value={nb.id}>
                        {nb.name}
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
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            Move
          </Button>
        </ModalFooter>
      </Form>
    </Modal>
  );
}

export default MoveNoteDialog;

