import { useDispatch, useSelector } from 'react-redux';
import { Button, Modal, ModalBody, ModalFooter, ModalHeader, ModalTitle } from 'react-bootstrap';
import { closeDeleteStackDialog, deleteStack } from '../store/notebooksSlice';
import type { AppDispatch } from '@/store/types';

function DeleteStackDialog() {
  const dispatch: AppDispatch = useDispatch();
  const { open, stack } = useSelector((state: any) => state.notebooksApp?.notebooks?.deleteStackDialog || { open: false, stack: null });

  const handleClose = () => {
    dispatch(closeDeleteStackDialog());
  };

  const handleDelete = () => {
    if (stack) {
      dispatch(deleteStack(stack.id));
    }
  };

  if (!stack) return null;

  return (
    <Modal show={open} onHide={handleClose} centered>
      <ModalHeader>
        <ModalTitle>Delete Stack</ModalTitle>
        <button type="button" className="btn-close" onClick={handleClose}></button>
      </ModalHeader>
      <ModalBody>
        <p>
          Are you sure you want to delete &quot;{stack.name || 'Untitled Stack'}&quot;? This action cannot be undone.
        </p>
      </ModalBody>
      <ModalFooter>
        <Button variant="light" onClick={handleClose}>
          Cancel
        </Button>
        <Button variant="danger" onClick={handleDelete}>
          Delete
        </Button>
      </ModalFooter>
    </Modal>
  );
}

export default DeleteStackDialog;

