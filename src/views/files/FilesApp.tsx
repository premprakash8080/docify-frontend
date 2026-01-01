import { createContext, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Outlet, useLocation } from 'react-router';
import { Col, Container, Offcanvas, Row } from 'react-bootstrap';
import withReducer from '@/store/withReducer';
import FilesList from './components/FilesList';
import reducer from './store';
import { fetchFiles } from './store/filesSlice';
import type { AppDispatch } from '@/store/types';

const drawerWidth = 400;

interface FilesAppContextType {
  setMainSidebarOpen: (open: boolean) => void;
}

export const FilesAppContext = createContext<FilesAppContextType>({
  setMainSidebarOpen: () => {},
});

function FilesApp() {
  const dispatch: AppDispatch = useDispatch();
  const location = useLocation();
  const [mainSidebarOpen, setMainSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 992); // lg breakpoint

  useEffect(() => {
    dispatch(fetchFiles());
  }, [dispatch]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 992);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!isMobile) {
      setMainSidebarOpen(true);
    } else {
      setMainSidebarOpen(false);
    }
  }, [isMobile]);

  useEffect(() => {
    if (isMobile) {
      setMainSidebarOpen(false);
    }
  }, [location, isMobile]);

  return (
    <FilesAppContext.Provider value={{ setMainSidebarOpen }}>
      <Container fluid className="h-100 p-0">
        <Row className="g-0 h-100">
          {/* Sidebar - Offcanvas on mobile, always visible on desktop */}
          <Col
            lg={4}
            xl={3}
            className={`d-none d-lg-block p-0 border-end`}
            style={{ width: `${drawerWidth}px`, maxWidth: `${drawerWidth}px` }}
          >
            <div className="h-100" style={{ overflow: 'hidden' }}>
              <FilesList />
            </div>
          </Col>

          {/* Mobile Offcanvas */}
          <Offcanvas
            show={mainSidebarOpen}
            onHide={() => setMainSidebarOpen(false)}
            placement="start"
            className="d-lg-none"
            style={{ width: `${drawerWidth}px` }}
          >
            <Offcanvas.Header closeButton>
              <Offcanvas.Title>Files</Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body className="p-0">
              <FilesList />
            </Offcanvas.Body>
          </Offcanvas>

          {/* Main Content */}
          <Col lg={8} xl={9} className="d-flex flex-column h-100">
            <Outlet />
          </Col>
        </Row>
      </Container>
    </FilesAppContext.Provider>
  );
}

export default withReducer('filesApp', reducer)(FilesApp);

