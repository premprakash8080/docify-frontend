import { Container } from 'react-bootstrap';
import withReducer from '@/store/withReducer';
import PageBreadcrumb from '@/components/PageBreadcrumb';
import TagsTable from './components/TagsTable';
import reducer from './store';

const Tags = () => {
  return (
    <Container fluid>
      <PageBreadcrumb title="Tags" subtitle="Manage your tags" />
      <TagsTable />
    </Container>
  );
};

export default withReducer('tagsApp', reducer)(Tags);

