import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Button, Form, FormControl, FormLabel, Modal, ModalBody, ModalFooter, ModalHeader, ModalTitle } from 'react-bootstrap';
import { closeRenameStackDialog, updateStack } from '../store/notebooksSlice';
import type { AppDispatch } from '@/store/types';

const schema = yup.object().shape({
  name: yup.string().required('Stack name is required'),
});

function RenameStackDialog() {
  const dispatch: AppDispatch = useDispatch();
  const { open, stack } = useSelector((state: any) => state.notebooksApp?.notebooks?.renameStackDialog || { open: false, stack: null });

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
    if (open && stack) {
      reset({ name: stack.name || '' });
    }
  }, [open, stack, reset]);

  const handleClose = () => {
    dispatch(closeRenameStackDialog());
    reset();
  };

  const onSubmit = (data: { name: string }) => {
    if (stack) {
      dispatch(updateStack({ id: stack.id, data: { name: data.name } }));
    }
  };

  if (!stack) return null;

  return (
    <Modal show={open} onHide={handleClose} centered>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <ModalHeader>
          <ModalTitle>Rename Stack</ModalTitle>
          <button type="button" className="btn-close" onClick={handleClose}></button>
        </ModalHeader>
        <ModalBody>
          <div className="mb-3">
            <FormLabel>Stack Name</FormLabel>
            <Controller
              name="name"
              control={control}
              render={({ field, fieldState }) => (
                <>
                  <FormControl
                    {...field}
                    type="text"
                    placeholder="Enter stack name"
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

export default RenameStackDialog;

