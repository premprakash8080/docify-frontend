import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Container } from 'react-bootstrap';
import withReducer from '@/store/withReducer';
import PageBreadcrumb from '@/components/PageBreadcrumb';
import TasksTable from './components/TasksTable';
import reducer from './store';
import { fetchTasks } from './store/tasksSlice';
import type { AppDispatch } from '@/store/types';

const TasksPage = () => {
  const dispatch: AppDispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchTasks());
  }, [dispatch]);

  return (
    <Container fluid>
      <PageBreadcrumb title="Tasks" subtitle="Manage your tasks" />
      <TasksTable />
    </Container>
  );
};

export default withReducer('tasksApp', reducer)(TasksPage);

