import { Container } from 'react-bootstrap';
import withReducer from '@/store/withReducer';
import PageBreadcrumb from '@/components/PageBreadcrumb';
import reducer from './store';
import NotebooksTable from './components/NotebooksTable';
import NotebooksHeader from './components/NotebooksHeader';
import RenameStackDialog from './components/RenameStackDialog';
import DeleteStackDialog from './components/DeleteStackDialog';
import AddNotebookDialog from './components/AddNotebookDialog';
import RenameNotebookDialog from './components/RenameNotebookDialog';
import DeleteNotebookDialog from './components/DeleteNotebookDialog';
import MoveNotebookDialog from './components/MoveNotebookDialog';
import RenameNoteDialog from './components/RenameNoteDialog';
import DeleteNoteDialog from './components/DeleteNoteDialog';
import MoveNoteDialog from './components/MoveNoteDialog';

function NotebooksPage() {
  return (
    <Container fluid className="d-flex flex-column h-100 p-0">
      <NotebooksHeader />
      <div className="flex-grow-1 overflow-auto">
        <NotebooksTable />
      </div>
      <RenameStackDialog />
      <DeleteStackDialog />
      <AddNotebookDialog />
      <RenameNotebookDialog />
      <DeleteNotebookDialog />
      <MoveNotebookDialog />
      <RenameNoteDialog />
      <DeleteNoteDialog />
      <MoveNoteDialog />
    </Container>
  );
}

export default withReducer('notebooksApp', reducer)(NotebooksPage);

