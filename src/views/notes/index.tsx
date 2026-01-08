import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { useLocation, useParams } from 'react-router'
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
import { useNoteNavigation, handleRouteParams } from './utils/navigation'
import { useNotificationContext } from '@/context/useNotificationContext'
import type { Note, NoteResponse, NoteContent } from './types'
import './NotesEditor.css'

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
    const location = useLocation()
    const params = useParams()
    const { onNoteSelected, selectNote } = useNoteNavigation()
    const { showNotification } = useNotificationContext()
    
    const [show, setShow] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [lastSaved, setLastSaved] = useState<Date | null>(null)
    const [selectedNote, setSelectedNote] = useState<Note | null>(null)
    const [noteContent, setNoteContent] = useState<string>('')
    const [noteTitle, setNoteTitle] = useState<string>('')
    const [editorValue, setEditorValue] = useState<string>('')
    const [loadingContent, setLoadingContent] = useState(false)
    const quillRef = useRef<any>(null)
    const isUpdatingEditorRef = useRef(false)
    const titleSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    const selectedNoteRef = useRef<Note | null>(null)

    // Memoize context and params based on stable URL pathname - URL is single source of truth
    const context = useMemo(() => {
        const pathSegments = location.pathname.split('/').filter(Boolean);
        
        // Check for static routes first (priority)
        if (pathSegments[1] === 'dashboard') {
            return { routeType: 'dashboard' as const };
        }
        if (pathSegments[1] === 'new') {
            return { routeType: 'new' as const };
        }
        
        // Check for tag route
        if (pathSegments[1] === 'tags' && pathSegments[2]) {
            return { tagId: pathSegments[2], routeType: 'tag' as const };
        }
        
        // Check for stack routes (priority over notebook routes)
        const stackIndex = pathSegments.indexOf('stack');
        if (stackIndex !== -1) {
            const stackId = pathSegments[stackIndex + 1];
            const notebookIndex = pathSegments.indexOf('notebook', stackIndex);
            const noteIndex = pathSegments.indexOf('note', notebookIndex);
            
            if (notebookIndex !== -1 && noteIndex !== -1) {
                return {
                    stackId,
                    notebookId: pathSegments[notebookIndex + 1],
                    noteId: pathSegments[noteIndex + 1],
                    routeType: 'note' as const,
                };
            } else if (notebookIndex !== -1 && pathSegments[notebookIndex + 2] === 'notes') {
                return {
                    stackId,
                    notebookId: pathSegments[notebookIndex + 1],
                    routeType: 'notebook' as const,
                };
            } else if (pathSegments[stackIndex + 2] === 'notebooks') {
                return { stackId, routeType: 'stack' as const };
            }
        }
        
        // Check for notebook routes (only if not in stack)
        const notebookIndex = pathSegments.indexOf('notebook');
        if (notebookIndex !== -1 && stackIndex === -1) {
            const noteIndex = pathSegments.indexOf('note', notebookIndex);
            
            if (noteIndex !== -1) {
                return {
                    notebookId: pathSegments[notebookIndex + 1],
                    noteId: pathSegments[noteIndex + 1],
                    routeType: 'note' as const,
                };
            } else if (pathSegments[notebookIndex + 2] === 'notes') {
                return {
                    notebookId: pathSegments[notebookIndex + 1],
                    routeType: 'notebook' as const,
                };
            }
        }
        
        // Check for single note (no context)
        if (pathSegments.length === 2 && pathSegments[0] === 'notes') {
            const noteId = pathSegments[1];
            if (noteId !== 'dashboard' && noteId !== 'new' && noteId !== 'tags' && noteId !== 'stack' && noteId !== 'notebook') {
                return { noteId, routeType: 'note' as const };
            }
        }
        
        return { routeType: 'unknown' as const };
    }, [location.pathname])

    // Extract params directly from URL - stable values
    const allParams = useMemo(() => {
        return {
            noteId: params.noteId,
            notebookId: params.notebookId,
            stackId: params.stackId,
            tagId: params.tagId,
        }
    }, [params.noteId, params.notebookId, params.stackId, params.tagId])

    // Get IDs from context - stable values derived from URL
    const noteId = context.noteId || allParams.noteId
    const notebookId = context.notebookId || allParams.notebookId
    const stackId = context.stackId || allParams.stackId
    const tagId = context.tagId || allParams.tagId

    // Build stable filter key from URL params only (no object dependencies)
    const filterKey = useMemo(() => {
        return JSON.stringify({
            tag_id: tagId ? (typeof tagId === 'string' ? parseInt(tagId, 10) : tagId) : undefined,
            notebook_id: notebookId || undefined,
            stack_id: stackId || undefined,
            archived: false,
            trashed: false,
        })
    }, [tagId, notebookId, stackId])

    // Build filter based on route parameters - memoized with stable key
    const routeFilter = useMemo(() => {
        return handleRouteParams(allParams, context)
    }, [filterKey])

    // State for filtered notes list
    const [filteredNotes, setFilteredNotes] = useState<Note[]>([])
    const [loadingNotes, setLoadingNotes] = useState(false)
    const [notesError, setNotesError] = useState<string | null>(null)
    
    // Track last fetched filter key to prevent duplicate calls
    const lastFetchedKeyRef = useRef<string | null>(null)

    // Handle route parameters: Fetch notes based on context
    // Only fetch when filter key changes (URL params change)
    useEffect(() => {
        // Skip if this filter key was already fetched
        if (lastFetchedKeyRef.current === filterKey) {
            return
        }

        const fetchNotesByContext = async () => {
            lastFetchedKeyRef.current = filterKey
            setLoadingNotes(true)
            setNotesError(null)
            
            try {
                // Convert filter to match FetchNotesParams type
                // stack_id and notebook_id are UUIDs (strings), tag_id is a number
                const fetchParams: any = {}
                if (routeFilter.tag_id !== undefined) {
                    fetchParams.tag_id = routeFilter.tag_id
                }
                if (routeFilter.stack_id) {
                    fetchParams.stack_id = routeFilter.stack_id // UUID string
                }
                if (routeFilter.notebook_id) {
                    fetchParams.notebook_id = routeFilter.notebook_id // UUID string
                }
                if (routeFilter.archived !== undefined) {
                    fetchParams.archived = routeFilter.archived
                }
                if (routeFilter.trashed !== undefined) {
                    fetchParams.trashed = routeFilter.trashed
                }
                if (routeFilter.pinned !== undefined) {
                    fetchParams.pinned = routeFilter.pinned
                }
                
                const response = await noteService.getAllNotes(fetchParams, true)
                let notesData: Note[] = []
                
                if (Array.isArray(response)) {
                    notesData = response
                } else if (response && typeof response === 'object' && 'data' in response) {
                    const data = (response as { data: { notes: Note[] } | Note[] }).data
                    if (Array.isArray(data)) {
                        notesData = data
                    } else if (data && typeof data === 'object' && 'notes' in data) {
                        notesData = (data as { notes: Note[] }).notes
                    }
                }
                
                setFilteredNotes(notesData)
            } catch (error: any) {
                console.error('Failed to fetch notes by context:', error)
                setNotesError(error.msg || 'Failed to load notes')
                setFilteredNotes([])
                lastFetchedKeyRef.current = null // Reset on error to allow retry
            } finally {
                setLoadingNotes(false)
            }
        }

        fetchNotesByContext()
    }, [filterKey, routeFilter])

    // Track last loaded noteId to prevent duplicate loads
    const lastLoadedNoteIdRef = useRef<string | null>(null)

    // Load note from URL if noteId is present (part of handleRouteParams)
    useEffect(() => {
        // Skip if this noteId was already loaded
        if (lastLoadedNoteIdRef.current === noteId) {
            return
        }

        const loadNoteFromUrl = async () => {
            if (noteId && noteId !== 'notes' && noteId !== 'dashboard' && noteId !== 'new') {
                lastLoadedNoteIdRef.current = noteId
                try {
                    setLoadingContent(true)
                    // Use getNoteContent API for consistent behavior
                    const response = await noteService.getNoteContent(noteId, true)
                    
                    // Handle different response formats
                    let contentText = ''
                    let noteData: Note | null = null
                    
                    // Check if response is the new full note structure
                    if (typeof response === 'object' && response !== null && 'success' in response && 'data' in response) {
                        const data = (response as any).data
                        if (data && typeof data === 'object' && 'note' in data) {
                            // Full note structure: { success: true, data: { note: {...}, tags: [], stack_name: null } }
                            noteData = data.note as Note
                            // Handle content as string or NoteContent object
                            if (typeof noteData.content === 'string') {
                                contentText = noteData.content
                            } else if (noteData.content && typeof noteData.content === 'object' && 'content' in noteData.content) {
                                contentText = (noteData.content as NoteContent).content || ''
                            } else {
                                contentText = ''
                            }
                        }
                    } else if (typeof response === 'string') {
                        // Direct content string - need to get note metadata separately
                        contentText = response
                        try {
                            const noteResponse = await noteService.getNoteById(noteId, false)
                            noteData = (noteResponse as any).note || noteResponse as Note
                        } catch (err) {
                            console.warn('Failed to fetch note metadata:', err)
                        }
                    } else if (typeof response === 'object' && response !== null && 'content' in response) {
                        contentText = (response as any).content
                        try {
                            const noteResponse = await noteService.getNoteById(noteId, false)
                            noteData = (noteResponse as any).note || noteResponse as Note
                        } catch (err) {
                            console.warn('Failed to fetch note metadata:', err)
                        }
                    }
                    
                    if (noteData) {
                    setNoteContent(contentText)
                    setNoteTitle(noteData.title || '')
                        const noteToSet = noteData
                        setSelectedNote(noteToSet)
                        selectedNoteRef.current = noteToSet
                        
                        // Combine title and content for editor - title as first H1 block
                        const titleHtml = noteData.title 
                            ? `<h1 class="note-title-block">${noteData.title}</h1>` 
                            : '<h1 class="note-title-block"><br></h1>'
                        const combinedContent = titleHtml + (contentText || '<p><br></p>')
                        setEditorValue(combinedContent)
                    } else {
                        // Fallback if we couldn't get note data
                        setNoteContent(contentText)
                        setNoteTitle('')
                        const titleHtml = '<h1 class="note-title-block"><br></h1>'
                        setEditorValue(titleHtml + (contentText || '<p><br></p>'))
                    }
                } catch (error: any) {
                    console.error('Failed to load note from URL:', error)
                    setNoteContent('')
                    setSelectedNote(null)
                selectedNoteRef.current = null
                    setNoteTitle('')
                    setEditorValue('<h1 class="note-title-block"><br></h1><p><br></p>')
                    lastLoadedNoteIdRef.current = null // Reset on error to allow retry
                } finally {
                    setLoadingContent(false)
                }
            } else if (!noteId || noteId === 'dashboard' || noteId === 'new') {
                // No note in URL, clear selection
                lastLoadedNoteIdRef.current = null
                setSelectedNote(null)
                selectedNoteRef.current = null
                setNoteContent('')
                setNoteTitle('')
                setEditorValue('<h1 class="note-title-block"><br></h1><p><br></p>')
            }
        }

        loadNoteFromUrl()
    }, [noteId])

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (titleSaveTimeoutRef.current) {
                clearTimeout(titleSaveTimeoutRef.current)
            }
        }
    }, [])

    // Remove this useEffect - note loading is handled by URL-based effect above
    // This was causing duplicate fetches when noteId was already in URL

    const handleSave = async (saveTitle = true) => {
        if (!selectedNote?.id) return
        
        setIsSaving(true)
        try {
            // Save title first if needed (using the immediate save function)
            if (saveTitle) {
                await saveTitleImmediately()
            }
            
            // Then save content
            const payload: { content: string; title?: string } = { content: noteContent }
            await noteService.saveNoteContent(selectedNote.id, payload)
            setLastSaved(new Date())
        } catch (error: any) {
            console.error('Failed to save note:', error)
            showNotification({
                message: error.msg || error.message || 'Failed to save note',
                variant: 'danger',
                title: 'Save Error'
            })
        } finally {
            setIsSaving(false)
        }
    }

    // Extract title from first H1 block and handle editor changes
    const handleEditorChange = (content: string) => {
        if (isUpdatingEditorRef.current) return
        
        setEditorValue(content)
        
        // Extract title from first block (H1 with class note-title-block)
        const tempDiv = document.createElement('div')
        tempDiv.innerHTML = content
        const firstBlock = tempDiv.firstElementChild
        
        let extractedTitle = ''
        let extractedContent = content
        
        if (firstBlock && (firstBlock.tagName === 'H1' || firstBlock.classList.contains('note-title-block'))) {
            extractedTitle = firstBlock.textContent?.trim() || ''
            // Remove the title block from content for storage
            firstBlock.remove()
            extractedContent = tempDiv.innerHTML || '<p><br></p>'
        } else if (content.trim()) {
            // If no title block exists, create one
            const titleHtml = '<h1 class="note-title-block"><br></h1>'
            extractedContent = titleHtml + content
            // Update editor with title block
            isUpdatingEditorRef.current = true
            setTimeout(() => {
                if (quillRef.current) {
                    const quill = quillRef.current.getEditor?.() || quillRef.current.quill
                    if (quill) {
                        const length = quill.getLength()
                        quill.insertText(0, '\n', 'header', 1)
                        quill.formatText(0, 1, { header: 1, class: 'note-title-block' }, 'user')
                        quill.setSelection(1)
                    }
                }
                isUpdatingEditorRef.current = false
            }, 0)
        }
        
        setNoteContent(extractedContent)
        
        // Update noteTitle state
        if (extractedTitle !== noteTitle) {
            setNoteTitle(extractedTitle)
        }
        
        // Note: Title saving is handled by Enter key, blur, and manual save handlers
        // We don't auto-save on every change to avoid excessive API calls
    }
    
    // Check if cursor is in the title block (first H1)
    const isInTitleBlock = useCallback((quill: any): boolean => {
        if (!quill) return false
        const selection = quill.getSelection()
        if (!selection) return false
        
        const delta = quill.getContents()
        if (!delta.ops || delta.ops.length === 0) return false
        
        const firstOp = delta.ops[0]
        if (!firstOp.attributes) return false
        
        // Check if first block is H1
        const isTitleBlock = firstOp.attributes.header === 1
        
        if (!isTitleBlock) return false
        
        // Check if cursor is within the first block
        const firstBlockLength = typeof firstOp.insert === 'string' 
            ? firstOp.insert.length 
            : (firstOp.insert as any)?.length || 0
        
        return selection.index <= firstBlockLength
    }, [])
    
    // Save title immediately (no debounce) - called on Enter, blur, and manual save
    const saveTitleImmediately = useCallback(async () => {
        if (!quillRef.current) return
        
        const quill = quillRef.current.getEditor?.() || quillRef.current.quill
        if (!quill) return
        
        // Get current selected note from ref to avoid stale closure
        const currentNote = selectedNoteRef.current
        if (!currentNote?.id) return
        
        // Get current editor HTML content directly from Quill (not from state)
        const editorHTML = quill.root.innerHTML
        
        // Extract current title from editor HTML
        const tempDiv = document.createElement('div')
        tempDiv.innerHTML = editorHTML
        const firstBlock = tempDiv.firstElementChild
        let currentTitle = ''
        
        if (firstBlock && (firstBlock.tagName === 'H1' || firstBlock.classList.contains('note-title-block'))) {
            currentTitle = firstBlock.textContent?.trim() || ''
        }
        
        // Only save if title actually changed (avoid duplicate API calls)
        if (currentTitle === currentNote.title) {
            return
        }
        
        // Clear any pending debounced save
        if (titleSaveTimeoutRef.current) {
            clearTimeout(titleSaveTimeoutRef.current)
            titleSaveTimeoutRef.current = null
        }
        
        try {
            await noteService.updateNote(currentNote.id, { title: currentTitle })
            
            // Update state immediately for instant UI feedback
            const updatedNote = { ...currentNote, title: currentTitle }
            setNoteTitle(currentTitle)
            setSelectedNote(updatedNote)
            selectedNoteRef.current = updatedNote
            setLastSaved(new Date())
            
            // Update the note in the filtered notes list instantly
            setFilteredNotes(prev => 
                prev.map(note => 
                    note.id === currentNote.id 
                        ? { ...note, title: currentTitle }
                        : note
                )
            )
        } catch (error: any) {
            console.error('Failed to save note title:', error)
            // Show error notification
            showNotification({
                message: error.msg || error.message || 'Failed to save note title',
                variant: 'danger',
                title: 'Save Error'
            })
        }
    }, [showNotification])
    
    // Ensure first block is always H1 title block
    const ensureTitleBlock = () => {
        if (!quillRef.current || isUpdatingEditorRef.current) return
        
        const quill = quillRef.current.getEditor?.() || quillRef.current.quill
        if (!quill) return
        
        const delta = quill.getContents()
        if (delta.length === 0 || !delta.ops || delta.ops.length === 0) {
            // Editor is empty, add title block
            isUpdatingEditorRef.current = true
            quill.insertText(0, '\n', 'header', 1)
            quill.formatText(0, 1, { header: 1, class: 'note-title-block' }, 'user')
            quill.setSelection(1)
            isUpdatingEditorRef.current = false
        } else {
            // Check if first block is H1 title
            const firstOp = delta.ops[0]
            if (!firstOp.attributes?.header || firstOp.attributes.header !== 1 || firstOp.attributes.class !== 'note-title-block') {
                // First block is not H1 title, make it H1 title
                isUpdatingEditorRef.current = true
                const length = firstOp.insert?.length || 0
                quill.formatText(0, length, { header: 1, class: 'note-title-block' }, 'user')
                isUpdatingEditorRef.current = false
            }
        }
    }

    const handleNewNote = async () => {
        try {
            // Create new note with title "Untitled"
            const response = await noteService.createNote({ title: 'Untitled' }, true)
            
            // Handle response structure: { success: true, msg: "...", data: { note: {...} } }
            let newNote: Note
            if (typeof response === 'object' && 'success' in response && 'data' in response) {
                // New response format: { success: true, data: { note: {...} } }
                const data = (response as { success: boolean; data: { note: Note } }).data
                newNote = data.note
            } else if (typeof response === 'object' && 'id' in response) {
                // Direct Note object
                newNote = response as Note
            } else if (typeof response === 'object' && 'data' in response) {
                // Legacy NoteResponse format
                newNote = (response as NoteResponse).data
            } else {
                // Fallback - try to extract note from response
                newNote = (response as any).note || response as Note
            }
            
            // Immediately set the note and open editor
            setSelectedNote(newNote)
            selectedNoteRef.current = newNote
            setNoteTitle(newNote.title || 'Untitled')
            setLoadingContent(false) // No need to load content for new note
            
            // Set editor value with "Untitled" as first H1 block
            const titleHtml = '<h1 class="note-title-block">Untitled</h1>'
            const combinedContent = titleHtml + '<p><br></p>'
            setEditorValue(combinedContent)
            setNoteContent('')
            
            // Immediately add to filteredNotes for instant UI update (optimistic UI)
            // This ensures the notes list updates instantly without refetching
            setFilteredNotes(prev => {
                // Check if note already exists to avoid duplicates
                const exists = prev.some(n => n.id === newNote.id)
                if (exists) return prev
                // Add new note at the beginning (most recent first)
                return [newNote, ...prev]
            })
            
            // Navigate to the new note immediately
            const isMobile = window.innerWidth < 992
            selectNote(newNote.id, !isMobile)
            
            // Do NOT reset lastFetchedKeyRef - we've already updated the list optimistically
            // This prevents unnecessary refetch of the entire notes list
        } catch (error: any) {
            console.error('Failed to create new note:', error)
            // Show error notification if available
        }
    }

    const handleNoteClick = async (note: Note) => {
        // Immediately set the note for instant UI feedback
        setSelectedNote(note)
        selectedNoteRef.current = note
        setNoteTitle(note.title || '')
        setLoadingContent(true)
        
        try {
            // Fetch full note content immediately using getNoteContent API
            const response = await noteService.getNoteContent(note.id, true)
            
            // Handle different response formats
            let contentText = ''
            let noteData = note
            
            // Check if response is the new full note structure: { success: true, data: { note: {...}, tags: [], stack_name: null } }
            if (typeof response === 'object' && response !== null && 'success' in response && 'data' in response) {
                const data = (response as any).data
                if (data && typeof data === 'object' && 'note' in data) {
                    // Full note structure
                    noteData = data.note as Note
                    // Handle content as string or NoteContent object
                    if (typeof noteData.content === 'string') {
                        contentText = noteData.content
                    } else if (noteData.content && typeof noteData.content === 'object' && 'content' in noteData.content) {
                        contentText = (noteData.content as NoteContent).content || ''
                    } else {
                        contentText = ''
                    }
                    setSelectedNote(noteData)
                    selectedNoteRef.current = noteData
                    setNoteTitle(noteData.title || '')
                }
            } else if (typeof response === 'string') {
                // Direct content string
                contentText = response
            } else if (typeof response === 'object' && response !== null && 'content' in response) {
                // { content: string } format
                contentText = (response as any).content
            }
            
            // Set editor value with title as first H1 block - immediately render
            const titleHtml = noteData.title 
                ? `<h1 class="note-title-block">${noteData.title}</h1>` 
                : '<h1 class="note-title-block"><br></h1>'
            const combinedContent = titleHtml + (contentText || '<p><br></p>')
            setEditorValue(combinedContent)
            setNoteContent(contentText)
            
            // Use navigation helper to preserve context (non-blocking)
            // Detect mobile (you may want to use a hook or context for this)
            const isMobile = window.innerWidth < 992
            // Don't await - let it run in background to not block UI
            onNoteSelected(note, isMobile, noteService).catch(err => {
                console.error('Navigation error:', err)
            })
        } catch (error: any) {
            console.error('Failed to load note content:', error)
            // Fallback to basic note data - still show something
            const titleHtml = note.title 
                ? `<h1 class="note-title-block">${note.title}</h1>` 
                : '<h1 class="note-title-block"><br></h1>'
            setEditorValue(titleHtml + '<p><br></p>')
            setNoteContent('')
        } finally {
            setLoadingContent(false)
        }
    }

    return (
        <Container fluid>
            <PageBreadcrumb title="Notes" subtitle="Apps"/>

            <div className="outlook-box outlook-box-full gap-1">
                <Offcanvas responsive="lg" show={show} onHide={() => setShow(!show)}
                           className="outlook-left-menu outlook-left-menu-md"
                           style={{ width: '350px', minWidth: '350px' }}>
                    <SideBar 
                        onNoteClick={handleNoteClick}
                        onNewNote={handleNewNote}
                        notebookId={notebookId || undefined}
                        stackId={stackId || undefined}
                        tagId={tagId || undefined}
                        routeType={context.routeType}
                        filteredNotes={filteredNotes}
                        loadingNotes={loadingNotes}
                        notesError={notesError}
                    />
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
                                const response = await noteService.getNoteById(selectedNote.id, true)
                                const updatedNote = (response as any).note || response as Note
                                const updated = updatedNote as Note
                                setSelectedNote(updated)
                                selectedNoteRef.current = updated
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
                                <div className="note-editor-wrapper">
                                    <CustomQuill
                                        ref={quillRef}
                                        theme="snow"
                                        modules={modules}
                                        value={editorValue}
                                        onChange={handleEditorChange}
                                        onFocus={() => {
                                            // Setup image handler when editor is focused
                                            if (quillRef.current) {
                                                const quill = quillRef.current.getEditor?.() || quillRef.current.quill;
                                                if (quill) {
                                                    setupImageHandler(quill);
                                                    ensureTitleBlock();
                                                    
                                                    // Add keyboard handler for Enter key in title block
                                                    const handleKeyDown = (e: KeyboardEvent) => {
                                                        if (e.key === 'Enter' && isInTitleBlock(quill)) {
                                                            e.preventDefault();
                                                            // Move cursor to content area (after title block)
                                                            const delta = quill.getContents();
                                                            if (delta.ops && delta.ops.length > 0) {
                                                                const firstBlockLength = typeof delta.ops[0].insert === 'string' 
                                                                    ? delta.ops[0].insert.length 
                                                                    : (delta.ops[0].insert as any)?.length || 0;
                                                                quill.setSelection(firstBlockLength + 1, 0);
                                                            }
                                                            // Save title immediately
                                                            saveTitleImmediately();
                                                        }
                                                    };
                                                    
                                                    // Add selection change handler for blur detection
                                                    const handleSelectionChange = () => {
                                                        const wasInTitle = quill.root.dataset.wasInTitle === 'true';
                                                        const nowInTitle = isInTitleBlock(quill);
                                                        
                                                        // If we were in title block but now we're not, save
                                                        if (wasInTitle && !nowInTitle) {
                                                            saveTitleImmediately();
                                                        }
                                                        
                                                        quill.root.dataset.wasInTitle = nowInTitle ? 'true' : 'false';
                                                    };
                                                    
                                                    // Remove existing handlers if they exist
                                                    if (quill._titleHandlers) {
                                                        quill.root.removeEventListener('keydown', quill._titleHandlers.keydown);
                                                        quill.off('selection-change', quill._titleHandlers.selectionChange);
                                                    }
                                                    
                                                    quill.root.addEventListener('keydown', handleKeyDown);
                                                    quill.on('selection-change', handleSelectionChange);
                                                    
                                                    // Track initial state
                                                    quill.root.dataset.wasInTitle = isInTitleBlock(quill) ? 'true' : 'false';
                                                    
                                                    // Store handlers for cleanup
                                                    quill._titleHandlers = {
                                                        keydown: handleKeyDown,
                                                        selectionChange: handleSelectionChange
                                                    };
                                                }
                                            }
                                        }}
                                        onBlur={() => {
                                            // Save title when editor loses focus if we were in title block
                                            if (quillRef.current) {
                                                const quill = quillRef.current.getEditor?.() || quillRef.current.quill;
                                                if (quill && quill.root.dataset.wasInTitle === 'true') {
                                                    setTimeout(() => saveTitleImmediately(), 0);
                                                }
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                        )}
                    </SimpleBar>
                </Card>
            </div>
        </Container>
    )
}

export default Index

