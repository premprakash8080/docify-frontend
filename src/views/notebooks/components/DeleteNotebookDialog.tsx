import { useDispatch, useSelector } from 'react-redux';
import { Button, Modal, ModalBody, ModalFooter, ModalHeader, ModalTitle } from 'react-bootstrap';
import { closeDeleteNotebookDialog, deleteNotebook } from '../store/notebooksSlice';
import type { AppDispatch } from '@/store/types';

function DeleteNotebookDialog() {
  const dispatch: AppDispatch = useDispatch();
  const { open, notebook } = useSelector((state: any) => state.notebooksApp?.notebooks?.deleteNotebookDialog || { open: false, notebook: null });

  const handleClose = () => {
    dispatch(closeDeleteNotebookDialog());
  };

  const handleDelete = () => {
    if (notebook) {
      dispatch(deleteNotebook(notebook.id));
    }
  };

  if (!notebook) return null;

  return (
    <Modal show={open} onHide={handleClose} centered>
      <ModalHeader>
        <ModalTitle>Delete Notebook</ModalTitle>
        <button type="button" className="btn-close" onClick={handleClose}></button>
      </ModalHeader>
      <ModalBody>
        <p>
          Are you sure you want to delete &quot;{notebook.name || 'Untitled Notebook'}&quot;? This action cannot be undone.
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

export default DeleteNotebookDialog;

