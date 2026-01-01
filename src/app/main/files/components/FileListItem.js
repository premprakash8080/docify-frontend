import { styled } from '@mui/material/styles';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import format from 'date-fns/format';
import { useParams } from 'react-router-dom';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import NavLinkAdapter from '@fuse/core/NavLinkAdapter';
import Avatar from '@mui/material/Avatar';
import { Box } from '@mui/system';

const StyledListItem = styled(ListItem)(({ theme, active }) => ({
  '&.active': {
    backgroundColor: theme.palette.background.default,
  },
}));

const getFileIcon = (filename) => {
  const ext = filename?.split('.').pop()?.toLowerCase() || '';
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) {
    return 'heroicons-outline:photo';
  }
  if (['pdf'].includes(ext)) {
    return 'heroicons-outline:document-text';
  }
  if (['doc', 'docx'].includes(ext)) {
    return 'heroicons-outline:document';
  }
  if (['xls', 'xlsx'].includes(ext)) {
    return 'heroicons-outline:table-cells';
  }
  if (['zip', 'rar', '7z'].includes(ext)) {
    return 'heroicons-outline:archive-box';
  }
  return 'heroicons-outline:document';
};

const formatFileSize = (bytes) => {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

function FileListItem(props) {
  const { file, isLast } = props;
  const routeParams = useParams();
  const isActive = routeParams.id === file.id?.toString();

  return (
    <StyledListItem
      button
      className="px-32 py-12 min-h-80"
      active={isActive ? 1 : 0}
      component={NavLinkAdapter}
      to={`/dashboard/files/${file.id}`}
      end
      activeClassName="active"
    >
      <Avatar
        sx={{
          width: 40,
          height: 40,
          backgroundColor: 'background.paper',
          color: 'text.secondary',
        }}
      >
        <FuseSvgIcon size={20}>{getFileIcon(file.filename || file.name)}</FuseSvgIcon>
      </Avatar>

      <ListItemText
        classes={{
          root: 'min-w-px px-16',
          primary: 'font-medium text-14 truncate',
          secondary: 'truncate text-12',
        }}
        primary={file.filename || file.name || 'Untitled File'}
        secondary={
          <Box className="flex flex-col">
            <Typography variant="caption" color="text.secondary">
              {file.description || 'No description'}
            </Typography>
            <Typography variant="caption" color="text.secondary" className="mt-4">
              {file.size ? formatFileSize(file.size) : ''} •{' '}
              {file.created_at ? format(new Date(file.created_at), 'MMM dd, yyyy') : ''}
            </Typography>
          </Box>
        }
      />
    </StyledListItem>
  );
}

export default FileListItem;

