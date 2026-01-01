import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import FuseLoading from '@fuse/core/FuseLoading';
import { format } from 'date-fns';
import {
  fetchStacks,
  fetchNotebooks,
  fetchNotebookNotes,
  toggleStackExpanded,
  toggleNotebookExpanded,
  selectStacks,
  selectStandaloneNotebooks,
  selectNotebooksLoading,
  selectExpandedStacks,
  selectExpandedNotebooks,
} from '../store/notebooksSlice';
import StackActionsMenu from './StackActionsMenu';
import NotebookActionsMenu from './NotebookActionsMenu';
import NoteActionsMenu from './NoteActionsMenu';

const StyledTableRow = styled(TableRow)(({ theme, level }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: level === 0 ? 'transparent' : theme.palette.action.hover,
  },
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

const IndentedCell = styled(TableCell)(({ level }) => ({
  paddingLeft: `${16 + level * 32}px !important`,
}));

function StackRow({ stack }) {
  const dispatch = useDispatch();
  const expandedStacks = useSelector(selectExpandedStacks);
  const expandedNotebooks = useSelector(selectExpandedNotebooks);
  const isExpanded = expandedStacks[stack.id] || false;
  const notebooks = stack.notebooks || [];

  const handleToggle = () => {
    dispatch(toggleStackExpanded(stack.id));
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), 'dd MMM');
    } catch {
      return '-';
    }
  };

  return (
    <>
      <StyledTableRow level={0}>
        <TableCell>
          <IconButton aria-label="expand row" size="small" onClick={handleToggle}>
            <FuseSvgIcon size={20}>
              {isExpanded ? 'heroicons-outline:chevron-down' : 'heroicons-outline:chevron-right'}
            </FuseSvgIcon>
          </IconButton>
        </TableCell>
        <IndentedCell level={0}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FuseSvgIcon size={20} color="primary">
              heroicons-outline:folder
            </FuseSvgIcon>
            <Typography variant="body2" fontWeight="medium">
              {stack.name || 'Untitled Stack'}
            </Typography>
            {notebooks.length > 0 && (
              <Typography variant="caption" color="text.secondary">
                {notebooks.length}
              </Typography>
            )}
          </Box>
        </IndentedCell>
        <TableCell>-</TableCell>
        <TableCell>{stack.created_by || '-'}</TableCell>
        <TableCell>{formatDate(stack.updated_at)}</TableCell>
        <TableCell>-</TableCell>
        <TableCell align="right" sx={{ width: 80, minWidth: 80, padding: '8px !important' }}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
            <StackActionsMenu
              stack={stack}
              trigger={
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={
                    <FuseSvgIcon size={20} color="action">
                      heroicons-outline:view-list
                    </FuseSvgIcon>
                  }
                  sx={{ minWidth: 'auto', padding: '4px 8px' }}
                />
              }
            />
          </Box>
        </TableCell>
      </StyledTableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              {notebooks.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ pl: 4, py: 2 }}>
                  No notebooks in this stack
                </Typography>
              ) : (
                notebooks.map((notebook) => (
                  <NotebookRow key={notebook.id} notebook={notebook} level={1} />
                ))
              )}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

function NotebookRow({ notebook, level = 0 }) {
  const dispatch = useDispatch();
  const expandedNotebooks = useSelector(selectExpandedNotebooks);
  const isExpanded = expandedNotebooks[notebook.id] || false;
  const notes = notebook.notes || [];

  const handleToggle = async () => {
    if (!isExpanded && (!notes || notes.length === 0)) {
      // Fetch notes when expanding for the first time
      await dispatch(fetchNotebookNotes(notebook.id));
    }
    dispatch(toggleNotebookExpanded(notebook.id));
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), 'dd MMM');
    } catch {
      return '-';
    }
  };

  return (
    <>
      <StyledTableRow level={level}>
        <TableCell>
          <IconButton aria-label="expand row" size="small" onClick={handleToggle}>
            <FuseSvgIcon size={20}>
              {isExpanded ? 'heroicons-outline:chevron-down' : 'heroicons-outline:chevron-right'}
            </FuseSvgIcon>
          </IconButton>
        </TableCell>
        <IndentedCell level={level}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FuseSvgIcon size={20} color="action">
              heroicons-outline:document-text
            </FuseSvgIcon>
            <Typography variant="body2">{notebook.name || 'Untitled Notebook'}</Typography>
            {notes.length > 0 && (
              <Typography variant="caption" color="text.secondary">
                {notes.length}
              </Typography>
            )}
          </Box>
        </IndentedCell>
        <TableCell>--</TableCell>
        <TableCell>{notebook.created_by || '-'}</TableCell>
        <TableCell>{formatDate(notebook.updated_at)}</TableCell>
        <TableCell>Only you</TableCell>
        <TableCell align="right" sx={{ width: 80, minWidth: 80, padding: '8px !important' }}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
            <NotebookActionsMenu
              notebook={notebook}
              trigger={
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={
                    <FuseSvgIcon size={20} color="action">
                      heroicons-outline:view-list
                    </FuseSvgIcon>
                  }
                  sx={{ minWidth: 'auto', padding: '4px 8px' }}
                />
              }
            />
          </Box>
        </TableCell>
      </StyledTableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1, ml: 4 }}>
              {notes.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                  No notes in this notebook
                </Typography>
              ) : (
                notes.map((note) => <NoteRow key={note.id} note={note} level={2} />)
              )}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

