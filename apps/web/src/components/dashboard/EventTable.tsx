import {
  ChevronDown,
  MoreHorizontal,
  CheckCircle2,
  Clock,
  XCircle,
  Loader2,
  FileText,
  RotateCw,
} from 'lucide-react';
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from '@tanstack/react-table';
import * as React from 'react';

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@prodgenie/libs/ui/dropdown-menu';
import { Badge } from '@prodgenie/libs/ui/badge';
import { Button } from '@prodgenie/libs/ui/button';
import { Input } from '@prodgenie/libs/ui/input';
import { Progress } from '@radix-ui/react-progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@prodgenie/libs/ui/table';
import { useWorkspaceStore } from '@prodgenie/libs/store';

// ✅ Type from your Prisma schema
export type Event = {
  id: string;
  type: string;
  errorData?: JSON | null;
  creditChange: number;
  balanceAfter?: number | null;
  status?: string | null;
  createdAt: string;
  user?: { id: string; name: string | null };
};

export const columns: ColumnDef<Event>[] = [
  {
    accessorKey: 'type',
    header: 'Type',
    cell: ({ row }) => <div className="capitalize">{row.getValue('type')}</div>,
  },
  {
    accessorFn: (row) => row.user?.name,
    id: 'user',
    header: 'User',
    cell: ({ row }) => (
      <div className="text-muted-foreground">{row.getValue('user') || '—'}</div>
    ),
  },
  {
    accessorKey: 'createdAt',
    header: 'Date',
    cell: ({ row }) =>
      new Date(row.getValue('createdAt') as string).toLocaleString(),
  },
  {
    accessorKey: 'creditChange',
    header: () => <div className="text-right">Change</div>,
    cell: ({ row }) => {
      const value = row.getValue('creditChange') as number;
      const formatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(value);

      return (
        <div
          className={`text-right font-medium ${
            value > 0 ? 'text-green-600' : value < 0 ? 'text-red-600' : ''
          }`}
        >
          {formatted}
        </div>
      );
    },
  },
  {
    accessorKey: 'balanceAfter',
    header: () => <div className="text-right">Balance</div>,
    cell: ({ row }) => {
      const value = row.getValue('balanceAfter') as number | null;
      if (value == null)
        return <div className="text-right text-muted-foreground">—</div>;
      const formatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(value);
      return <div className="text-right">{formatted}</div>;
    },
  },
  {
    accessorKey: 'progress',
    header: 'Progress',
    cell: ({ row }) => {
      const value = row.getValue('progress') as number | null;
      if (value == null)
        return <div className="text-right text-muted-foreground">—</div>;

      return (
        <div className="flex items-center justify-end space-x-2">
          <Progress value={value} className="w-24" />
          <span className="text-xs text-muted-foreground w-8 text-right">
            {Math.round(value)}%
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status =
        (row.getValue('status') as string)?.toLowerCase() || 'unknown';

      const statusMap: Record<
        string,
        { label: string; icon: React.ReactNode; className: string }
      > = {
        completed: {
          label: 'Completed',
          icon: <CheckCircle2 className="mr-1 h-4 w-4" />,
          className: 'bg-green-100 text-green-700 border-green-200',
        },
        processing: {
          label: 'Processing',
          icon: <Loader2 className="mr-1 h-4 w-4 animate-spin" />,
          className: 'bg-yellow-100 text-yellow-700 border-yellow-200',
        },
        pending: {
          label: 'Pending',
          icon: <Clock className="mr-1 h-4 w-4" />,
          className: 'bg-gray-100 text-gray-700 border-gray-200',
        },
        failed: {
          label: 'Failed',
          icon: <XCircle className="mr-1 h-4 w-4" />,
          className: 'bg-red-100 text-red-700 border-red-200',
        },
        unknown: {
          label: '—',
          icon: null,
          className: 'bg-muted text-muted-foreground',
        },
      };

      const { label, icon, className } = statusMap[status] || statusMap.unknown;

      return (
        <Badge
          variant="outline"
          className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${className}`}
        >
          {icon}
          {label}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'fileId',
    header: 'File',
    cell: ({ row }) => {
      const status = (row.getValue('status') as string)?.toLowerCase();
      const fileId = row.getValue('fileId') as string | null;
      const file = (row.original.file as { id?: string; url?: string }) || null;

      // Show nothing if not completed or no file
      if (status !== 'completed' || !fileId) {
        return <div className="text-muted-foreground text-center">—</div>;
      }

      const fileUrl = file?.url || `/dashboard/jobCard/${fileId}`;

      return (
        <a
          href={fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 flex justify-center"
        >
          <FileText className="h-5 w-5" />
        </a>
      );
    },
  },
  {
    accessorKey: 'errorData',
    header: 'Error Data',
    cell: ({ row }) => {
      const value = row.getValue('errorData');

      // Helper to check if an object or array is empty
      const isEmpty =
        value === null ||
        value === undefined ||
        (typeof value === 'object' &&
          Object.keys(value as object).length === 0);

      const display = isEmpty
        ? '—'
        : typeof value === 'object'
        ? JSON.stringify(value, null, 2)
        : String(value);

      return (
        <pre className="text-muted-foreground whitespace-pre-wrap text-xs">
          {display}
        </pre>
      );
    },
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => {
      const event = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(event.id)}
            >
              Copy event ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View details</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

interface EventTableProps {
  events?: Event[];
  onRefresh?: () => void;
}

const EventTable: React.FC<EventTableProps> = ({ events, onRefresh }) => {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const { workspaceEvents } = useWorkspaceStore();

  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({ errorData: false });
  const [rowSelection, setRowSelection] = React.useState({});

  const table = useReactTable({
    data: workspaceEvents,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    initialState: {
      pagination: { pageSize: 5 },
      sorting: [{ id: 'createdAt', desc: true }],
    },
  });

  return (
    <div className="w-full">
      {/* Toolbar */}
      <div className="flex items-center gap-2 ">
        <Input
          placeholder="Filter Type..."
          value={(table.getColumn('type')?.getFilterValue() as string) ?? ''}
          onChange={(event) =>
            table.getColumn('type')?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  className="capitalize"
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                >
                  {column.id}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
        {/* {onRefresh && ( 
        <Button
          variant="secondary"
          size="sm"
          onClick={onRefresh}
          className="flex items-center gap-1"
        >
           <Loader2 className="h-4 w-4 animate-spin hidden" /> 
          <RotateCw className="h-4 w-4" />
        </Button>
         )} */}
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0 py-2">
        {/* Left side: selection info */}
        <div className="text-muted-foreground text-sm">
          {table.getFilteredSelectedRowModel().rows.length} of{' '}
          {table.getFilteredRowModel().rows.length} selected
        </div>

        {/* Right side: pagination controls */}
        <div className="flex items-center space-x-2">
          {/* Rows per page selector */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">
              Rows per page:
            </span>
            <select
              className="h-8 border rounded-md px-2 text-sm bg-background"
              value={table.getState().pagination.pageSize}
              onChange={(e) => table.setPageSize(Number(e.target.value))}
            >
              {[5, 10, 20, 50, 100].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>

          {/* Prev / Next buttons */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default EventTable;
