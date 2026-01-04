import { Container } from 'react-bootstrap';
import withReducer from '@/store/withReducer';
import PageBreadcrumb from '@/components/PageBreadcrumb';
import TemplatesList from './components/TemplatesList';
import reducer from './store';

const Templates = () => {
  return (
    <Container fluid>
      <PageBreadcrumb title="Templates" subtitle="Browse and use templates" />
      <TemplatesList />
    </Container>
  );
};

export default withReducer('templatesApp', reducer)(Templates);