function NoteRow({ note, level = 2 }) {
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), 'dd MMM');
    } catch {
      return '-';
    }
  };

  return (
    <StyledTableRow level={level}>
      <TableCell />
      <IndentedCell level={level}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FuseSvgIcon size={20} color="action">
            heroicons-outline:document
          </FuseSvgIcon>
          <Typography variant="body2" noWrap sx={{ maxWidth: 400 }}>
            {note.title || 'Untitled'}
          </Typography>
        </Box>
      </IndentedCell>
      <TableCell>--</TableCell>
      <TableCell>{note.created_by || '-'}</TableCell>
      <TableCell>{formatDate(note.updated_at)}</TableCell>
      <TableCell>Only you</TableCell>
      <TableCell align="right" sx={{ width: 80, minWidth: 80, padding: '8px !important' }}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
          <NoteActionsMenu
            note={note}
            trigger={
              <Button
                variant="outlined"
                size="small"
                startIcon={
                  <FuseSvgIcon size={20} color="action">
                    heroicons-outline:view-list
                  </FuseSvgIcon>
                }
                sx={{ minWidth: 'auto', padding: '4px 8px' }}
              />
            }
          />
        </Box>
      </TableCell>
    </StyledTableRow>
  );
}

export default function NotebooksTable() {
  const dispatch = useDispatch();
  const stacks = useSelector(selectStacks);
  const standaloneNotebooks = useSelector(selectStandaloneNotebooks);
  const loading = useSelector(selectNotebooksLoading);
  const searchText = useSelector((state) => state.notebooksApp?.notebooks?.searchText || '');

  useEffect(() => {
    dispatch(fetchStacks());
    dispatch(fetchNotebooks({ archived: false, trashed: false }));
  }, [dispatch]);

  const filteredStacks = useMemo(() => {
    if (!searchText) return stacks;
    const lowerSearch = searchText.toLowerCase();
    return stacks
      .map((stack) => {
        const matchesStack = stack.name?.toLowerCase().includes(lowerSearch);
        const filteredNotebooks =
          stack.notebooks?.filter((nb) => nb.name?.toLowerCase().includes(lowerSearch)) || [];
        if (matchesStack || filteredNotebooks.length > 0) {
          return { ...stack, notebooks: matchesStack ? stack.notebooks : filteredNotebooks };
        }
        return null;
      })
      .filter(Boolean);
  }, [stacks, searchText]);

  const filteredStandaloneNotebooks = useMemo(() => {
    if (!searchText) return standaloneNotebooks;
    const lowerSearch = searchText.toLowerCase();
    return standaloneNotebooks.filter((nb) => nb.name?.toLowerCase().includes(lowerSearch));
  }, [standaloneNotebooks, searchText]);

  if (loading && stacks.length === 0 && standaloneNotebooks.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <FuseLoading />
      </Box>
    );
  }

  return (
    <TableContainer
      component={Paper}
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Table aria-label="notebooks table" sx={{ width: '100%' }}>
        <TableHead>
          <TableRow>
            <TableCell />
            <TableCell>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                Title
                <FuseSvgIcon size={16}>heroicons-outline:chevron-up</FuseSvgIcon>
              </Box>
            </TableCell>
            <TableCell>Space</TableCell>
            <TableCell>Created by</TableCell>
            <TableCell>Updated</TableCell>
            <TableCell>Shared with</TableCell>
            <TableCell align="right" sx={{ width: 80, minWidth: 80 }}>
              Actions
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredStacks.map((stack) => (
            <StackRow key={stack.id} stack={stack} />
          ))}
          {filteredStandaloneNotebooks.map((notebook) => (
            <NotebookRow key={notebook.id} notebook={notebook} level={0} />
          ))}
          {filteredStacks.length === 0 && filteredStandaloneNotebooks.length === 0 && !loading && (
            <TableRow>
              <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                <Typography variant="body2" color="text.secondary">
                  No notebooks found
                </Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
