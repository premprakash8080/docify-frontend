import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Button, Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'react-bootstrap';
import { TbDotsVertical, TbPencil, TbArrowRight, TbTrash } from 'react-icons/tb';
import {
  openRenameNotebookDialog,
  openDeleteNotebookDialog,
  openMoveNotebookDialog,
} from '../store/notebooksSlice';
import type { NotebookWithNotes } from '../types';
import type { AppDispatch } from '@/store/types';

interface NotebookActionsMenuProps {
  notebook: NotebookWithNotes;
  trigger?: React.ReactNode;
}

function NotebookActionsMenu({ notebook, trigger }: NotebookActionsMenuProps) {
  const dispatch: AppDispatch = useDispatch();
  const [show, setShow] = useState(false);

  const handleRename = () => {
    dispatch(openRenameNotebookDialog(notebook));
    setShow(false);
  };

  const handleDelete = () => {
    dispatch(openDeleteNotebookDialog(notebook));
    setShow(false);
  };

  const handleMoveToStack = () => {
    dispatch(openMoveNotebookDialog(notebook));
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
        <DropdownItem onClick={handleRename}>
          <TbPencil className="me-2" size={18} />
          Rename Notebook
        </DropdownItem>
        <DropdownItem onClick={handleMoveToStack}>
          <TbArrowRight className="me-2" size={18} />
          Move to Stack
        </DropdownItem>
        <DropdownItem onClick={handleDelete} className="text-danger">
          <TbTrash className="me-2" size={18} />
          Delete Notebook
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
}

export default NotebookActionsMenu;

