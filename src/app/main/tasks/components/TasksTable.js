import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { styled } from '@mui/material/styles';
import { format } from 'date-fns';
import clsx from 'clsx';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import FuseScrollbars from '@fuse/core/FuseScrollbars';
import FuseLoading from '@fuse/core/FuseLoading';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import TasksTableHead from './TasksTableHead';
import {
  fetchTasks,
  selectTasks,
  selectTasksLoading,
  toggleTaskComplete,
  deleteTask,
} from '../store/tasksSlice';

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  '&:last-child td, &:last-child th': {
    border: 0,
  },
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: theme.palette.action.selected,
  },
}));

const getPriorityColor = (priority) => {
  switch (priority) {
    case 'high':
      return 'error';
    case 'medium':
      return 'warning';
    case 'low':
      return 'info';
    default:
      return 'default';
  }
};

function TasksTable(props) {
  const dispatch = useDispatch();
  const tasks = useSelector(selectTasks);
  const loading = useSelector(selectTasksLoading);

  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [order, setOrder] = useState({
    direction: 'asc',
    id: null,
  });

  useEffect(() => {
    console.log('TasksTable useEffect running');
    console.log('dispatch function:', dispatch);
    console.log('fetchTasks function:', fetchTasks);
    try {
      const promise = dispatch(fetchTasks());
      console.log('fetchTasks dispatched from TasksTable, promise:', promise);
    } catch (error) {
      console.error('Error dispatching fetchTasks from TasksTable:', error);
    }
  }, [dispatch]);

  function handleRequestSort(event, property) {
    // UI only - sorting will be handled by API
    const id = property;
    let direction = 'desc';

    if (order.id === property && order.direction === 'desc') {
      direction = 'asc';
    }

    setOrder({
      direction,
      id,
    });
    // TODO: Call API with sort parameters when API supports it
  }

  function handleSelectAllClick(event) {
    if (event.target.checked) {
      setSelected(tasks.map((n) => n.id));
      return;
    }
    setSelected([]);
  }

  function handleClick(item) {
    props.onTaskClick(item);
  }

  function handleCheck(event, id) {
    event.stopPropagation();
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(selected.slice(0, selectedIndex), selected.slice(selectedIndex + 1));
    }

    setSelected(newSelected);
  }

  function handleChangePage(event, value) {
    setPage(value);
  }

  function handleChangeRowsPerPage(event) {
    setRowsPerPage(event.target.value);
  }

  function handleToggleComplete(event, task) {
    event.stopPropagation();
    dispatch(toggleTaskComplete({ id: task.id, completed: !task.completed }));
  }

  function handleDelete(event, task) {
    event.stopPropagation();
    if (window.confirm('Are you sure you want to delete this task?')) {
      dispatch(deleteTask(task.id));
    }
  }

  // Display tasks as received from API (no client-side sorting)
  const displayData = tasks;

  useEffect(() => {
    console.log('TasksTable - tasks:', tasks);
    console.log('TasksTable - loading:', loading);
    console.log('TasksTable - tasks length:', tasks.length);
  }, [tasks, loading]);

  if (loading && tasks.length === 0) {
    return (
      <div className="flex items-center justify-center p-24">
        <FuseLoading />
      </div>
    );
  }

  if (tasks.length === 0 && !loading) {
    return (
      <div className="flex flex-1 items-center justify-center h-full">
        <Typography color="text.secondary" variant="h5">
          No tasks found
        </Typography>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col">
      <FuseScrollbars className="grow overflow-x-auto">
        <Table stickyHeader className="min-w-xl" aria-labelledby="tableTitle">
          <TasksTableHead
            selectedTaskIds={selected}
            order={order}
            onSelectAllClick={handleSelectAllClick}
            onRequestSort={handleRequestSort}
            rowCount={tasks.length}
          />
          <TableBody>
            {displayData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((task, index) => {
              const isSelected = selected.indexOf(task.id) !== -1;
              return (
                <StyledTableRow
                  key={task.id}
                  className="h-72 cursor-pointer"
                  hover
                  role="checkbox"
                  aria-checked={isSelected}
                  tabIndex={-1}
                  selected={isSelected}
                  onClick={() => handleClick(task)}
                >
                    <TableCell padding="checkbox" className="w-40 md:w-64 text-center" onClick={(e) => e.stopPropagation()}>
                      <Checkbox checked={isSelected} onClick={(event) => handleCheck(event, task.id)} />
                    </TableCell>
                    <TableCell padding="checkbox" className="w-40 md:w-64 text-center" onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={task.completed || false}
                        onChange={(event) => handleToggleComplete(event, task)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </TableCell>
                    <TableCell component="th" scope="row" className="font-medium">
                      <Typography className={clsx(task.completed && 'line-through opacity-60')}>
                        {task.label || 'Untitled Task'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {task.priority && (
                        <Chip
                          label={task.priority}
                          color={getPriorityColor(task.priority)}
                          size="small"
                          variant="outlined"
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      {task.due_date || task.start_date ? (
                        <Typography variant="body2" color="text.secondary">
                          {(() => {
                            try {
                              const dateStr = task.due_date || task.start_date;
                              if (dateStr) {
                                return format(new Date(dateStr), 'MMM dd, yyyy');
                              }
                              return 'No date';
                            } catch (error) {
                              console.error('Date formatting error:', error, task);
                              return task.due_date || task.start_date || 'No date';
                            }
                          })()}
                        </Typography>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No date
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={task.completed ? 'Completed' : 'Pending'}
                        color={task.completed ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell className="w-64 text-center" onClick={(e) => e.stopPropagation()}>
                      <IconButton
                        onClick={(event) => handleDelete(event, task)}
                        size="small"
                        color="error"
                      >
                        <FuseSvgIcon size={20}>heroicons-outline:trash</FuseSvgIcon>
                      </IconButton>
                    </TableCell>
                  </StyledTableRow>
              );
            })}
          </TableBody>
        </Table>
      </FuseScrollbars>

        <TablePagination
          className="shrink-0 border-t-1"
          component="div"
          count={tasks.length}
          rowsPerPage={rowsPerPage}
          page={page}
          backIconButtonProps={{
            'aria-label': 'Previous Page',
          }}
          nextIconButtonProps={{
            'aria-label': 'Next Page',
          }}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
    </div>
  );
}

export default TasksTable;

