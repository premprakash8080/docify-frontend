import { useState, useEffect, useRef } from 'react'
import {
    Card,
    Container,
    Offcanvas,
    Spinner
} from 'react-bootstrap'
import SimpleBar from "simplebar-react";
import PageBreadcrumb from '@/components/PageBreadcrumb'
import SideBar from './components/SideBar'
import NoteEditorHeader from './components/NoteEditorHeader'
import CustomQuill from '@/components/CustomQuill'
import ClipboardImageHandler from './components/ClipboardImageHandler'
import noteService from './services/note.service'
import type { Note } from './types'

// Custom image handler for deletion support
const setupImageHandler = (quill: any) => {
  if (!quill) return;

  // Handle image clicks for deletion
  quill.root.addEventListener('click', (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'IMG') {
      // Optional: Add delete functionality on image click
      // For now, we'll rely on the standard Quill image handling
    }
  });
};

const modules = {
  toolbar: [
    [{ font: [] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ color: [] }, { background: [] }],
    [{ script: 'super' }, { script: 'sub' }],
    [{ header: [false, 1, 2, 3, 4, 5, 6] }],
    ['blockquote', 'code-block'],
    [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
    [{ align: [] }],
    ['link', 'image', 'video'],
    ['clean'],
  ],
}

const Index = () => {
    const [show, setShow] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [lastSaved, setLastSaved] = useState<Date | null>(null)
    const [selectedNote, setSelectedNote] = useState<Note | null>(null)
    const [noteContent, setNoteContent] = useState<string>('')
    const [loadingContent, setLoadingContent] = useState(false)
    const quillRef = useRef<any>(null)

    useEffect(() => {
        const fetchNoteContent = async () => {
            if (selectedNote?.id) {
                setLoadingContent(true)
                try {
                    const note = await noteService.getNoteById(selectedNote.id, true)
                    // Extract content from nested structure
                    let contentText = ''
                    if (note.content) {
                        if (typeof note.content === 'string') {
                            contentText = note.content
                        } else if (typeof note.content === 'object' && 'content' in note.content) {
                            contentText = (note.content as { content: string }).content
                        }
                    }
                    setNoteContent(contentText)
                    setSelectedNote(note)
                } catch (error: any) {
                    console.error('Failed to load note content:', error)
                    setNoteContent('')
                } finally {
                    setLoadingContent(false)
                }
            } else {
                setNoteContent('')
            }
        }

        fetchNoteContent()
    }, [selectedNote?.id])

    const handleSave = async () => {
        if (!selectedNote?.id) return
        
        setIsSaving(true)
        try {
            await noteService.saveNoteContent(selectedNote.id, { content: noteContent })
            setLastSaved(new Date())
        } catch (error: any) {
            console.error('Failed to save note:', error)
        } finally {
            setIsSaving(false)
        }
    }

    const handleNoteClick = (note: Note) => {
        setSelectedNote(note)
    }

    return (
        <Container fluid>
            <PageBreadcrumb title="Notes" subtitle="Apps"/>

            <div className="outlook-box outlook-box-full gap-1">
                <Offcanvas responsive="lg" show={show} onHide={() => setShow(!show)}
                           className="outlook-left-menu outlook-left-menu-md"
                           style={{ width: '350px', minWidth: '350px' }}>
                    <SideBar onNoteClick={handleNoteClick} />
                </Offcanvas>

                <Card className="h-100 mb-0 rounded-0 flex-grow-1 border-0">
                    <NoteEditorHeader
                        note={selectedNote}
                        notebookName={selectedNote?.notebook_name || (selectedNote?.notebook_id ? 'My Notebook' : undefined)}
                        isSaving={isSaving}
                        lastSaved={lastSaved}
                        onHideSidebar={() => setShow(!show)}
                        onFullscreen={() => {
                            // TODO: Implement fullscreen
                            console.log('Toggle fullscreen')
                        }}
                        onSave={handleSave}
                        onShare={() => {
                            // TODO: Implement share
                            console.log('Share note')
                        }}
                        onLink={() => {
                            // TODO: Implement copy link
                            console.log('Copy link')
                        }}
                        onDuplicate={() => {
                            // TODO: Implement duplicate
                            console.log('Duplicate note')
                        }}
                        onPin={async () => {
                            if (!selectedNote?.id) return
                            try {
                                if (selectedNote.pinned) {
                                    await noteService.unpinNote(selectedNote.id)
                                } else {
                                    await noteService.pinNote(selectedNote.id)
                                }
                                // Refresh note data
                                const updatedNote = await noteService.getNoteById(selectedNote.id, true)
                                setSelectedNote(updatedNote)
                            } catch (error: any) {
                                console.error('Failed to toggle pin:', error)
                            }
                        }}
                        onArchive={() => {
                            // TODO: Implement archive/unarchive
                            console.log('Toggle archive')
                        }}
                        onExport={() => {
                            // TODO: Implement export
                            console.log('Export note')
                        }}
                        onManageTags={() => {
                            // TODO: Implement manage tags
                            console.log('Manage tags')
                        }}
                        onMove={() => {
                            // TODO: Implement move
                            console.log('Move note')
                        }}
                        onFindInNote={() => {
                            // TODO: Implement find in note
                            console.log('Find in note')
                        }}
                        onNoteInfo={() => {
                            // TODO: Implement note info
                            console.log('Note info')
                        }}
                        onNoteHistory={() => {
                            // TODO: Implement note history
                            console.log('Note history')
                        }}
                        onPrint={() => {
                            // TODO: Implement print
                            console.log('Print note')
                        }}
                        onDelete={() => {
                            // TODO: Implement delete
                            console.log('Delete note')
                        }}
                    />

                    <SimpleBar className="card-body" style={{height: 'calc(100% - 100px)'}} data-simplebar-md>
                        {!selectedNote ? (
                            <div className="d-flex align-items-center justify-content-center p-5">
                                <div className="text-center text-muted">
                                    <p className="mb-0">Select a note to edit</p>
                                </div>
                            </div>
                        ) : loadingContent ? (
                            <div className="d-flex align-items-center justify-content-center p-5">
                                <Spinner animation="border" className="text-primary" />
                            </div>
                        ) : (
                            <div style={{ minHeight: '100%', width: '100%', position: 'relative' }}>
                                <ClipboardImageHandler
                                    editorRef={quillRef}
                                    noteId={selectedNote?.id || null}
                                    onImageUploaded={(url) => {
                                        console.log('Image uploaded:', url);
                                    }}
                                    onImageError={(error) => {
                                        console.error('Image upload error:', error);
                                    }}
                                />
                                <CustomQuill
                                    ref={quillRef}
                                    theme="snow"
                                    modules={modules}
                                    value={noteContent}
                                    onChange={setNoteContent}
                                    onFocus={() => {
                                        // Setup image handler when editor is focused
                                        if (quillRef.current) {
                                            const quill = quillRef.current.getEditor?.() || quillRef.current.quill;
                                            if (quill) {
                                                setupImageHandler(quill);
                                            }
                                        }
                                    }}
                                />
                            </div>
                        )}
                    </SimpleBar>
                </Card>
            </div>
        </Container>
    )
}

export default Index

