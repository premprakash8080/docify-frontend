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
import { LuSearch, LuFlag, LuCircleCheck, LuCircle } from 'react-icons/lu';
import { TbEdit, TbEye, TbTrash } from 'react-icons/tb';

import ComponentCard from '@/components/cards/ComponentCard';
import DataTable from '@/components/table/DataTable';
import DeleteConfirmationModal from '@/components/table/DeleteConfirmationModal';
import TablePagination from '@/components/table/TablePagination';
import { toPascalCase } from '@/helpers/casing';
import type { Task } from '../types';
import {
  fetchTasks,
  deleteTask,
  selectTasksItems,
  selectTasksLoading,
} from '../store/tasksSlice';
import type { AppDispatch } from '@/store/types';

const priorityFilterFn: FilterFn<any> = (row, columnId, value) => {
  const priority = row.getValue<string>(columnId);
  if (!value || value === 'All') return true;
  return priority === value;
};

const statusFilterFn: FilterFn<any> = (row, columnId, value) => {
  const completed = row.getValue<boolean>(columnId);
  if (!value || value === 'All') return true;
  if (value === 'completed') return completed === true;
  if (value === 'pending') return completed === false;
  return true;
};

const columnHelper = createColumnHelper<Task>();

const TasksTable = () => {
  const dispatch: AppDispatch = useDispatch();
  const tasks = useSelector(selectTasksItems);
  const loading = useSelector(selectTasksLoading);

  const [data, setData] = useState<Task[]>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [selectedRowIds, setSelectedRowIds] = useState<Record<string, boolean>>({});
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);

  // Fetch tasks on mount
  useEffect(() => {
    dispatch(fetchTasks());
  }, [dispatch]);

  // Update local data when tasks change
  useEffect(() => {
    setData(tasks);
  }, [tasks]);

  const columns = [
    {
      id: 'select',
      header: ({ table }: { table: TableType<Task> }) => (
        <input
          type="checkbox"
          className="form-check-input form-check-input-light fs-14"
          checked={table.getIsAllRowsSelected()}
          onChange={table.getToggleAllRowsSelectedHandler()}
        />
      ),
      cell: ({ row }: { row: TableRow<Task> }) => (
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
    columnHelper.accessor('label', {
      header: 'Task',
      cell: ({ row }) => (
        <div className="d-flex align-items-center gap-2">
          {row.original.flagged && (
            <LuFlag className="text-warning" size={16} />
          )}
          <span className={row.original.completed ? 'text-decoration-line-through text-muted' : ''}>
            {row.original.label}
          </span>
        </div>
      ),
    }),
    columnHelper.accessor('description', {
      header: 'Description',
      cell: ({ row }) => (
        <span className="text-muted">
          {row.original.description || '-'}
        </span>
      ),
    }),
    columnHelper.accessor('priority', {
      header: 'Priority',
      filterFn: priorityFilterFn,
      enableColumnFilter: true,
      cell: ({ row }) => {
        const priority = row.original.priority;
        if (!priority) return <span className="text-muted">-</span>;
        const variant =
          priority === 'high' ? 'danger' : priority === 'medium' ? 'warning' : 'info';
        return (
          <span className={`badge badge-soft-${variant} fs-xxs`}>
            {toPascalCase(priority)}
          </span>
        );
      },
    }),
    columnHelper.accessor('due_date', {
      header: 'Due Date',
      cell: ({ row }) => {
        const dueDate = row.original.due_date || row.original.start_date;
        if (!dueDate) return <span className="text-muted">-</span>;
        return new Date(dueDate).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
      },
    }),
    columnHelper.accessor('completed', {
      header: 'Status',
      filterFn: statusFilterFn,
      enableColumnFilter: true,
      cell: ({ row }) => (
        <span
          className={`badge ${
            row.original.completed
              ? 'badge-soft-success'
              : 'badge-soft-warning'
          } fs-xxs`}
        >
          {row.original.completed ? (
            <>
              <LuCircleCheck className="me-1" size={12} />
              Completed
            </>
          ) : (
            <>
              <LuCircle className="me-1" size={12} />
              Pending
            </>
          )}
        </span>
      ),
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
    {
      header: 'Actions',
      cell: ({ row }: { row: TableRow<Task> }) => (
        <div className="d-flex gap-1">
          <Button
            variant="light"
            size="sm"
            className="btn-icon rounded-circle"
            onClick={() => {
              // TODO: Implement view task
              console.log('View task:', row.original.id);
            }}
          >
            <TbEye className="fs-lg" />
          </Button>
          <Button
            variant="light"
            size="sm"
            className="btn-icon rounded-circle"
            onClick={() => {
              // TODO: Implement edit task
              console.log('Edit task:', row.original.id);
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
    enableColumnFilters: true,
    enableRowSelection: true,
    filterFns: {
      priority: priorityFilterFn,
      status: statusFilterFn,
    },
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
      const task = data[parseInt(rowId)];
      if (task) {
        await dispatch(deleteTask({ id: task.id }));
      }
    }
    setSelectedRowIds({});
    setPagination({ ...pagination, pageIndex: 0 });
    setShowDeleteModal(false);
    // Refresh tasks after deletion
    dispatch(fetchTasks());
  };

  return (
    <Row>
      <Col xs={12}>
        <ComponentCard title="Tasks" bodyClassName="p-0">
          <CardHeader className="border-light justify-content-between">
            <div className="d-flex gap-2">
              <div className="app-search">
                <input
                  type="search"
                  className="form-control"
                  placeholder="Search tasks..."
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
              <span className="me-2 fw-semibold">Filter By:</span>

              <div className="app-search">
                <select
                  className="form-select form-control my-1 my-md-0"
                  value={(table.getColumn('priority')?.getFilterValue() as string) ?? 'All'}
                  onChange={(e) =>
                    table
                      .getColumn('priority')
                      ?.setFilterValue(e.target.value === 'All' ? undefined : e.target.value)
                  }
                >
                  <option value="All">Priority</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
                <LuFlag className="app-search-icon text-muted" />
              </div>

              <div className="app-search">
                <select
                  className="form-select form-control my-1 my-md-0"
                  value={(table.getColumn('completed')?.getFilterValue() as string) ?? 'All'}
                  onChange={(e) =>
                    table
                      .getColumn('completed')
                      ?.setFilterValue(e.target.value === 'All' ? undefined : e.target.value)
                  }
                >
                  <option value="All">Status</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                </select>
                <LuCircleCheck className="app-search-icon text-muted" />
              </div>

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
              <DataTable<Task> table={table} emptyMessage="No tasks found" />

              {table.getRowModel().rows.length > 0 && (
                <CardFooter className="border-0">
                  <TablePagination
                    totalItems={totalItems}
                    start={start}
                    end={end}
                    itemsName="tasks"
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
            itemName="task"
          />
        </ComponentCard>
      </Col>
    </Row>
  );
};

export default TasksTable;

