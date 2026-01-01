import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import FusePageSimple from '@fuse/core/FusePageSimple';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import withReducer from '../../store/withReducer';
import TasksTable from './components/TasksTable';
import TaskDialog from './components/TaskDialog';
import reducer from './store';
import {
  fetchTasks,
  setSelectedTask,
  clearSelectedTask,
  selectSelectedTask,
} from './store/tasksSlice';

const Root = styled(FusePageSimple)(({ theme }) => ({
  '& .FusePageSimple-header': {
    backgroundColor: theme.palette.background.paper,
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
}));

function TasksApp() {
  console.log('TasksApp component rendering');
  const dispatch = useDispatch();
  const selectedTask = useSelector(selectSelectedTask);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    console.log('TasksApp useEffect running, dispatching fetchTasks');
    console.log('dispatch function:', dispatch);
    console.log('fetchTasks function:', fetchTasks);
    try {
      const promise = dispatch(fetchTasks());
      console.log('fetchTasks dispatched, promise:', promise);
      if (promise && typeof promise.catch === 'function') {
        promise.catch((error) => {
          console.error('fetchTasks promise rejected:', error);
        });
      }
    } catch (error) {
      console.error('Error dispatching fetchTasks:', error);
    }
  }, [dispatch]);

  const handleNewTask = () => {
    dispatch(clearSelectedTask());
    setDialogOpen(true);
  };

  const handleTaskClick = (task) => {
    dispatch(setSelectedTask(task));
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    dispatch(clearSelectedTask());
  };

  return (
    <>
      <Root
        header={
          <div className="flex flex-col sm:flex-row flex-1 w-full items-center justify-between py-12 px-24">
            <Typography className="text-24 font-semibold">Tasks</Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<FuseSvgIcon>heroicons-outline:plus</FuseSvgIcon>}
              onClick={handleNewTask}
              className="mt-12 sm:mt-0"
            >
              New Task
            </Button>
          </div>
        }
        content={
          <div className="w-full p-24">
            <TasksTable onTaskClick={handleTaskClick} />
          </div>
        }
      />
      <TaskDialog open={dialogOpen} task={selectedTask} onClose={handleCloseDialog} />
    </>
  );
}

export default withReducer('tasksApp', reducer)(TasksApp);
