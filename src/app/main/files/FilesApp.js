import { styled } from '@mui/material/styles';
import withReducer from '../../store/withReducer';
import { createContext, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Outlet, useLocation } from 'react-router-dom';
import FusePageSimple from '@fuse/core/FusePageSimple';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';
import FilesList from './components/FilesList';
import reducer from './store';
import { fetchFiles } from './store/filesSlice';

const drawerWidth = 400;

export const FilesAppContext = createContext({});

const Root = styled(FusePageSimple)(({ theme }) => ({
  '& .FusePageSimple-content': {
    display: 'flex',
    flexDirection: 'column',
    flex: '1 1 100%',
    height: '100%',
  },
}));

function FilesApp(props) {
  const dispatch = useDispatch();
  const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));
  const [mainSidebarOpen, setMainSidebarOpen] = useState(!isMobile);
  const location = useLocation();

  useEffect(() => {
    dispatch(fetchFiles());
  }, [dispatch]);

  useEffect(() => {
    setMainSidebarOpen(!isMobile);
  }, [isMobile]);

  useEffect(() => {
    if (isMobile) {
      setMainSidebarOpen(false);
    }
  }, [location, isMobile]);

  return (
    <FilesAppContext.Provider value={{ setMainSidebarOpen }}>
      <Root
        content={<Outlet />}
        leftSidebarContent={<FilesList />}
        leftSidebarOpen={mainSidebarOpen}
        leftSidebarOnClose={() => {
          setMainSidebarOpen(false);
        }}
        leftSidebarWidth={drawerWidth}
        scroll="content"
      />
    </FilesAppContext.Provider>
  );
}

export default withReducer('filesApp', reducer)(FilesApp);

