import { useState, useCallback } from 'react'
import { Button, CardBody } from 'react-bootstrap'
import SimpleBar from 'simplebar-react'
import NotesList from './NotesList'
import SideListHeader from './SideListHeader'
import type { Note } from '../types'

interface SideBarProps {
  onNoteClick?: (note: Note) => void
}

const SideBar = ({ onNoteClick }: SideBarProps) => {
  const [activeFilter, setActiveFilter] = useState<any>(null)
  const [sortBy, setSortBy] = useState<string>('updated')
  const [notesCount, setNotesCount] = useState<number>(0)

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

  const handleNewNote = useCallback(() => {
    // TODO: Implement new note creation
    console.log('Create new note')
  }, [])

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
        <Button variant="primary" className="fw-medium w-100 mb-3">
          New Note
        </Button>

        {/* Evernote-style header */}
        <SideListHeader
          title="Notes"
          count={notesCount}
          onFilterClick={handleFilterClick}
          onSortClick={handleSortClick}
          onNewNote={handleNewNote}
          onShareNotebook={handleShareNotebook}
          onRenameNotebook={handleRenameNotebook}
          onAddToShortcuts={handleAddToShortcuts}
        />

        {/* Notes */}
        <NotesList 
          filter={activeFilter} 
          sortBy={sortBy}
          onNotesCountChange={setNotesCount}
          onNoteClick={onNoteClick}
        />
      </CardBody>
    </SimpleBar>
  )
}

export default SideBar
