import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Dropdown, DropdownToggle, DropdownMenu, DropdownItem, InputGroup, FormControl } from 'react-bootstrap';
import { LuSearch, LuArrowUpDown, LuFilter, LuPlus } from 'react-icons/lu';
import {
  selectStacks,
  selectStandaloneNotebooks,
  openAddNotebookDialog,
  setSearchText,
} from '../store/notebooksSlice';
import type { AppDispatch } from '@/store/types';

function NotebooksHeader() {
  const dispatch: AppDispatch = useDispatch();
  const stacks = useSelector(selectStacks);
  const standaloneNotebooks = useSelector(selectStandaloneNotebooks);
  const searchText = useSelector((state: any) => state.notebooksApp?.notebooks?.searchText || '');
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  const totalNotebooks = stacks.reduce((sum, stack) => sum + (stack.notebooks?.length || 0), 0) + standaloneNotebooks.length;

  const handleNewNotebook = () => {
    dispatch(openAddNotebookDialog(null));
  };

  return (
    <div className="d-flex flex-column flex-md-row flex-1 w-100 align-items-center justify-content-between py-3 px-4 border-bottom">
      <div className="d-flex align-items-center gap-3 mb-3 mb-md-0">
        <h4 className="mb-0 fw-bold">Notebooks</h4>
        <span className="text-muted">{totalNotebooks}</span>
      </div>

      <div className="d-flex flex-1 align-items-center justify-content-end gap-2 w-100 w-md-auto">
        <InputGroup className="flex-nowrap" style={{ maxWidth: '300px' }}>
          <InputGroup.Text className="bg-transparent border-end-0">
            <LuSearch size={20} className="text-muted" />
          </InputGroup.Text>
          <FormControl
            placeholder="Find Notebooks..."
            value={searchText}
            onChange={(e) => dispatch(setSearchText(e.target.value))}
            className="border-start-0"
            style={{ borderRadius: '0.375rem 0 0 0.375rem' }}
          />
        </InputGroup>

        <Dropdown show={sortOpen} onToggle={setSortOpen}>
          <DropdownToggle variant="light" className="btn-icon rounded-circle">
            <LuArrowUpDown size={20} />
          </DropdownToggle>
          <DropdownMenu>
            <DropdownItem onClick={() => setSortOpen(false)}>
              <LuArrowUpDown className="me-2" size={16} />
              Title (A-Z)
            </DropdownItem>
            <DropdownItem onClick={() => setSortOpen(false)}>
              <LuArrowUpDown className="me-2" size={16} style={{ transform: 'rotate(180deg)' }} />
              Title (Z-A)
            </DropdownItem>
            <DropdownItem onClick={() => setSortOpen(false)}>
              <LuArrowUpDown className="me-2" size={16} />
              Date Updated
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>

        <Dropdown show={filterOpen} onToggle={setFilterOpen}>
          <DropdownToggle variant="light" className="btn-icon rounded-circle">
            <LuFilter size={20} />
          </DropdownToggle>
          <DropdownMenu>
            <DropdownItem onClick={() => setFilterOpen(false)}>All Notebooks</DropdownItem>
            <DropdownItem onClick={() => setFilterOpen(false)}>In Stacks</DropdownItem>
            <DropdownItem onClick={() => setFilterOpen(false)}>Standalone</DropdownItem>
          </DropdownMenu>
        </Dropdown>

        <Button variant="primary" onClick={handleNewNotebook} className="d-flex align-items-center gap-2">
          <LuPlus size={20} />
          New Notebook
        </Button>
      </div>
    </div>
  );
}

export default NotebooksHeader;

