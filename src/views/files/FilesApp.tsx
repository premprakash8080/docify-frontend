import { createContext, useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Outlet, useLocation } from 'react-router';
import { Offcanvas } from 'react-bootstrap';
import withReducer from '@/store/withReducer';
import FilesList from './components/FilesList';
import reducer from './store';
import { fetchFiles } from './store/filesSlice';
import type { AppDispatch } from '@/store/types';

const drawerWidth = 400;
const MOBILE_BREAKPOINT = 992;

interface FilesAppContextType {
  setMainSidebarOpen: (open: boolean) => void;
}

export const FilesAppContext = createContext<FilesAppContextType>({
  setMainSidebarOpen: () => {},
});

function FilesApp() {
  const dispatch: AppDispatch = useDispatch();
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < MOBILE_BREAKPOINT);
  // Initialize sidebar as closed on mobile, will be controlled by user interaction only
  const [mainSidebarOpen, setMainSidebarOpen] = useState(false);

  // Fetch files on mount
  useEffect(() => {
    dispatch(fetchFiles());
  }, [dispatch]);

  // Handle window resize with debouncing
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const newIsMobile = window.innerWidth < MOBILE_BREAKPOINT;
        setIsMobile(newIsMobile);
        // Close sidebar when switching to mobile
        if (newIsMobile) {
          setMainSidebarOpen(false);
        }
      }, 150);
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, []);

  // Close sidebar on mobile when route changes
  useEffect(() => {
    if (isMobile) {
      setMainSidebarOpen(false);
    }
  }, [location.pathname, isMobile]);

  const contextValue = useMemo(
    () => ({
      setMainSidebarOpen,
    }),
    []
  );

  return (
    <FilesAppContext.Provider value={contextValue}>
      <div className="d-flex h-100" style={{ overflow: 'hidden' }}>
        {/* Files List Sidebar - Hidden on mobile, visible on desktop */}
        <div
          className="d-none d-lg-flex flex-shrink-0 border-end"
          style={{ width: `${drawerWidth}px` }}
        >
          <FilesList />
        </div>

        {/* Mobile Offcanvas - Only render on mobile to prevent backdrop flash */}
        {isMobile && (
          <Offcanvas
            show={mainSidebarOpen}
            onHide={() => setMainSidebarOpen(false)}
            placement="start"
            backdrop={true}
            backdropClassName="offcanvas-backdrop"
            style={{ width: `${drawerWidth}px` }}
          >
            <Offcanvas.Header closeButton>
              <Offcanvas.Title>Files</Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body className="p-0">
              <FilesList />
            </Offcanvas.Body>
          </Offcanvas>
        )}

        {/* Main Content Area - File Preview */}
        <div className="d-flex flex-column flex-grow-1 h-100" style={{ minWidth: 0 }}>
          <Outlet />
        </div>
      </div>
    </FilesAppContext.Provider>
  );
}

export default withReducer('filesApp', reducer)(FilesApp);

