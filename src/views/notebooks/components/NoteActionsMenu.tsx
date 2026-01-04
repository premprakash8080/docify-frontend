import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Button, Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'react-bootstrap';
import { TbDotsVertical, TbEye, TbPencil, TbArrowRight, TbTrash } from 'react-icons/tb';
import { openRenameNoteDialog, openDeleteNoteDialog, openMoveNoteDialog } from '../store/notebooksSlice';
import type { Note } from '@/views/Dashboard/types';
import type { AppDispatch } from '@/store/types';

interface NoteActionsMenuProps {
  note: Note;
  trigger?: React.ReactNode;
}

function NoteActionsMenu({ note, trigger }: NoteActionsMenuProps) {
  const dispatch: AppDispatch = useDispatch();
  const [show, setShow] = useState(false);

  const handleOpen = () => {
    // TODO: Navigate to note view
    setShow(false);
  };

  const handleRename = () => {
    dispatch(openRenameNoteDialog(note));
    setShow(false);
  };

  const handleDelete = () => {
    dispatch(openDeleteNoteDialog(note));
    setShow(false);
  };

  const handleMove = () => {
    dispatch(openMoveNoteDialog(note));
    setShow(false);
  };

  return (
    <Dropdown show={show} onToggle={setShow} onClick={(e) => e.stopPropagation()}>
      {trigger ? (
        <div onClick={(e) => { e.stopPropagation(); setShow(!show); }}>
          {trigger}
        </div>
      ) : (
        <DropdownToggle
          as={Button}
          variant="light"
          size="sm"
          className="btn-icon rounded-circle p-1"
          onClick={(e) => {
            e.stopPropagation();
            setShow(!show);
          }}
        >
          <TbDotsVertical size={20} />
        </DropdownToggle>
      )}
      <DropdownMenu align="end">
        <DropdownItem onClick={handleOpen}>
          <TbEye className="me-2" size={18} />
          Open
        </DropdownItem>
        <DropdownItem onClick={handleRename}>
          <TbPencil className="me-2" size={18} />
          Rename
        </DropdownItem>
        <DropdownItem onClick={handleMove}>
          <TbArrowRight className="me-2" size={18} />
          Move to Notebook
        </DropdownItem>
        <DropdownItem onClick={handleDelete} className="text-danger">
          <TbTrash className="me-2" size={18} />
          Delete
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
}

export default NoteActionsMenu;

