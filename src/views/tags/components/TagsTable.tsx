import {
  type ColumnFiltersState,
  createColumnHelper,
  type FilterFn,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  type Row as TableRow,
  type Table as TableType,
  useReactTable,
} from '@tanstack/react-table';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, CardFooter, CardHeader, Col, Row } from 'react-bootstrap';
import { LuSearch, LuTag } from 'react-icons/lu';
import { TbEdit, TbTrash, TbPlus } from 'react-icons/tb';

import ComponentCard from '@/components/cards/ComponentCard';
import DataTable from '@/components/table/DataTable';
import DeleteConfirmationModal from '@/components/table/DeleteConfirmationModal';
import TablePagination from '@/components/table/TablePagination';
import type { Tag } from '../types';
import {
  fetchTags,
  deleteTag,
  selectTagsItems,
  selectTagsLoading,
} from '../store/tagsSlice';
import type { AppDispatch } from '@/store/types';
import EditTagDialog from './EditTagDialog';
import AddTagDialog from './AddTagDialog';

const columnHelper = createColumnHelper<Tag>();

const TagsTable = () => {
  const dispatch: AppDispatch = useDispatch();
  const tags = useSelector(selectTagsItems);
  const loading = useSelector(selectTagsLoading);

  const [data, setData] = useState<Tag[]>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [selectedRowIds, setSelectedRowIds] = useState<Record<string, boolean>>({});
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [showEditDialog, setShowEditDialog] = useState<boolean>(false);
  const [showAddDialog, setShowAddDialog] = useState<boolean>(false);
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null);

  // Fetch tags on mount
  useEffect(() => {
    dispatch(fetchTags());
  }, [dispatch]);

  // Update local data when tags change
  useEffect(() => {
    setData(tags);
  }, [tags]);

  const columns = [
    {
      id: 'select',
      header: ({ table }: { table: TableType<Tag> }) => (
        <input
          type="checkbox"
          className="form-check-input form-check-input-light fs-14"
          checked={table.getIsAllRowsSelected()}
          onChange={table.getToggleAllRowsSelectedHandler()}
        />
      ),
      cell: ({ row }: { row: TableRow<Tag> }) => (
        <input
          type="checkbox"
          className="form-check-input form-check-input-light fs-14"
          checked={row.getIsSelected()}
          onChange={row.getToggleSelectedHandler()}
        />
      ),
      enableSorting: false,
      enableColumnFilter: false,
    },
    columnHelper.accessor('name', {
      header: 'Tag Name',
      cell: ({ row }) => (
        <div className="d-flex align-items-center gap-2">
          {row.original.color && (
            <span
              className="badge rounded-circle"
              style={{
                width: '12px',
                height: '12px',
                backgroundColor: row.original.color.hex_code,
                padding: 0,
              }}
            />
          )}
          <span className="fw-semibold">{row.original.name}</span>
        </div>
      ),
    }),
    columnHelper.accessor('color', {
      header: 'Color',
      cell: ({ row }) => {
        const color = row.original.color;
        if (!color) return <span className="text-muted">-</span>;
        return (
          <div className="d-flex align-items-center gap-2">
            <span
              className="badge rounded"
              style={{
                backgroundColor: color.hex_code,
                color: '#fff',
                padding: '4px 8px',
              }}
            >
              {color.name}
            </span>
          </div>
        );
      },
    }),
    columnHelper.accessor('created_at', {
      header: 'Created',
      cell: ({ row }) => {
        const date = new Date(row.original.created_at);
        return date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
      },
    }),
    columnHelper.accessor('updated_at', {
      header: 'Updated',
      cell: ({ row }) => {
        const date = new Date(row.original.updated_at);
        return date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
      },
    }),
    {
      header: 'Actions',
      cell: ({ row }: { row: TableRow<Tag> }) => (
        <div className="d-flex gap-1">
          <Button
            variant="light"
            size="sm"
            className="btn-icon rounded-circle"
            onClick={() => {
              setSelectedTag(row.original);
              setShowEditDialog(true);
            }}
          >
            <TbEdit className="fs-lg" />
          </Button>
          <Button
            variant="danger"
            size="sm"
            className="btn-icon rounded-circle"
            onClick={() => {
              toggleDeleteModal();
              setSelectedRowIds({ [row.id]: true });
            }}
          >
            <TbTrash className="fs-lg" />
          </Button>
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter, columnFilters, pagination, rowSelection: selectedRowIds },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    onRowSelectionChange: setSelectedRowIds,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    globalFilterFn: 'includesString',
    enableColumnFilters: false,
    enableRowSelection: true,
  });

  const pageIndex = table.getState().pagination.pageIndex;
  const pageSize = table.getState().pagination.pageSize;
  const totalItems = table.getFilteredRowModel().rows.length;

  const start = pageIndex * pageSize + 1;
  const end = Math.min(start + pageSize - 1, totalItems);

  const toggleDeleteModal = () => {
    setShowDeleteModal(!showDeleteModal);
  };

  const handleDelete = async () => {
    const selectedIds = Object.keys(selectedRowIds);
    for (const rowId of selectedIds) {
      const tag = data[parseInt(rowId)];
      if (tag) {
        await dispatch(deleteTag(tag.id));
      }
    }
    setSelectedRowIds({});
    setPagination({ ...pagination, pageIndex: 0 });
    setShowDeleteModal(false);
    // Refresh tags after deletion
    dispatch(fetchTags());
  };

  const handleCloseEditDialog = () => {
    setShowEditDialog(false);
    setSelectedTag(null);
  };

  return (
    <>
      <Row>
        <Col xs={12}>
          <ComponentCard title="Tags" bodyClassName="p-0">
            <CardHeader className="border-light justify-content-between">
              <div className="d-flex gap-2">
                <div className="app-search">
                  <input
                    type="search"
                    className="form-control"
                    placeholder="Search tags..."
                    value={globalFilter ?? ''}
                    onChange={(e) => setGlobalFilter(e.target.value)}
                  />
                  <LuSearch className="app-search-icon text-muted" />
                </div>

                {Object.keys(selectedRowIds).length > 0 && (
                  <Button variant="danger" size="sm" onClick={toggleDeleteModal}>
                    Delete
                  </Button>
                )}
              </div>

              <div className="d-flex align-items-center gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setShowAddDialog(true)}
                  className="d-flex align-items-center gap-1"
                >
                  <TbPlus size={18} />
                  Add Tag
                </Button>
                <div>
                  <select
                    className="form-select form-control my-1 my-md-0"
                    value={table.getState().pagination.pageSize}
                    onChange={(e) => table.setPageSize(Number(e.target.value))}
                  >
                    {[5, 10, 15, 20, 25].map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </CardHeader>

            {loading && data.length === 0 ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : (
              <>
                <DataTable<Tag> table={table} emptyMessage="No tags found" />

                {table.getRowModel().rows.length > 0 && (
                  <CardFooter className="border-0">
                    <TablePagination
                      totalItems={totalItems}
                      start={start}
                      end={end}
                      itemsName="tags"
                      showInfo
                      previousPage={table.previousPage}
                      canPreviousPage={table.getCanPreviousPage()}
                      pageCount={table.getPageCount()}
                      pageIndex={table.getState().pagination.pageIndex}
                      setPageIndex={table.setPageIndex}
                      nextPage={table.nextPage}
                      canNextPage={table.getCanNextPage()}
                    />
                  </CardFooter>
                )}
              </>
            )}

            <DeleteConfirmationModal
              show={showDeleteModal}
              onHide={toggleDeleteModal}
              onConfirm={handleDelete}
              selectedCount={Object.keys(selectedRowIds).length}
              itemName="tag"
            />
          </ComponentCard>
        </Col>
      </Row>

      <EditTagDialog
        show={showEditDialog}
        onHide={handleCloseEditDialog}
        tag={selectedTag}
      />

      <AddTagDialog
        show={showAddDialog}
        onHide={() => setShowAddDialog(false)}
      />
    </>
  );
};

export default TagsTable;

