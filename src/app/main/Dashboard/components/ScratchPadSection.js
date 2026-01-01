import { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { styled } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { debounce } from 'lodash';
import { createNote } from '../store/notesSlice';

const Root = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
}));

const SectionHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: '12px',
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontSize: '18px',
  fontWeight: 600,
}));

const ScratchPadArea = styled(Paper)(({ theme }) => ({
  flex: 1,
  minHeight: '300px',
  padding: '16px',
  backgroundColor: theme.palette.mode === 'light' ? '#FFF9C4' : theme.palette.background.paper,
  borderRadius: '8px',
  border: `1px solid ${theme.palette.divider}`,
}));

const ScratchPadTextArea = styled('textarea')(({ theme }) => ({
  width: '100%',
  height: '100%',
  minHeight: '280px',
  border: 'none',
  outline: 'none',
  resize: 'none',
  fontFamily: theme.typography.fontFamily,
  fontSize: '16px',
  lineHeight: '1.6',
  color: theme.palette.text.primary,
  backgroundColor: 'transparent',
  padding: 0,
  '&::placeholder': {
    color: theme.palette.text.disabled,
  },
}));

function ScratchPadSection() {
  const dispatch = useDispatch();
  const [content, setContent] = useState('');
  const contentRef = useRef(null);
  const scratchPadNoteIdRef = useRef(null);

  useEffect(() => {
    if (!scratchPadNoteIdRef.current) {
      dispatch(createNote({ title: 'Scratch Pad' }))
        .unwrap()
        .then((note) => {
          scratchPadNoteIdRef.current = note.data?.id || note.id;
        })
        .catch((error) => {
          console.error('Failed to create scratch pad note:', error);
        });
    }
  }, [dispatch]);

  const debouncedSave = useRef(
    debounce(async (noteId, contentValue) => {
      if (noteId && contentValue !== undefined) {
        // TODO: Save content via API
        console.log('Saving scratch pad:', contentValue);
      }
    }, 1000)
  ).current;

  const handleContentChange = (event) => {
    const newContent = event.target.value;
    setContent(newContent);
    if (scratchPadNoteIdRef.current) {
      debouncedSave(scratchPadNoteIdRef.current, newContent);
    }
  };

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.style.height = 'auto';
      contentRef.current.style.height = `${contentRef.current.scrollHeight}px`;
    }
  }, [content]);

  return (
    <Root>
      <SectionHeader>
        <SectionTitle>Scratch pad</SectionTitle>
        <div className="flex items-center space-x-4">
          <IconButton size="small">
            <FuseSvgIcon size={20}>heroicons-outline:document-plus</FuseSvgIcon>
          </IconButton>
          <IconButton size="small">
            <FuseSvgIcon size={20}>heroicons-outline:ellipsis-vertical</FuseSvgIcon>
          </IconButton>
        </div>
      </SectionHeader>
      <ScratchPadArea>
        <ScratchPadTextArea
          ref={contentRef}
          value={content}
          onChange={handleContentChange}
          placeholder="Start writing..."
        />
      </ScratchPadArea>
    </Root>
  );
}

export default ScratchPadSection;

