import { useState, useEffect, useRef, ChangeEvent } from 'react';
import { useAppDispatch } from '@/store';
import { Card, CardBody, CardHeader } from 'react-bootstrap';
import { TbDotsVertical, TbPlus } from 'react-icons/tb';
import { debounce } from 'lodash';
import { createNote } from '../store/notesSlice';
import type { Note } from '../types';

function ScratchPadSection() {
  const dispatch = useAppDispatch();
  const [content, setContent] = useState<string>('');
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const scratchPadNoteIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!scratchPadNoteIdRef.current) {
      dispatch(createNote({ title: 'Scratch Pad' }))
        .unwrap()
        .then((note) => {
          const noteId = (note as any)?.data?.note?.id || (note as Note)?.id;
          if (noteId) {
            scratchPadNoteIdRef.current = noteId;
          }
        })
        .catch((error) => {
          console.error('Failed to create scratch pad note:', error);
        });
    }
  }, [dispatch]);

  const debouncedSave = useRef(
    debounce(async (noteId: string, contentValue: string) => {
      if (noteId && contentValue !== undefined) {
        console.log('Saving scratch pad:', contentValue);
      }
    }, 1000)
  ).current;

  const handleContentChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
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
    <Card className="h-100">
      <CardHeader className="d-flex align-items-center justify-content-between">
        <h5 className="mb-0">Scratch pad</h5>
        <div className="d-flex align-items-center gap-2">
          <button type="button" className="btn btn-icon btn-sm btn-link">
            <TbPlus className="fs-lg" />
          </button>
          <button type="button" className="btn btn-icon btn-sm btn-link">
            <TbDotsVertical className="fs-lg" />
          </button>
        </div>
      </CardHeader>
      <CardBody>
        <textarea
          ref={contentRef}
          className="form-control border-0 bg-light"
          style={{
            minHeight: '300px',
            resize: 'none',
            fontFamily: 'inherit',
            fontSize: '16px',
            lineHeight: '1.6',
          }}
          value={content}
          onChange={handleContentChange}
          placeholder="Start writing..."
        />
      </CardBody>
    </Card>
  );
}

export default ScratchPadSection;
