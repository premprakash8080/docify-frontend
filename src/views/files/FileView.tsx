import { useContext } from 'react';
import { useParams } from 'react-router';
import FilePreview from './components/FilePreview';
import FilesFirstScreen from './components/FilesFirstScreen';
import { FilesAppContext } from './FilesApp';

function FileView() {
  const { setMainSidebarOpen } = useContext(FilesAppContext);
  const params = useParams();

  // Show first screen if no file ID is selected
  if (!params.id) {
    return <FilesFirstScreen />;
  }

  return <FilePreview setMainSidebarOpen={setMainSidebarOpen} />;
}

export default FileView;

