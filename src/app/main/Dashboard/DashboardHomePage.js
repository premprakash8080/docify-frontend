import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import withReducer from '../../store/withReducer';
import { styled } from '@mui/material/styles';
import NotesSection from './components/NotesSection';
import ScratchPadSection from './components/ScratchPadSection';
import RecentlyCapturedSection from './components/RecentlyCapturedSection';
import reducer from './store';
import { fetchNotes, selectNotesItems, selectNotesLoading } from './store/notesSlice';
import { fetchNotebooks, selectNotebooksItems } from './store/notebooksSlice';

const DashboardContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  gap: '24px',
  padding: '24px',
}));

const TopSection = styled('div')(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '24px',
  [theme.breakpoints.down('md')]: {
    gridTemplateColumns: '1fr',
  },
}));

function DashboardHomePage() {
  const dispatch = useDispatch();
  const notes = useSelector(selectNotesItems);
  const notebooks = useSelector(selectNotebooksItems);
  const loading = useSelector(selectNotesLoading);

  useEffect(() => {
    dispatch(fetchNotes({ archived: false, trashed: false }));
    dispatch(fetchNotebooks({ archived: false, trashed: false }));
  }, [dispatch]);

  return (
    <DashboardContainer>
      <TopSection>
        <NotesSection notes={notes} notebooks={notebooks} loading={loading} />
        <ScratchPadSection />
      </TopSection>
      <RecentlyCapturedSection />
    </DashboardContainer>
  );
}

export default withReducer('notesApp', reducer)(DashboardHomePage);

