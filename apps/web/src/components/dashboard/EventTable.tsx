import {
  ChevronDown,
  MoreHorizontal,
  CheckCircle2,
  Clock,
  XCircle,
  Loader2,
  FileText,
  Check,
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
import { useNavigate } from 'react-router-dom';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@prodgenie/libs/ui/table';
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
import { Progress } from '@prodgenie/libs/ui/progress';
import { useWorkspaceStore } from '@prodgenie/libs/store';

// ✅ FIXED TYPE
export type Event = {
  id: string;
  type: string;
  description?: string;
  creditChange: number;
  balanceAfter?: number | null;
  status?: string | null;
  progress?: number | null;
  fileId?: string | null;
  file?: { url?: string };
  errorData?: any;
  createdAt: string;
};

interface EventTableProps {
  events?: Event[];
  onRefresh?: () => void;
}

const EventTable: React.FC<EventTableProps> = ({ events }) => {
  const navigate = useNavigate();
  const { workspaceEvents, activeWorkspaceRole } = useWorkspaceStore();
  const [pageSize, setPageSize] = React.useState(5);

  const data = events ?? workspaceEvents;

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({
      errorData: false,
      createdAt: false,
    });
  const [rowSelection, setRowSelection] = React.useState({});

  // ✅ COLUMNS INSIDE COMPONENT (fix)
  const columns: ColumnDef<Event>[] = [
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => (
        <div className="capitalize">{row.getValue('type')}</div>
      ),
    },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: ({ row }) => (
        <div className="capitalize">{row.getValue('description') || '—'}</div>
      ),
    },
    {
      accessorKey: 'creditChange',
      header: () => <div className="text-right">Change</div>,
      cell: ({ row }) => {
        const value = (row.getValue('creditChange') as number) || 0;

        const formatted = new Intl.NumberFormat('en-IN', {
          style: 'currency',
          currency: 'INR',
        }).format(Math.abs(value));

        return (
          <div
            className={`text-right font-medium ${
              value > 0 ? 'text-green-600' : value < 0 ? 'text-red-600' : ''
            }`}
          >
            {value > 0 ? `+ ${formatted}` : `- ${formatted}`}
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

        return (
          <div className="text-right">
            {new Intl.NumberFormat('en-IN', {
              style: 'currency',
              currency: 'INR',
            }).format(value)}
          </div>
        );
      },
    },
    {
      accessorKey: 'progress',
      header: 'Progress',
      cell: ({ row }) => {
        const value = row.getValue('progress') as number | null;
        if (value == null) return '—';

        return (
          <div className="flex justify-end">
            <Progress value={value} />
          </div>
        );
      },
    },
    {
      accessorKey: 'fileId',
      header: 'File',
      cell: ({ row }) => {
        const status = (row.getValue('status') as string)?.toLowerCase();
        const fileId = row.getValue('fileId') as string | null;
        const file = row.original.file;

        if (status !== 'completed' || !fileId) return '—';

        const url = file?.url || `/dashboard/jobCard/${fileId}`;

        return (
          <a href={url} target="_blank" className="text-blue-600">
            <FileText className="h-5 w-5" />
          </a>
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status =
          (row.getValue('status') as string)?.toLowerCase() || 'unknown';

        const eventId = row.original.id;
        const isAdmin = activeWorkspaceRole === 'admin';

        const map: any = {
          completed: {
            label: 'Completed',
            icon: <CheckCircle2 className="h-4 w-4 mr-1" />,
            className: 'bg-green-100 text-green-700',
          },
          processing: {
            label: 'Processing',
            icon: <Loader2 className="h-4 w-4 mr-1 animate-spin" />,
            className: 'bg-yellow-100 text-yellow-700',
          },
          pending: {
            label: 'Pending',
            icon: <Clock className="h-4 w-4 mr-1" />,
            className: 'bg-gray-100 text-black',
          },
          failed: {
            label: 'Failed',
            icon: <XCircle className="h-4 w-4 mr-1" />,
            className: 'bg-red-100 text-red-700',
          },
          approved: {
            label: 'Approved',
            icon: <CheckCircle2 className="h-4 w-4 mr-1" />,
            className: 'bg-green-100 text-green-700',
          },
          rejected: {
            label: 'Rejected',
            icon: <XCircle className="h-4 w-4 mr-1" />,
            className: 'bg-red-100 text-red-700',
          },
          update_credits_manually: {
            label: 'Admin Pending',
            icon: <Clock className="h-4 w-4 mr-1" />,
            className: 'bg-yellow-100 text-yellow-700',
            clickable: true,
          },
        };

        const item = map[status] || {
          label: '—',
          icon: null,
          className: 'bg-muted',
        };

        const handleClick = () => {
          if (isAdmin && item.clickable) {
            navigate(`/dashboard/event/${eventId}`);
          }
        };

        return (
          <Badge
            variant="outline"
            onClick={handleClick}
            className={`flex items-center ${item.className} ${
              isAdmin && item.clickable ? 'cursor-pointer hover:opacity-80' : ''
            }`}
          >
            {item.icon}
            {item.label}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'createdAt',
      header: 'Created',
      cell: ({ row }) =>
        new Date(row.getValue('createdAt') as string).toLocaleString(),
    },

    // ✅ FIXED ACTIONS
    // {
    //   id: 'actions',
    //   cell: ({ row }) => {
    //     const event = row.original;

    //     return (
    //       <DropdownMenu>
    //         <DropdownMenuTrigger asChild>
    //           <Button variant="ghost" className="h-8 w-8 p-0">
    //             <MoreHorizontal />
    //           </Button>
    //         </DropdownMenuTrigger>

    //         <DropdownMenuContent align="end">
    //           <DropdownMenuLabel>Actions</DropdownMenuLabel>

    //           <DropdownMenuItem
    //             onClick={() => navigator.clipboard.writeText(event.id)}
    //           >
    //             Copy event ID
    //           </DropdownMenuItem>
    //           {activeWorkspaceRole === 'admin' && (
    //             <>
    //               <DropdownMenuSeparator />

    //               <DropdownMenuItem
    //                 onClick={() => navigate(`/dashboard/event/${event.id}`)}
    //               >
    //                 View details
    //               </DropdownMenuItem>
    //             </>
    //           )}
    //         </DropdownMenuContent>
    //       </DropdownMenu>
    //     );
    //   },
    // },
  ];

  const table = useReactTable({
    data,
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
      pagination: { pageSize: pageSize },
      sorting: [{ id: 'createdAt', desc: true }],
    },
  });

  return (
    <div className="w-full">
      <div className="flex items-center gap-2">
        <Input
          placeholder="Filter type..."
          value={(table.getColumn('type')?.getFilterValue() as string) ?? ''}
          onChange={(e) =>
            table.getColumn('type')?.setFilterValue(e.target.value)
          }
          className="max-w-sm"
        />

        <div className="flex items-center gap-2 ml-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                Columns <ChevronDown />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((c) => c.getCanHide())
                .map((c) => (
                  <DropdownMenuCheckboxItem
                    key={c.id}
                    checked={c.getIsVisible()}
                    onCheckedChange={(v) => c.toggleVisibility(!!v)}
                  >
                    {c.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                {pageSize} rows <ChevronDown className="ml-1 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              {[5, 10, 20, 50].map((size) => (
                <DropdownMenuItem
                  key={size}
                  onClick={() => {
                    setPageSize(size);
                    table.setPageSize(size);
                  }}
                  className={pageSize === size ? 'bg-muted font-medium' : ''}
                >
                  {size} rows
                  {pageSize === size && <Check className="h-4 w-4" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="mt-4 border rounded-md">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((g) => (
              <TableRow key={g.id}>
                {g.headers.map((h) => (
                  <TableHead key={h.id}>
                    {flexRender(h.column.columnDef.header, h.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((r) => (
                <TableRow key={r.id}>
                  {r.getVisibleCells().map((c) => (
                    <TableCell key={c.id}>
                      {flexRender(c.column.columnDef.cell, c.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length}>No results.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-muted-foreground">
          Page {table.getState().pagination.pageIndex + 1} of{' '}
          {table.getPageCount()}
        </div>

        <div className="text-sm text-muted-foreground">
          Showing {table.getRowModel().rows.length} of {data.length} results
        </div>

        <div className="flex gap-2">
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
    </div>
  );
};

export default EventTable;
