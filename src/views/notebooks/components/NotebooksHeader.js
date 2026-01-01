import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Input from '@mui/material/Input';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import {
  selectStacks,
  selectStandaloneNotebooks,
  openAddNotebookDialog,
  setSearchText,
} from '../store/notebooksSlice';

function NotebooksHeader() {
  const dispatch = useDispatch();
  const stacks = useSelector(selectStacks);
  const standaloneNotebooks = useSelector(selectStandaloneNotebooks);
  const searchText = useSelector((state) => state.notebooksApp?.notebooks?.searchText || '');
  const [filterAnchor, setFilterAnchor] = useState(null);
  const [sortAnchor, setSortAnchor] = useState(null);

  const totalNotebooks = stacks.reduce((sum, stack) => sum + (stack.notebooks?.length || 0), 0) + standaloneNotebooks.length;

  const handleNewNotebook = () => {
    dispatch(openAddNotebookDialog({ stack: null }));
  };

  const handleFilterClick = (event) => {
    setFilterAnchor(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchor(null);
  };

  const handleSortClick = (event) => {
    setSortAnchor(event.currentTarget);
  };

  const handleSortClose = () => {
    setSortAnchor(null);
  };

  return (
    <div className="flex flex-col sm:flex-row flex-1 w-full items-center justify-between py-12 px-24">
      <div className="flex items-center space-x-8">
        <Typography
          component={motion.span}
          initial={{ x: -20 }}
          animate={{ x: 0, transition: { delay: 0.2 } }}
          delay={300}
          className="text-24 md:text-32 font-extrabold tracking-tight"
        >
          Notebooks
        </Typography>
        <Typography variant="body2" color="text.secondary" className="text-16">
          {totalNotebooks}
        </Typography>
      </div>

      <div className="flex flex-1 items-center justify-end space-x-8 mt-12 sm:mt-0 w-full sm:w-auto">
        <Paper
          component={motion.div}
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1, transition: { delay: 0.2 } }}
          className="flex items-center w-full sm:max-w-256 space-x-8 px-16 rounded-full border-1 shadow-0"
        >
          <FuseSvgIcon color="disabled">heroicons-solid:search</FuseSvgIcon>
          <Input
            placeholder="Find Notebooks..."
            className="flex flex-1"
            disableUnderline
            fullWidth
            value={searchText}
            inputProps={{
              'aria-label': 'Search Notebooks',
            }}
            onChange={(ev) => dispatch(setSearchText(ev.target.value))}
          />
        </Paper>

        <IconButton onClick={handleSortClick} size="large">
          <FuseSvgIcon>heroicons-outline:arrows-up-down</FuseSvgIcon>
        </IconButton>
        <Menu anchorEl={sortAnchor} open={Boolean(sortAnchor)} onClose={handleSortClose}>
          <MenuItem onClick={handleSortClose}>
            <ListItemIcon className="min-w-40">
              <FuseSvgIcon>heroicons-outline:arrow-up</FuseSvgIcon>
            </ListItemIcon>
            <ListItemText primary="Title (A-Z)" />
          </MenuItem>
          <MenuItem onClick={handleSortClose}>
            <ListItemIcon className="min-w-40">
              <FuseSvgIcon>heroicons-outline:arrow-down</FuseSvgIcon>
            </ListItemIcon>
            <ListItemText primary="Title (Z-A)" />
          </MenuItem>
          <MenuItem onClick={handleSortClose}>
            <ListItemIcon className="min-w-40">
              <FuseSvgIcon>heroicons-outline:calendar</FuseSvgIcon>
            </ListItemIcon>
            <ListItemText primary="Date Updated" />
          </MenuItem>
        </Menu>

        <IconButton onClick={handleFilterClick} size="large">
          <FuseSvgIcon>heroicons-outline:funnel</FuseSvgIcon>
        </IconButton>
        <Menu anchorEl={filterAnchor} open={Boolean(filterAnchor)} onClose={handleFilterClose}>
          <MenuItem onClick={handleFilterClose}>
            <ListItemText primary="All Notebooks" />
          </MenuItem>
          <MenuItem onClick={handleFilterClose}>
            <ListItemText primary="In Stacks" />
          </MenuItem>
          <MenuItem onClick={handleFilterClose}>
            <ListItemText primary="Standalone" />
          </MenuItem>
        </Menu>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0, transition: { delay: 0.2 } }}
        >
          <Button
            variant="contained"
            color="primary"
            startIcon={<FuseSvgIcon>heroicons-outline:plus</FuseSvgIcon>}
            onClick={handleNewNotebook}
          >
            New Notebook
          </Button>
        </motion.div>
      </div>
    </div>
  );
}

export default NotebooksHeader;

