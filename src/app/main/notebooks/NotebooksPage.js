import { styled } from '@mui/material/styles';
import FusePageSimple from '@fuse/core/FusePageSimple';
import withReducer from '../../store/withReducer';
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

const Root = styled(FusePageSimple)(({ theme }) => ({
  '& .FusePageSimple-header': {
    backgroundColor: theme.palette.background.paper,
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  '& .FusePageSimple-content': {
    padding: 0,
  },
}));

function NotebooksPage() {
  return (
    <>
      <Root
        header={<NotebooksHeader />}
        content={
          <div className="flex flex-col w-full h-full">
            <NotebooksTable />
          </div>
        }
      />
      <RenameStackDialog />
      <DeleteStackDialog />
      <AddNotebookDialog />
      <RenameNotebookDialog />
      <DeleteNotebookDialog />
      <MoveNotebookDialog />
      <RenameNoteDialog />
      <DeleteNoteDialog />
      <MoveNoteDialog />
    </>
  );
}

export default withReducer('notebooksApp', reducer)(NotebooksPage);
