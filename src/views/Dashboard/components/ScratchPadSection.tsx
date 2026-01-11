import { useState, useEffect, useRef, ChangeEvent } from 'react';
import { Card, CardBody, CardHeader } from 'react-bootstrap';
import { TbDotsVertical, TbPlus } from 'react-icons/tb';
import noteService from '../services/note.service';
import { useNotificationContext } from '@/context/useNotificationContext';

function ScratchPadSection() {
  const { showNotification } = useNotificationContext();
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const isInitialLoadRef = useRef(true);

  // Load scratch pad content on mount
  useEffect(() => {
    const loadScratchpad = async () => {
      try {
        setLoading(true);
        const response = await noteService.getScratchpad(false);
        setContent(response.data.content || '');
      } catch (error: any) {
        console.error('Failed to load scratch pad:', error);
        showNotification({
          message: error.msg || error.message || 'Failed to load scratch pad',
          variant: 'danger',
          title: 'Load Error'
        });
      } finally {
        setLoading(false);
        isInitialLoadRef.current = false;
      }
    };

    loadScratchpad();
  }, [showNotification]);

  // Save scratch pad content on blur
  const handleBlur = async () => {
    // Don't save on initial load blur
    if (isInitialLoadRef.current) {
      return;
    }

    try {
      setSaving(true);
      await noteService.updateScratchpad(content, false);
      // Optionally show a subtle success notification
    } catch (error: any) {
      console.error('Failed to save scratch pad:', error);
      showNotification({
        message: error.msg || error.message || 'Failed to save scratch pad',
        variant: 'danger',
        title: 'Save Error'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleContentChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = event.target.value;
    setContent(newContent);
  };

  // Auto-resize textarea
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
        {loading ? (
          <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '300px' }}>
            <div className="spinner-border spinner-border-sm text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : (
          <>
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
              onBlur={handleBlur}
              placeholder="Start writing..."
              disabled={saving}
            />
            {saving && (
              <div className="text-muted small mt-2">
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Saving...
              </div>
            )}
          </>
        )}
      </CardBody>
    </Card>
  );
}

export default ScratchPadSection;
