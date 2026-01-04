import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Button, Form, FormControl, FormLabel, Modal, ModalBody, ModalFooter, ModalHeader, ModalTitle, Alert, Spinner } from 'react-bootstrap';
import {
  selectStacks,
  closeMoveNotebookDialog,
  createStack,
  moveNotebookToStack,
} from '../store/notebooksSlice';
import type { AppDispatch } from '@/store/types';

const validationSchema = yup.object().shape({
  stackId: yup
    .string()
    .required('Please select a stack or create a new one'),
  newStackName: yup.string().when('stackId', {
    is: 'new',
    then: (schema) => schema.required('Stack name is required'),
    otherwise: (schema) => schema.notRequired(),
  }),
});

function MoveNotebookDialog() {
  const dispatch: AppDispatch = useDispatch();
  const stacks = useSelector(selectStacks);
  const { open, notebook } = useSelector((state: any) => state.notebooksApp?.notebooks?.moveNotebookDialog || { open: false, notebook: null });
  const [createNew, setCreateNew] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    watch,
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

  const onSubmit = async (data: { stackId: string; newStackName?: string }) => {
    setLoading(true);
    setError(null);

    try {
      if (data.stackId === 'new') {
        if (!data.newStackName || data.newStackName.trim() === '') {
          setError('Stack name is required');
          setLoading(false);
          return;
        }

        const createStackResult = await dispatch(createStack({ name: data.newStackName.trim() }));
        if (createStackResult.type.endsWith('/fulfilled')) {
          const payload = createStackResult.payload as any;
          const newStack = payload?.data?.stack || payload?.stack || payload;
          if (newStack?.id) {
            const moveResult = await dispatch(
              moveNotebookToStack({
                notebookId: notebook.id,
                stackId: newStack.id,
              })
            );
            if (moveResult.type.endsWith('/fulfilled')) {
              handleClose();
            } else {
              setError(moveResult.payload as string || 'Failed to move notebook to stack');
              setLoading(false);
            }
          } else {
            setError('Failed to create stack: Invalid response');
            setLoading(false);
          }
        } else {
          setError(createStackResult.payload as string || 'Failed to create stack');
          setLoading(false);
        }
      } else {
        const stackIdToSend = data.stackId === '' ? null : data.stackId;

        const moveResult = await dispatch(
          moveNotebookToStack({ notebookId: notebook.id, stackId: stackIdToSend })
        );
        if (moveResult.type.endsWith('/fulfilled')) {
          handleClose();
        } else {
          setError(moveResult.payload as string || 'Failed to move notebook to stack');
          setLoading(false);
        }
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
      setLoading(false);
    }
  };

  if (!notebook) return null;

  return (
    <Modal show={open} onHide={handleClose} centered>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <ModalHeader>
          <ModalTitle>Move Notebook to Stack</ModalTitle>
          <button type="button" className="btn-close" onClick={handleClose} disabled={loading}></button>
        </ModalHeader>
        <ModalBody>
          {error && <Alert variant="danger">{error}</Alert>}

          <p className="text-muted mb-3">
            Move &quot;{notebook.name || 'Untitled Notebook'}&quot; to a stack
          </p>

          <div className="mb-3">
            <FormLabel>Select Stack</FormLabel>
            <Controller
              name="stackId"
              control={control}
              render={({ field, fieldState }) => (
                <>
                  <FormControl
                    as="select"
                    {...field}
                    isInvalid={!!fieldState.error}
                    disabled={loading}
                  >
                    <option value="">None (Standalone)</option>
                    {stacks.map((stack) => (
                      <option key={stack.id} value={stack.id}>
                        {stack.name}
                      </option>
                    ))}
                    <option value="new">+ Create New Stack</option>
                  </FormControl>
                  {fieldState.error && (
                    <div className="invalid-feedback d-block">{fieldState.error.message}</div>
                  )}
                </>
              )}
            />
          </div>

          {createNew && (
            <div className="mb-3">
              <FormLabel>New Stack Name</FormLabel>
              <Controller
                name="newStackName"
                control={control}
                render={({ field, fieldState }) => (
                  <>
                    <FormControl
                      {...field}
                      type="text"
                      placeholder="Enter stack name"
                      isInvalid={!!fieldState.error}
                      disabled={loading}
                    />
                    {fieldState.error && (
                      <div className="invalid-feedback d-block">{fieldState.error.message}</div>
                    )}
                  </>
                )}
              />
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? (
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

export default MoveNotebookDialog;

