import { Link, useParams } from 'react-router';
import { format } from 'date-fns';
import { ListGroup } from 'react-bootstrap';
import {
  TbFileText,
  TbPhoto,
  TbFile,
  TbTable,
  TbArchive,
} from 'react-icons/tb';
import type { File } from '../types';
import { formatBytes } from '@/helpers/file';

interface FileListItemProps {
  file: File;
  isLast?: boolean;
}

const getFileIcon = (filename?: string): React.ReactNode => {
  const ext = filename?.split('.').pop()?.toLowerCase() || '';
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(ext)) {
    return <TbPhoto size={20} />;
  }
  if (['pdf'].includes(ext)) {
    return <TbFileText size={20} />;
  }
  if (['doc', 'docx'].includes(ext)) {
    return <TbFile size={20} />;
  }
  if (['xls', 'xlsx'].includes(ext)) {
    return <TbTable size={20} />;
  }
  if (['zip', 'rar', '7z'].includes(ext)) {
    return <TbArchive size={20} />;
  }
  return <TbFileText size={20} />;
};

function FileListItem({ file, isLast }: FileListItemProps) {
  const routeParams = useParams();
  const isActive = routeParams.id ? String(routeParams.id) === String(file.id) : false;

  return (
    <ListGroup.Item
      as={Link}
      to={`/files/${file.id}`}
      action
      active={isActive}
      className={`px-4 py-3 ${isLast ? '' : 'border-bottom'}`}
      style={{
        textDecoration: 'none',
        minHeight: '80px',
      }}
    >
      <div className="d-flex align-items-center gap-3">
        <div className="flex-shrink-0 avatar-md bg-light bg-opacity-50 text-muted rounded-2 d-flex align-items-center justify-content-center">
          <span className="avatar-title">
            {getFileIcon(file.filename || file.name)}
          </span>
        </div>

        <div className="flex-grow-1 min-w-0">
          <h6 className="mb-1 fw-semibold text-truncate" style={{ fontSize: '14px' }}>
            {file.filename || file.name || 'Untitled File'}
          </h6>
          <p className="text-muted mb-1 small text-truncate" style={{ fontSize: '12px' }}>
            {file.description || 'No description'}
          </p>
          <p className="text-muted mb-0 small" style={{ fontSize: '12px' }}>
            {file.size ? formatBytes(file.size) : ''}
            {file.size && file.created_at ? ' • ' : ''}
            {file.created_at
              ? format(new Date(file.created_at), 'MMM dd, yyyy')
              : ''}
          </p>
        </div>
      </div>
    </ListGroup.Item>
  );
}

export default FileListItem;

