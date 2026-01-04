import { useDispatch, useSelector } from 'react-redux';
import { Button, Modal, ModalBody, ModalFooter, ModalHeader, ModalTitle } from 'react-bootstrap';
import { closeDeleteNoteDialog } from '../store/notebooksSlice';
import noteService from '@/views/Dashboard/services/note.service';
import type { AppDispatch } from '@/store/types';

function DeleteNoteDialog() {
  const dispatch: AppDispatch = useDispatch();
  const { open, note } = useSelector((state: any) => state.notebooksApp?.notebooks?.deleteNoteDialog || { open: false, note: null });

  const handleClose = () => {
    dispatch(closeDeleteNoteDialog());
  };

  const handleDelete = async () => {
    if (note) {
      try {
        await noteService.deleteNote(note.id);
        dispatch(closeDeleteNoteDialog());
      } catch (error) {
        console.error('Failed to delete note:', error);
      }
    }
  };

  if (!note) return null;

  return (
    <Modal show={open} onHide={handleClose} centered>
      <ModalHeader>
        <ModalTitle>Delete Note</ModalTitle>
        <button type="button" className="btn-close" onClick={handleClose}></button>
      </ModalHeader>
      <ModalBody>
        <p>
          Are you sure you want to delete &quot;{note.title || 'Untitled'}&quot;? This action cannot be undone.
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

export default DeleteNoteDialog;

