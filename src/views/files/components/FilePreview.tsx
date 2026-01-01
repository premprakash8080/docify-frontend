import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router';
import { Button, Card, CardBody, Navbar, Offcanvas } from 'react-bootstrap';
import { TbMenu2, TbDownload, TbTrash, TbFileText } from 'react-icons/tb';
import { selectFileById } from '../store/filesSlice';
import fileService from '../services/file.service';
import apiConfig from '@/configs/apiConfig';
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
  const routeParams = useParams();
  const file = useSelector((state: any) => selectFileById(state, routeParams.id));
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (file?.id) {
      setLoading(true);
      setError(null);
      fileService
        .getFileById(file.id)
        .then((response) => {
          const fileData = response.data?.data || response.data;
          // If the API returns a URL, use it; otherwise construct it
          if (fileData.url || fileData.file_url) {
            setFileUrl(fileData.url || fileData.file_url);
          } else if (fileData.id) {
            // Construct file URL from API base and file ID
            const apiBase = apiConfig.baseURL;
            setFileUrl(`${apiBase}/files/${fileData.id}/download`);
          }
          setLoading(false);
        })
        .catch((err: any) => {
          setError('Failed to load file');
          setLoading(false);
        });
    } else {
      setFileUrl(null);
      setLoading(false);
      setError(null);
    }
  }, [file?.id]);

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
          <Button variant="link" className="p-2">
            <TbDownload size={20} />
          </Button>
          <Button variant="link" className="p-2 text-danger">
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
            <p className="text-danger mb-0">{error}</p>
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

