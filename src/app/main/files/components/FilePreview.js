import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import Toolbar from '@mui/material/Toolbar';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import FuseLoading from '@fuse/core/FuseLoading';
import { selectFileById } from '../store/filesSlice';
import fileService from '../services/file.service';
import { lighten } from '@mui/material/styles';

const Root = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  backgroundColor: theme.palette.background.default,
}));

const PreviewContainer = styled(Paper)(({ theme }) => ({
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  margin: '16px',
  padding: '24px',
  backgroundColor: theme.palette.background.paper,
  overflow: 'auto',
}));

const ImagePreview = styled('img')({
  maxWidth: '100%',
  maxHeight: '100%',
  objectFit: 'contain',
});

const DocumentPreview = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '48px',
  textAlign: 'center',
}));

function FilePreview(props) {
  const { setMainSidebarOpen } = props;
  const routeParams = useParams();
  const file = useSelector((state) => selectFileById(state, routeParams.id));
  const [fileUrl, setFileUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Move helper functions outside conditional - they don't use hooks
  const isImage = (fileToCheck) => {
    if (!fileToCheck) return false;
    const filename = fileToCheck.filename || fileToCheck.name || '';
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(ext);
  };

  const isDocument = (fileToCheck) => {
    if (!fileToCheck) return false;
    const filename = fileToCheck.filename || fileToCheck.name || '';
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    return ['pdf', 'doc', 'docx', 'txt', 'rtf'].includes(ext);
  };

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
            const apiBase = 'http://77.37.62.160:3012/api';
            setFileUrl(`${apiBase}/files/${fileData.id}/download`);
          }
          setLoading(false);
        })
        .catch((err) => {
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
      <Root>
        <div className="flex flex-col flex-1 items-center justify-center w-full p-24">
          <FuseSvgIcon className="icon-size-128 mb-16" color="disabled">
            heroicons-outline:document
          </FuseSvgIcon>
          <Typography className="text-20 font-semibold tracking-tight text-secondary" color="text.secondary">
            Select a file to preview
          </Typography>
        </div>
      </Root>
    );
  }

  return (
    <Root>
      <Toolbar
        className="border-b-1"
        sx={{
          backgroundColor: (theme) =>
            theme.palette.mode === 'light'
              ? lighten(theme.palette.background.default, 0.4)
              : lighten(theme.palette.background.default, 0.02),
        }}
      >
        <IconButton
          className="md:hidden"
          onClick={() => setMainSidebarOpen(true)}
          size="large"
        >
          <FuseSvgIcon>heroicons-outline:menu</FuseSvgIcon>
        </IconButton>
        <Typography className="flex-1 px-16 font-semibold text-16" variant="h6">
          {file.filename || file.name || 'Untitled File'}
        </Typography>
        <IconButton size="large">
          <FuseSvgIcon>heroicons-outline:arrow-down-tray</FuseSvgIcon>
        </IconButton>
        <IconButton size="large">
          <FuseSvgIcon>heroicons-outline:trash</FuseSvgIcon>
        </IconButton>
      </Toolbar>

      <PreviewContainer>
        {loading ? (
          <FuseLoading />
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : isImage(file) && fileUrl ? (
          <ImagePreview src={fileUrl} alt={file.filename || file.name} />
        ) : isDocument(file) && fileUrl ? (
          <Box sx={{ width: '100%', height: '100%' }}>
            <iframe
              src={fileUrl}
              title={file.filename || file.name}
              style={{ width: '100%', height: '100%', border: 'none' }}
            />
          </Box>
        ) : (
          <DocumentPreview>
            <FuseSvgIcon className="icon-size-128 mb-16" color="disabled">
              heroicons-outline:document
            </FuseSvgIcon>
            <Typography variant="h6" className="mb-8">
              {file.filename || file.name || 'Untitled File'}
            </Typography>
            <Typography variant="body2" color="text.secondary" className="mb-16">
              {file.description || 'No description available'}
            </Typography>
            {fileUrl && (
              <a href={fileUrl} download target="_blank" rel="noopener noreferrer">
                <IconButton color="primary" size="large">
                  <FuseSvgIcon>heroicons-outline:arrow-down-tray</FuseSvgIcon>
                </IconButton>
              </a>
            )}
            <Typography variant="caption" color="text.secondary">
              Preview not available for this file type. Click to download.
            </Typography>
          </DocumentPreview>
        )}
      </PreviewContainer>
    </Root>
  );
}

export default FilePreview;

