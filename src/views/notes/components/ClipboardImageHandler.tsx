import { useEffect, useState } from 'react';
import imageService from '../services/image.service';

interface ClipboardImageHandlerProps {
  editorRef: React.RefObject<any>;
  noteId?: string | null;
  onImageUploaded?: (imageUrl: string) => void;
  onImageError?: (error: string) => void;
}

/**
 * ClipboardImageHandler - Handles clipboard paste events for image upload
 * 
 * Detects image paste events (Cmd+V / Ctrl+V) and automatically uploads
 * images to the server, then inserts them into the Quill editor.
 */
const ClipboardImageHandler = ({
  editorRef,
  noteId,
  onImageUploaded,
  onImageError,
}: ClipboardImageHandlerProps) => {
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      // Check if editor is focused
      const activeElement = document.activeElement;
      if (!activeElement) return;

      // Check if paste is happening in a Quill editor
      const quillContainer = activeElement.closest('.ql-editor, .ql-container');
      if (!quillContainer) return;

      // Verify the editor ref matches
      if (!editorRef.current) return;

      const items = e.clipboardData?.items;
      if (!items) return;

      // Find image items in clipboard
      const imageItems: File[] = [];
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.indexOf('image') !== -1) {
          const file = item.getAsFile();
          if (file) {
            imageItems.push(file);
          }
        }
      }

      if (imageItems.length === 0) return;

      // Prevent default paste behavior for images
      e.preventDefault();
      e.stopPropagation();

      setUploading(true);

      try {
        // Upload all images with note_id if available
        const uploadPromises = imageItems.map((file) => 
          imageService.uploadImage(file, noteId || undefined, false)
        );
        const results = await Promise.all(uploadPromises);

        // Get Quill editor instance
        // react-quill-new exposes the editor via ref
        const quillEditor = editorRef.current?.getEditor?.() || editorRef.current?.quill;
        if (!quillEditor) {
          throw new Error('Quill editor not found');
        }

        // Get current selection or end of document
        const selection = quillEditor.getSelection();
        let insertIndex = selection ? selection.index : quillEditor.getLength();

        // Insert each uploaded image
        results.forEach((result) => {
          if (result.success && result.data) {
            // Use secure_url from API response, fallback to url for backward compatibility
            const imageUrl = result.data.secure_url || result.data.url;
            
            if (imageUrl) {
              // Insert image at current position
              quillEditor.insertEmbed(insertIndex, 'image', imageUrl, 'user');
              
              // Move cursor after image and update insert index for next image
              insertIndex += 1;
              quillEditor.setSelection(insertIndex, 0);
              
              onImageUploaded?.(imageUrl);
            }
          }
        });
      } catch (error: any) {
        console.error('Failed to upload image from clipboard:', error);
        const errorMessage = error.message || 'Failed to upload image';
        onImageError?.(errorMessage);
      } finally {
        setUploading(false);
      }
    };

    // Attach paste listener to document to catch all paste events
    // We'll filter by checking if the editor container is in focus
    document.addEventListener('paste', handlePaste, true);

    return () => {
      document.removeEventListener('paste', handlePaste, true);
    };
  }, [editorRef, noteId, onImageUploaded, onImageError]);

  return (
    <>
      {uploading && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 10000,
            padding: '12px 16px',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            borderRadius: '6px',
            fontSize: '14px',
            pointerEvents: 'none',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          }}
        >
          Uploading image...
        </div>
      )}
    </>
  );
};

export default ClipboardImageHandler;

