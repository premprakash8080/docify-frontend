import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Button, Form, FormControl, FormLabel, Modal, ModalBody, ModalFooter, ModalHeader, ModalTitle } from 'react-bootstrap';
import { closeAddNotebookDialog, createNotebook } from '../store/notebooksSlice';
import type { AppDispatch } from '@/store/types';

const schema = yup.object().shape({
  name: yup.string().required('Notebook name is required'),
});

function AddNotebookDialog() {
  const dispatch: AppDispatch = useDispatch();
  const { open, stack } = useSelector((state: any) => state.notebooksApp?.notebooks?.addNotebookDialog || { open: false, stack: null });

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
    if (open) {
      reset({ name: '' });
    }
  }, [open, reset]);

  const handleClose = () => {
    dispatch(closeAddNotebookDialog());
    reset();
  };

  const onSubmit = (data: { name: string }) => {
    dispatch(createNotebook({ name: data.name, stack_id: stack?.id || null }));
  };

  return (
    <Modal show={open} onHide={handleClose} centered>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <ModalHeader>
          <ModalTitle>Add Notebook</ModalTitle>
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
            Add Notebook
          </Button>
        </ModalFooter>
      </Form>
    </Modal>
  );
}

export default AddNotebookDialog;

