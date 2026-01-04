import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Button, Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'react-bootstrap';
import { TbDotsVertical, TbPencil, TbPlus, TbTrash } from 'react-icons/tb';
import {
  openRenameStackDialog,
  openDeleteStackDialog,
  openAddNotebookDialog,
} from '../store/notebooksSlice';
import type { StackWithNotebooks } from '../types';
import type { AppDispatch } from '@/store/types';

interface StackActionsMenuProps {
  stack: StackWithNotebooks;
  trigger?: React.ReactNode;
}

function StackActionsMenu({ stack, trigger }: StackActionsMenuProps) {
  const dispatch: AppDispatch = useDispatch();
  const [show, setShow] = useState(false);

  const handleRename = () => {
    dispatch(openRenameStackDialog(stack));
    setShow(false);
  };

  const handleDelete = () => {
    dispatch(openDeleteStackDialog(stack));
    setShow(false);
  };

  const handleAddNotebook = () => {
    dispatch(openAddNotebookDialog(stack));
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
          Rename Stack
        </DropdownItem>
        <DropdownItem onClick={handleAddNotebook}>
          <TbPlus className="me-2" size={18} />
          Add Notebook
        </DropdownItem>
        <DropdownItem onClick={handleDelete} className="text-danger">
          <TbTrash className="me-2" size={18} />
          Delete Stack
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
}

export default StackActionsMenu;

