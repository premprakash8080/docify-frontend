import { useState } from 'react'
import { Button, Dropdown, OverlayTrigger, Popover, PopoverBody } from 'react-bootstrap'
import { TbFilter, TbAdjustments, TbDots, TbPlus } from 'react-icons/tb'

type SideListHeaderProps = {
  title: string
  count: number
  onFilterClick?: (value: string) => void
  onSortClick?: (value: string) => void
  onNewNote?: () => void
  onShareNotebook?: () => void
  onRenameNotebook?: () => void
  onAddToShortcuts?: () => void
}

const SideListHeader = ({
  title,
  count,
  onFilterClick,
  onSortClick,
  onNewNote,
  onShareNotebook,
  onRenameNotebook,
  onAddToShortcuts,
}: SideListHeaderProps) => {
  const [filterPopoverShow, setFilterPopoverShow] = useState(false)
  const [sortPopoverShow, setSortPopoverShow] = useState(false)

  // Filter Popover
  const filterPopover = (
    <Popover id="filter-popover" className="notes-filter-popover">
      <PopoverBody className="p-2">
        <div className="d-flex flex-column gap-1">
          <button
            className="btn btn-link text-start p-2 text-decoration-none"
            onClick={() => {
              onFilterClick?.('pinned')
              setFilterPopoverShow(false)
            }}
          >
            Pinned
          </button>
          <button
            className="btn btn-link text-start p-2 text-decoration-none"
            onClick={() => {
              onFilterClick?.('archived')
              setFilterPopoverShow(false)
            }}
          >
            Archived
          </button>
          <button
            className="btn btn-link text-start p-2 text-decoration-none"
            onClick={() => {
              onFilterClick?.('trashed')
              setFilterPopoverShow(false)
            }}
          >
            Trash
          </button>
        </div>
      </PopoverBody>
    </Popover>
  )

  // Sort Popover
  const sortPopover = (
    <Popover id="sort-popover" className="notes-sort-popover">
      <PopoverBody className="p-2">
        <div className="d-flex flex-column gap-1">
          <button
            className="btn btn-link text-start p-2 text-decoration-none"
            onClick={() => {
              onSortClick?.('title-asc')
              setSortPopoverShow(false)
            }}
          >
            A–Z Sort by Title
          </button>
          <button
            className="btn btn-link text-start p-2 text-decoration-none"
            onClick={() => {
              onSortClick?.('updated')
              setSortPopoverShow(false)
            }}
          >
            Sort by Updated Date
          </button>
          <button
            className="btn btn-link text-start p-2 text-decoration-none"
            onClick={() => {
              onSortClick?.('created')
              setSortPopoverShow(false)
            }}
          >
            Sort by Created Date
          </button>
        </div>
      </PopoverBody>
    </Popover>
  )

  return (
    <div className="d-flex align-items-center justify-content-between mb-3 side-list-header">
      {/* Title with count */}
      <h5 className="mb-0 fw-semibold side-list-title">
        {title}{' '}
        <span className="text-muted fs-13 ms-1">
          {count}</span>
      </h5>

      {/* Actions - Icon buttons only */}
      <div className="d-flex align-items-center gap-1">
        {/* Filter Icon Button */}
        <OverlayTrigger
          trigger="click"
          placement="bottom-end"
          overlay={filterPopover}
          show={filterPopoverShow}
          onToggle={(nextShow) => setFilterPopoverShow(nextShow)}
          rootClose
        >
          <Button
            variant="light"
            size="sm"
            className="btn-icon rounded-circle p-1"
            style={{ width: '28px', height: '28px' }}
          >
            <TbFilter size={18} />
          </Button>
        </OverlayTrigger>

        {/* Sort Icon Button */}
        <OverlayTrigger
          trigger="click"
          placement="bottom-end"
          overlay={sortPopover}
          show={sortPopoverShow}
          onToggle={(nextShow) => setSortPopoverShow(nextShow)}
          rootClose
        >
          <Button
            variant="light"
            size="sm"
            className="btn-icon rounded-circle p-1"
            style={{ width: '28px', height: '28px' }}
          >
            <TbAdjustments size={18} />
          </Button>
        </OverlayTrigger>

        {/* More Icon Button */}
        <Dropdown align="end">
          <Dropdown.Toggle
            variant="light"
            size="sm"
            className="btn-icon rounded-circle p-1"
            style={{ width: '28px', height: '28px' }}
          >
            <TbDots size={18} />
          </Dropdown.Toggle>

          <Dropdown.Menu className="notes-more-menu">
            <Dropdown.Item onClick={onNewNote}>
              <TbPlus className="me-2" size={16} />
              New Note
            </Dropdown.Item>
            <Dropdown.Item onClick={onShareNotebook}>
              Share Notebook
            </Dropdown.Item>
            <Dropdown.Item onClick={onRenameNotebook}>
              Rename Notebook
            </Dropdown.Item>
            <Dropdown.Item onClick={onAddToShortcuts}>
              Add to Shortcuts
            </Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item>
              By Tag
            </Dropdown.Item>
            <Dropdown.Item>
              Located In
            </Dropdown.Item>
            <Dropdown.Item>
              Created Date
            </Dropdown.Item>
            <Dropdown.Item>
              Updated Date
            </Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.ItemText className="text-muted small">
              Last updated: a few minutes ago
            </Dropdown.ItemText>
          </Dropdown.Menu>
        </Dropdown>
      </div>
    </div>
  )
}

export default SideListHeader
