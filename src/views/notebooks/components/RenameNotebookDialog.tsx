import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Button, Form, FormControl, FormLabel, Modal, ModalBody, ModalFooter, ModalHeader, ModalTitle } from 'react-bootstrap';
import { closeRenameNotebookDialog, updateNotebook } from '../store/notebooksSlice';
import type { AppDispatch } from '@/store/types';

const schema = yup.object().shape({
  name: yup.string().required('Notebook name is required'),
});

function RenameNotebookDialog() {
  const dispatch: AppDispatch = useDispatch();
  const { open, notebook } = useSelector((state: any) => state.notebooksApp?.notebooks?.renameNotebookDialog || { open: false, notebook: null });

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { name: '' },
  });

  useEffect(() => {
    if (open && notebook) {
      reset({ name: notebook.name || '' });
    }
  }, [open, notebook, reset]);

  const handleClose = () => {
    dispatch(closeRenameNotebookDialog());
    reset();
  };

  const onSubmit = (data: { name: string }) => {
    if (notebook) {
      dispatch(updateNotebook({ id: notebook.id, data: { name: data.name } }));
    }
  };

  if (!notebook) return null;

  return (
    <Modal show={open} onHide={handleClose} centered>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <ModalHeader>
          <ModalTitle>Rename Notebook</ModalTitle>
          <button type="button" className="btn-close" onClick={handleClose}></button>
        </ModalHeader>
        <ModalBody>
          <div className="mb-3">
            <FormLabel>Notebook Name</FormLabel>
            <Controller
              name="name"
              control={control}
              render={({ field, fieldState }) => (
                <>
                  <FormControl
                    {...field}
                    type="text"
                    placeholder="Enter notebook name"
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

export default RenameNotebookDialog;

