import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { styled, alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemText from '@mui/material/ListItemText';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import {
  openRenameNotebookDialog,
  openDeleteNotebookDialog,
  openMoveNotebookDialog,
} from '../store/notebooksSlice';

const StyledMenu = styled((props) => (
  <Menu
    elevation={0}
    anchorOrigin={{
      vertical: 'bottom',
      horizontal: 'right',
    }}
    transformOrigin={{
      vertical: 'top',
      horizontal: 'right',
    }}
    {...props}
  />
))(({ theme }) => ({
  '& .MuiPaper-root': {
    borderRadius: 6,
    marginTop: theme.spacing(1),
    minWidth: 180,
    color: theme.palette.mode === 'light' ? 'rgb(55, 65, 81)' : theme.palette.grey[300],
    boxShadow:
      'rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px',
    '& .MuiMenu-list': {
      padding: '4px 0',
    },
    '& .MuiMenuItem-root': {
      '& svg, & .MuiSvgIcon-root': {
        fontSize: 18,
        color: theme.palette.text.secondary,
        marginRight: theme.spacing(1.5),
      },
      '&:active': {
        backgroundColor: alpha(theme.palette.primary.main, theme.palette.action.selectedOpacity),
      },
    },
  },
}));

function NotebookActionsMenu({ notebook, trigger }) {
  const dispatch = useDispatch();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleRename = () => {
    dispatch(openRenameNotebookDialog(notebook));
    handleClose();
  };

  const handleDelete = () => {
    dispatch(openDeleteNotebookDialog(notebook));
    handleClose();
  };

  const handleMoveToStack = () => {
    dispatch(openMoveNotebookDialog(notebook));
    handleClose();
  };

  const menuId = `notebook-menu-${notebook.id}`;
  const buttonId = `notebook-button-${notebook.id}`;

  const defaultTrigger = (
    <IconButton
      id={buttonId}
      aria-controls={open ? menuId : undefined}
      aria-haspopup="true"
      aria-expanded={open ? 'true' : undefined}
      size="small"
      onClick={handleClick}
      sx={{
        color: 'text.secondary',
        padding: '4px',
        '&:hover': {
          backgroundColor: 'action.hover',
          color: 'text.primary',
        },
      }}
    >
      <FuseSvgIcon size={24} color="action">
        heroicons-outline:ellipsis-vertical
      </FuseSvgIcon>
    </IconButton>
  );

  return (
    <>
      {trigger ? (
        <Box
          component="div"
          id={buttonId}
          aria-controls={open ? menuId : undefined}
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
          onClick={handleClick}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleClick(e);
            }
          }}
          role="button"
          tabIndex={0}
          sx={{ display: 'inline-block', cursor: 'pointer' }}
        >
          {trigger}
        </Box>
      ) : (
        defaultTrigger
      )}
      <StyledMenu
        id={menuId}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        onClick={(e) => e.stopPropagation()}
        MenuListProps={{
          'aria-labelledby': buttonId,
        }}
      >
        <MenuItem onClick={handleRename} disableRipple>
          <FuseSvgIcon>heroicons-outline:pencil</FuseSvgIcon>
          <ListItemText primary="Rename Notebook" />
        </MenuItem>
        <MenuItem onClick={handleMoveToStack} disableRipple>
          <FuseSvgIcon>heroicons-outline:arrow-right</FuseSvgIcon>
          <ListItemText primary="Move to Stack" />
        </MenuItem>
        <MenuItem onClick={handleDelete} disableRipple>
          <FuseSvgIcon>heroicons-outline:trash</FuseSvgIcon>
          <ListItemText primary="Delete Notebook" />
        </MenuItem>
      </StyledMenu>
    </>
  );
}

export default NotebookActionsMenu;
