import { useState, useCallback, useMemo, useEffect } from 'react'
import { Button, CardBody } from 'react-bootstrap'
import SimpleBar from 'simplebar-react'
import NotesList from './NotesList'
import SideListHeader from './SideListHeader'
import type { Note } from '../types'

interface SideBarProps {
  onNoteClick?: (note: Note) => void
  onNewNote?: () => void
  notebookId?: string
  stackId?: string
  tagId?: string
  routeType?: 'dashboard' | 'new' | 'tag' | 'stack' | 'notebook' | 'note' | 'unknown'
  filteredNotes?: Note[]
  loadingNotes?: boolean
  notesError?: string | null
}

const SideBar = ({ 
  onNoteClick,
  onNewNote,
  notebookId, 
  stackId, 
  tagId, 
  routeType,
  filteredNotes,
  loadingNotes = false,
  notesError = null
}: SideBarProps) => {
  const [activeFilter, setActiveFilter] = useState<any>(null)
  const [sortBy, setSortBy] = useState<string>('updated')
  const [notesCount, setNotesCount] = useState<number>(0)
  
  // Build filter based on URL context (used if filteredNotes not provided)
  const contextFilter = useMemo(() => {
    const filter: any = {}
    if (notebookId) {
      filter.notebook_id = notebookId
    }
    if (stackId) {
      filter.stack_id = stackId
    }
    if (tagId) {
      filter.tag_id = tagId
    }
    return Object.keys(filter).length > 0 ? filter : null
  }, [notebookId, stackId, tagId])

  // Update notes count when filtered notes change
  useEffect(() => {
    if (filteredNotes) {
      setNotesCount(filteredNotes.length)
    }
  }, [filteredNotes])

  const handleFilterClick = useCallback((type: string) => {
    if (type === 'pinned') {
      setActiveFilter({ pinned: true })
    } else if (type === 'archived') {
      setActiveFilter({ archived: true })
    } else if (type === 'trashed') {
      setActiveFilter({ trashed: true })
    } else {
      setActiveFilter(null)
    }
  }, [])

  const handleSortClick = useCallback((sortType: string) => {
    setSortBy(sortType)
  }, [])

  const handleNewNoteClick = useCallback(() => {
    if (onNewNote) {
      onNewNote()
    }
  }, [onNewNote])

  const handleShareNotebook = useCallback(() => {
    // TODO: Implement share notebook
    console.log('Share notebook')
  }, [])

  const handleRenameNotebook = useCallback(() => {
    // TODO: Implement rename notebook
    console.log('Rename notebook')
  }, [])

  const handleAddToShortcuts = useCallback(() => {
    // TODO: Implement add to shortcuts
    console.log('Add to shortcuts')
  }, [])

  return (
    <SimpleBar className="card h-100 mb-0 rounded-0 border-0">
      <CardBody>
        <Button variant="primary" className="fw-medium w-100 mb-3" onClick={handleNewNoteClick}>
          New Note
        </Button>

        {/* Evernote-style header */}
        <SideListHeader
          title="Notes"
          count={notesCount}
          onFilterClick={handleFilterClick}
          onSortClick={handleSortClick}
          onNewNote={handleNewNoteClick}
          onShareNotebook={handleShareNotebook}
          onRenameNotebook={handleRenameNotebook}
          onAddToShortcuts={handleAddToShortcuts}
        />

        {/* Notes */}
        <NotesList 
          filter={filteredNotes ? undefined : (activeFilter || contextFilter)} 
          sortBy={sortBy}
          onNotesCountChange={setNotesCount}
          onNoteClick={onNoteClick}
          notes={filteredNotes}
          loading={loadingNotes}
          error={notesError}
        />
      </CardBody>
    </SimpleBar>
  )
}

export default SideBar
