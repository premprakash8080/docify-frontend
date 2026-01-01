import { useContext } from 'react';
import FilePreview from './components/FilePreview';
import { FilesAppContext } from './FilesApp';

function FileView() {
  const { setMainSidebarOpen } = useContext(FilesAppContext);

  return <FilePreview setMainSidebarOpen={setMainSidebarOpen} />;
}

export default FileView;

