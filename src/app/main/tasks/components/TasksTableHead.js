import Checkbox from '@mui/material/Checkbox';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import Tooltip from '@mui/material/Tooltip';
import { lighten } from '@mui/material/styles';

const rows = [
  {
    id: 'completed',
    align: 'left',
    disablePadding: true,
    label: '',
    sort: false,
  },
  {
    id: 'label',
    align: 'left',
    disablePadding: false,
    label: 'Title',
    sort: true,
  },
  {
    id: 'priority',
    align: 'left',
    disablePadding: false,
    label: 'Priority',
    sort: true,
  },
  {
    id: 'due_date',
    align: 'left',
    disablePadding: false,
    label: 'Due Date',
    sort: true,
  },
  {
    id: 'completed',
    align: 'left',
    disablePadding: false,
    label: 'Status',
    sort: true,
  },
];

function TasksTableHead(props) {
  const { selectedTaskIds, order, onRequestSort, onSelectAllClick, rowCount } = props;
  const numSelected = selectedTaskIds.length;

  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow className="h-48 sm:h-64">
        <TableCell
          sx={{
            backgroundColor: (theme) =>
              theme.palette.mode === 'light'
                ? lighten(theme.palette.background.default, 0.4)
                : lighten(theme.palette.background.default, 0.02),
          }}
          padding="checkbox"
          className="w-40 md:w-64 text-center z-99"
        >
          <Checkbox
            indeterminate={numSelected > 0 && numSelected < rowCount}
            checked={rowCount !== 0 && numSelected === rowCount}
            onChange={onSelectAllClick}
          />
        </TableCell>
        {rows.map((row) => {
          if (row.id === 'completed' && row.sort) {
            return null;
          }
          return (
            <TableCell
              sx={{
                backgroundColor: (theme) =>
                  theme.palette.mode === 'light'
                    ? lighten(theme.palette.background.default, 0.4)
                    : lighten(theme.palette.background.default, 0.02),
              }}
              className="p-4 md:p-16"
              key={row.id}
              align={row.align}
              padding={row.disablePadding ? 'none' : 'normal'}
              sortDirection={order.id === row.id ? order.direction : false}
            >
              {row.sort && (
                <Tooltip
                  title="Sort"
                  placement={row.align === 'right' ? 'bottom-end' : 'bottom-start'}
                  enterDelay={300}
                >
                  <TableSortLabel
                    active={order.id === row.id}
                    direction={order.id === row.id ? order.direction : 'asc'}
                    onClick={createSortHandler(row.id)}
                    className="font-semibold"
                  >
                    {row.label}
                  </TableSortLabel>
                </Tooltip>
              )}
              {!row.sort && row.label && <span className="font-semibold">{row.label}</span>}
            </TableCell>
          );
        })}
      </TableRow>
    </TableHead>
  );
}

export default TasksTableHead;

