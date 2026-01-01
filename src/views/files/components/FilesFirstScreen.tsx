import { useContext } from 'react';
import { TbFileText } from 'react-icons/tb';
import { FilesAppContext } from '../FilesApp';

const FilesFirstScreen = () => {
  const { setMainSidebarOpen } = useContext(FilesAppContext);

  return (
    <div
      className="d-flex flex-column flex-fill align-items-center justify-content-center w-100 p-5"
      style={{ minHeight: '100%' }}
    >
      <div className="mb-4" style={{ fontSize: '128px', color: 'var(--bs-secondary)' }}>
        <TbFileText />
      </div>
      <h4 className="d-none d-md-block fw-semibold text-secondary mb-2">Select a file to preview</h4>
      <p className="d-block d-md-none fw-medium text-secondary mb-0">Select a file to preview</p>
    </div>
  );
};

export default FilesFirstScreen;

