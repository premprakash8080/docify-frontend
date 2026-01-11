import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import { Button, Modal, ModalBody, ModalFooter, ModalHeader, ModalTitle, Spinner, Alert } from 'react-bootstrap';
import { closeDeleteNoteDialog, fetchNotebooks, fetchStacks, fetchNotebookNotes, removeNoteFromNotebooks } from '../store/notebooksSlice';
import deleteNoteService from './DeleteNoteDialog/services/deleteNote.service';
import type { AppDispatch } from '@/store/types';

function DeleteNoteDialog() {
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();
  const { open, note } = useSelector((state: any) => state.notebooksApp?.notebooks?.deleteNoteDialog || { open: false, note: null });
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClose = () => {
    dispatch(closeDeleteNoteDialog());
    setError(null);
  };

  const handleDelete = async () => {
    if (!note) return;
    
    setDeleting(true);
    setError(null);
    
    try {
      const result = await deleteNoteService.deleteNote(note.id);
      
      if (result.success) {
        // Optimistically remove note from notebooks state
        dispatch(removeNoteFromNotebooks(note.id));
        
        // Refresh notebooks data
        dispatch(fetchNotebooks());
        dispatch(fetchStacks());
        
        // Refresh notes for the notebook if note has a notebook_id
        if (note.notebook_id) {
          dispatch(fetchNotebookNotes(note.notebook_id));
        }
        
        // Check if we're currently viewing this note and navigate away
        const currentPath = window.location.pathname;
        if (currentPath.includes(`/note/${note.id}`)) {
          // Navigate to notes list or dashboard
          if (currentPath.includes('/notebook/')) {
            const notebookId = currentPath.split('/notebook/')[1]?.split('/')[0];
            if (notebookId) {
              navigate(`/notes/notebook/${notebookId}/notes`);
            } else {
              navigate('/notes');
            }
          } else if (currentPath.includes('/stack/')) {
            const stackId = currentPath.split('/stack/')[1]?.split('/')[0];
            if (stackId) {
              navigate(`/notes/stack/${stackId}/notebooks`);
            } else {
              navigate('/notes');
            }
          } else {
            navigate('/notes');
          }
        }
        
        dispatch(closeDeleteNoteDialog());
      } else {
        setError(result.msg || 'Failed to delete note');
      }
    } catch (err: any) {
      console.error('Failed to delete note:', err);
      setError(err.msg || err.message || 'Failed to delete note');
    } finally {
      setDeleting(false);
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
        {error && (
          <Alert variant="danger" className="mt-3 mb-0">
            {error}
          </Alert>
        )}
      </ModalBody>
      <ModalFooter>
        <Button variant="light" onClick={handleClose} disabled={deleting}>
          Cancel
        </Button>
        <Button variant="danger" onClick={handleDelete} disabled={deleting}>
          {deleting ? (
            <>
              <Spinner animation="border" size="sm" className="me-2" />
              Deleting...
            </>
          ) : (
            'Delete'
          )}
        </Button>
      </ModalFooter>
    </Modal>
  );
}

export default DeleteNoteDialog;

