import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useAppDispatch } from '@/store';
import withReducer from '../../store/withReducer';
import { Container } from 'react-bootstrap';
import PageBreadcrumb from '@/components/PageBreadcrumb';
import NotesSection from './components/NotesSection';
import ScratchPadSection from './components/ScratchPadSection';
import RecentlyCapturedSection from './components/RecentlyCapturedSection';
import reducer from './store';
import { fetchNotes, selectNotesItems, selectNotesLoading } from './store/notesSlice';
import { fetchNotebooks, selectNotebooksItems } from './store/notebooksSlice';

function DashboardHomePage() {
  const dispatch = useAppDispatch();
  const notes = useSelector(selectNotesItems);
  const notebooks = useSelector(selectNotebooksItems);
  const loading = useSelector(selectNotesLoading);

  useEffect(() => {
    dispatch(fetchNotes({ archived: false, trashed: false }));
    dispatch(fetchNotebooks({ archived: false, trashed: false }));
  }, [dispatch]);

  return (
    <Container fluid>
      <PageBreadcrumb title="Dashboard" subtitle="Home" />

      <div className="row g-3">
        <div className="col-xl-6">
          <NotesSection notebooks={notebooks} />
        </div>
        <div className="col-xl-6">
          <ScratchPadSection />
        </div>
      </div>

      <div className="row g-3 mt-3">
        <div className="col-12">
          <RecentlyCapturedSection />
        </div>
      </div>
    </Container>
  );
}

export default withReducer('notesApp', reducer)(DashboardHomePage);
