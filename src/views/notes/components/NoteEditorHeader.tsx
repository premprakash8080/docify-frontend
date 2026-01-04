import { useState } from 'react'
import { Button, Dropdown, DropdownItem, DropdownMenu, DropdownToggle, Nav } from 'react-bootstrap'
import { Link } from 'react-router'
import {
  TbMenu2,
  TbMaximize,
  TbChevronRight,
  TbDeviceFloppy,
  TbShare,
  TbLink,
  TbDots,
  TbCopy,
  TbPin,
  TbArchive,
  TbDownload,
  TbTag,
  TbArrowRight,
  TbSearch,
  TbInfoCircle,
  TbHistory,
  TbPrinter,
  TbTrash,
  TbRefresh,
} from 'react-icons/tb'
import type { Note } from '../types'

interface NoteEditorHeaderProps {
  note?: Note | null
  notebookName?: string
  isSaving?: boolean
  lastSaved?: Date | null
  onHideSidebar?: () => void
  onFullscreen?: () => void
  onSave?: () => void
  onShare?: () => void
  onLink?: () => void
  onDuplicate?: () => void
  onPin?: () => void
  onArchive?: () => void
  onExport?: () => void
  onManageTags?: () => void
  onMove?: () => void
  onFindInNote?: () => void
  onNoteInfo?: () => void
  onNoteHistory?: () => void
  onPrint?: () => void
  onDelete?: () => void
}

const NoteEditorHeader = ({
  note,
  notebookName,
  isSaving = false,
  lastSaved,
  onHideSidebar,
  onFullscreen,
  onSave,
  onShare,
  onLink,
  onDuplicate,
  onPin,
  onArchive,
  onExport,
  onManageTags,
  onMove,
  onFindInNote,
  onNoteInfo,
  onNoteHistory,
  onPrint,
  onDelete,
}: NoteEditorHeaderProps) => {
  const [moreMenuShow, setMoreMenuShow] = useState(false)

  const formatLastSaved = () => {
    if (!lastSaved) return ''
    const now = new Date()
    const diff = now.getTime() - lastSaved.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'just now'
    if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`
    if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`
    return `${days} day${days !== 1 ? 's' : ''} ago`
  }

  return (
    <header className="unified-top-app-bar border-bottom">
      <div className="app-bar-content d-flex align-items-center justify-content-between px-3 py-2">
        {/* LEFT: Navigation */}
        <div className="app-bar-left d-flex align-items-center gap-2">
          {/* Navigation Controls */}
          <Button
            variant="light"
            size="sm"
            className="btn-icon rounded-circle"
            onClick={onHideSidebar}
            aria-label="Hide notes sidebar"
          >
            <TbMenu2 size={20} />
          </Button>

          <Button
            variant="light"
            size="sm"
            className="btn-icon rounded-circle"
            onClick={onFullscreen}
            aria-label="Toggle fullscreen"
          >
            <TbMaximize size={20} />
          </Button>

          {/* Breadcrumb */}
          {note?.notebook_id && notebookName && (
            <Nav className="breadcrumb mb-0 ms-2" aria-label="Breadcrumb">
              <Link
                to={`/notebooks/${note.notebook_id}`}
                className="breadcrumb-link text-decoration-none text-muted"
              >
                {notebookName}
              </Link>
              <TbChevronRight size={16} className="mx-1 text-muted" />
              <span className="breadcrumb-current fw-semibold">
                {note.title || 'Untitled'}
              </span>
            </Nav>
          )}
        </div>

        {/* RIGHT: Actions */}
        <div className="app-bar-right d-flex align-items-center gap-2">
          {/* Save Status */}
          {isSaving && (
            <span className="save-status text-muted small d-flex align-items-center gap-1" aria-live="polite">
              <TbRefresh size={16} className="spinning" />
              <span className="visually-hidden">Saving</span>
            </span>
          )}
          {!isSaving && lastSaved && (
            <span className="save-status saved text-muted small" aria-live="polite">
              Saved {formatLastSaved()}
            </span>
          )}

          {/* Action Buttons */}
          <Button
            variant="primary"
            size="sm"
            onClick={onSave}
            disabled={isSaving}
            aria-label="Save note"
            className="d-flex align-items-center gap-1"
          >
            <TbDeviceFloppy size={18} />
            <span>Save</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={onShare}
            aria-label="Share note"
            className="d-flex align-items-center gap-1"
          >
            <TbShare size={18} />
            <span>Share</span>
          </Button>

          <Button
            variant="light"
            size="sm"
            className="btn-icon rounded-circle"
            onClick={onLink}
            aria-label="Copy link"
          >
            <TbLink size={18} />
          </Button>

          <Dropdown show={moreMenuShow} onToggle={setMoreMenuShow} align="end">
            <DropdownToggle
              variant="light"
              size="sm"
              className="btn-icon rounded-circle"
              aria-label="More options"
            >
              <TbDots size={18} />
            </DropdownToggle>

            <DropdownMenu className="notes-more-menu">
              <DropdownItem onClick={onShare}>
                <TbShare className="me-2" size={16} />
                Share
              </DropdownItem>
              <DropdownItem onClick={onLink}>
                <TbLink className="me-2" size={16} />
                Copy link
              </DropdownItem>
              <DropdownItem divider />
              <DropdownItem onClick={onDuplicate}>
                <TbCopy className="me-2" size={16} />
                Duplicate
              </DropdownItem>
              <DropdownItem onClick={onPin}>
                <TbPin className="me-2" size={16} />
                {note?.pinned ? 'Unpin' : 'Pin'}
              </DropdownItem>
              <DropdownItem onClick={onArchive}>
                <TbArchive className="me-2" size={16} />
                {note?.archived ? 'Unarchive' : 'Archive'}
              </DropdownItem>
              <DropdownItem onClick={onExport}>
                <TbDownload className="me-2" size={16} />
                Export
              </DropdownItem>
              <DropdownItem onClick={onManageTags}>
                <TbTag className="me-2" size={16} />
                Tags
              </DropdownItem>
              <DropdownItem onClick={onMove}>
                <TbArrowRight className="me-2" size={16} />
                Move
              </DropdownItem>
              <DropdownItem divider />
              <DropdownItem onClick={onFindInNote}>
                <TbSearch className="me-2" size={16} />
                Find in note
              </DropdownItem>
              <DropdownItem onClick={onNoteInfo}>
                <TbInfoCircle className="me-2" size={16} />
                Note info
              </DropdownItem>
              <DropdownItem onClick={onNoteHistory}>
                <TbHistory className="me-2" size={16} />
                Note history
              </DropdownItem>
              <DropdownItem divider />
              <DropdownItem onClick={onPrint}>
                <TbPrinter className="me-2" size={16} />
                Print
              </DropdownItem>
              <DropdownItem divider />
              <DropdownItem onClick={onDelete} className="text-danger">
                <TbTrash className="me-2" size={16} />
                Delete
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      </div>
    </header>
  )
}

export default NoteEditorHeader

