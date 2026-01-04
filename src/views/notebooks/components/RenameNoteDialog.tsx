import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Button, Form, FormControl, FormLabel, Modal, ModalBody, ModalFooter, ModalHeader, ModalTitle } from 'react-bootstrap';
import { closeRenameNoteDialog } from '../store/notebooksSlice';
import noteService from '@/views/Dashboard/services/note.service';
import type { AppDispatch } from '@/store/types';

const schema = yup.object().shape({
  title: yup.string().required('Note title is required'),
});

function RenameNoteDialog() {
  const dispatch: AppDispatch = useDispatch();
  const { open, note } = useSelector((state: any) => state.notebooksApp?.notebooks?.renameNoteDialog || { open: false, note: null });

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
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

  const onSubmit = async (data: { title: string }) => {
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
    <Modal show={open} onHide={handleClose} centered>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <ModalHeader>
          <ModalTitle>Rename Note</ModalTitle>
          <button type="button" className="btn-close" onClick={handleClose}></button>
        </ModalHeader>
        <ModalBody>
          <div className="mb-3">
            <FormLabel>Note Title</FormLabel>
            <Controller
              name="title"
              control={control}
              render={({ field, fieldState }) => (
                <>
                  <FormControl
                    {...field}
                    type="text"
                    placeholder="Enter note title"
                    isInvalid={!!fieldState.error}
                    autoFocus
                  />
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
            Rename
          </Button>
        </ModalFooter>
      </Form>
    </Modal>
  );
}

export default RenameNoteDialog;

