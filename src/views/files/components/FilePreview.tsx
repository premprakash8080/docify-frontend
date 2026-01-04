import { useMemo, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router';
import { Button, Card, CardBody, Navbar } from 'react-bootstrap';
import { TbMenu2, TbDownload, TbTrash, TbFileText } from 'react-icons/tb';
import { selectFileById, fetchFiles } from '../store/filesSlice';
import { useDispatch } from 'react-redux';
import { deleteFile } from '../store/filesSlice';
import { useNavigate } from 'react-router';
import { useNotificationContext } from '@/context/useNotificationContext';
import fileService from '../services/file.service';
import type { AppDispatch } from '@/store/types';
import type { File } from '../types';

interface FilePreviewProps {
  setMainSidebarOpen: (open: boolean) => void;
}

const isImage = (file: File | undefined): boolean => {
  if (!file) return false;
  const filename = file.filename || file.name || '';
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(ext);
};

const isDocument = (file: File | undefined): boolean => {
  if (!file) return false;
  const filename = file.filename || file.name || '';
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  return ['pdf', 'doc', 'docx', 'txt', 'rtf'].includes(ext);
};

function FilePreview({ setMainSidebarOpen }: FilePreviewProps) {
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();
  const { showNotification } = useNotificationContext();
  const routeParams = useParams();
  const file = useSelector((state: { filesApp?: { files?: { items: File[] } } }) => 
    selectFileById(state, routeParams.id || '')
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileUrl = useMemo(() => {
    if (!file) return null;
    // Use firebase_storage_path if available, otherwise fallback to other URL fields
    return file.firebase_storage_path || file.url || file.file_url || null;
  }, [file]);

  // Fetch file if not in Redux store (e.g., direct navigation to file URL)
  useEffect(() => {
    if (routeParams.id && !file) {
      setLoading(true);
      setError(null);
      fileService
        .getFileById(routeParams.id)
        .then(() => {
          // File will be added to Redux after fetch, so just refresh the list
          dispatch(fetchFiles());
          setLoading(false);
        })
        .catch(() => {
          setError('File not found');
          setLoading(false);
        });
    }
  }, [routeParams.id, file, dispatch]);

  const handleDelete = async () => {
    if (!file?.id) return;
    
    if (window.confirm('Are you sure you want to delete this file?')) {
      setLoading(true);
      try {
        const result = await dispatch(deleteFile(file.id));
        if (result.type.endsWith('/fulfilled')) {
          showNotification({
            message: 'File deleted successfully',
            variant: 'success',
          });
          dispatch(fetchFiles());
          navigate('/files');
        } else {
          const errorMsg = result.payload as string || 'Failed to delete file';
          showNotification({
            message: errorMsg,
            variant: 'danger',
          });
        }
      } catch (err: any) {
        showNotification({
          message: err.message || 'An unexpected error occurred',
          variant: 'danger',
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDownload = () => {
    if (fileUrl) {
      window.open(fileUrl, '_blank');
    }
  };

  if (!file) {
    return (
      <div className="d-flex flex-column flex-fill align-items-center justify-content-center w-100 p-5">
        <div className="mb-4" style={{ fontSize: '128px', color: 'var(--bs-secondary)' }}>
          <TbFileText />
        </div>
        <h4 className="fw-semibold text-secondary">Select a file to preview</h4>
      </div>
    );
  }

  return (
    <div className="d-flex flex-column h-100" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
      <Navbar className="border-bottom bg-light bg-opacity-50">
        <div className="d-flex align-items-center w-100">
          <Button
            variant="link"
            className="d-md-none me-2"
            onClick={() => setMainSidebarOpen(true)}
          >
            <TbMenu2 size={20} />
          </Button>
          <h6 className="flex-fill px-3 fw-semibold mb-0" style={{ fontSize: '16px' }}>
            {file.filename || file.name || 'Untitled File'}
          </h6>
          <Button variant="link" className="p-2" onClick={handleDownload} disabled={!fileUrl || loading}>
            <TbDownload size={20} />
          </Button>
          <Button variant="link" className="p-2 text-danger" onClick={handleDelete} disabled={loading}>
            <TbTrash size={20} />
          </Button>
        </div>
      </Navbar>

      <Card className="flex-fill m-3">
        <CardBody className="d-flex align-items-center justify-content-center p-5" style={{ minHeight: '100%' }}>
          {loading ? (
            <div className="text-center">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : error ? (
            <div className="text-center">
              <p className="text-danger mb-3">{error}</p>
              {fileUrl && (
                <a href={fileUrl} download target="_blank" rel="noopener noreferrer" className="text-decoration-none">
                  <Button variant="primary">
                    <TbDownload className="me-1" />
                    Download
                  </Button>
                </a>
              )}
            </div>
          ) : isImage(file) && fileUrl ? (
            <img
              src={fileUrl}
              alt={file.filename || file.name}
              style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
            />
          ) : isDocument(file) && fileUrl ? (
            <iframe
              src={fileUrl}
              title={file.filename || file.name}
              style={{ width: '100%', height: '100%', border: 'none', minHeight: '600px' }}
            />
          ) : (
            <div className="text-center">
              <div className="mb-4" style={{ fontSize: '128px', color: 'var(--bs-secondary)' }}>
                <TbFileText />
              </div>
              <h5 className="mb-2">{file.filename || file.name || 'Untitled File'}</h5>
              <p className="text-muted mb-4">{file.description || 'No description available'}</p>
              {fileUrl && (
                <a href={fileUrl} download target="_blank" rel="noopener noreferrer" className="text-decoration-none">
                  <Button variant="primary">
                    <TbDownload className="me-1" />
                    Download
                  </Button>
                </a>
              )}
              <p className="text-muted mt-3 small mb-0">
                Preview not available for this file type. Click to download.
              </p>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

export default FilePreview;

