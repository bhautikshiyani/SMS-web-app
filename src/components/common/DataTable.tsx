'use client';

import * as React from 'react';
import {
  ColumnDef,
  ColumnFiltersState,
  Row,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import {
  CalendarIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  ColumnsIcon,
} from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';




import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';

import { DateRange } from 'react-day-picker';
import { cn } from '@/lib/utils';
import { Spinner } from '../ui/spinner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Calendar } from '../ui/calendar';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  loading?: boolean;

  // Pagination props
  pageCount?: number;
  pageIndex?: number;
  pageSize?: number;
  totalItems?: number;

  // Search and filter props
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
  filterOptions?: {
    name: string;
    options: { label: string; value: string }[];
    value: string;
    onChange: (value: string) => void;
  };

  // Enable/disable features
  enableSelection?: boolean;
  enableColumnVisibility?: boolean;
  enablePagination?: boolean;

  // Callbacks
  onPaginationChange?: (pageIndex: number, pageSize: number) => void;
  onRowSelectionChange?: (rowSelection: Record<string, boolean>) => void;

  // Row identification
  getRowId?: (row: TData) => string;
    onRowClick?: (row: TData) => void;
  // Empty state
  emptyMessage?: string;
  // Loading message
  loadingMessage?: string;
  children?: React.ReactNode;
  dateRange?: DateRange;
  onDateChange?: (range: DateRange | undefined) => void;
}
export function DataTable<TData, TValue>({
  columns,
  data,
  loading = false,
  pageCount = 1,
  pageIndex = 0,
  pageSize = 10,
  totalItems = 0,
  searchPlaceholder = 'Search...',
  onSearch,
  filterOptions,
  enableSelection = true,
  enableColumnVisibility = true,
  enablePagination = true,
  onPaginationChange,
  onRowSelectionChange,
  getRowId = (row: any) => row.id || String(Math.random()),
  emptyMessage = 'No data found.',
  loadingMessage = 'Loading data...',
  children,
  dateRange,
  onDateChange,
  onRowClick,
}: DataTableProps<TData, TValue>) {
  // Table state
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [pagination, setPagination] = React.useState({
    pageIndex,
    pageSize,
  });
  const [previousSearchQuery, setPreviousSearchQuery] = React.useState('');

  React.useEffect(() => {
    // Prevent infinite loop by checking if the search query actually changed
    if (searchQuery !== previousSearchQuery) {
      const timer = setTimeout(() => {
        if (searchQuery.trim()) {
          // Trigger search if there is a valid query
          if (onSearch) {
            onSearch(searchQuery);
          }
        } else {
          // If search is cleared, reset data or call an empty query
          if (onSearch) {
            onSearch(''); // Or reset data to original data if you need
          }
        }
      }, 500);

      return () => {
        clearTimeout(timer);
        // Update previousSearchQuery to the current searchQuery to avoid calling onSearch unnecessarily
        setPreviousSearchQuery(searchQuery);
      };
    }
  }, [searchQuery, previousSearchQuery, onSearch]);

  // Notify parent component of pagination changes

  // Notify parent component of row selection changes
  React.useEffect(() => {
    if (onRowSelectionChange) {
      onRowSelectionChange(rowSelection);
    }
  }, [rowSelection, onRowSelectionChange]);

  // Configure the table
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination: {
        pageIndex,
        pageSize,
      },
    },
    getRowId,
    enableRowSelection: enableSelection,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    manualPagination: true, // Tell React Table you're managing pagination manually
    pageCount, // Total page count (can be passed as prop)
    onPaginationChange: (updater) => {
      const newPagination =
        typeof updater === 'function' ? updater({ pageIndex, pageSize }) : updater;
      setPagination({ pageIndex: newPagination.pageIndex, pageSize: newPagination.pageSize });
      onPaginationChange?.(newPagination.pageIndex, newPagination.pageSize);
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    ...(enablePagination && !onPaginationChange
      ? { getPaginationRowModel: getPaginationRowModel() }
      : {}),
  });

  function DraggableRow({ row, onRowClick }: { row: Row<TData>; onRowClick?: (row: TData) => void }) {
    const rowData = row.original;
    const clickable = !!onRowClick;

    return (
      <TableRow
        data-state={row.getIsSelected() && 'selected'}
        className={cn(
          clickable && 'cursor-pointer hover:bg-muted/50',
          'relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80'
        )}
        onClick={() => {
          if (clickable) {
            onRowClick?.(rowData);
          }
        }}
      >
        {row.getVisibleCells().map((cell) => (
          <TableCell key={cell.id}>
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </TableCell>
        ))}
      </TableRow>
    );
  }


  return (
    <>
      <div
        className={cn(
          onSearch || children || dateRange || onDateChange ? 'md:justify-between' : 'justify-end',
          'flex flex-col space-y-4 md:flex-row md:items-center  md:space-y-0'
        )}
      >
        {/* Search input */}
        {(onSearch || children || dateRange || onDateChange) && (
          <div className="flex w-full max-w-sm items-center space-x-2">
            {onSearch && (
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className="h-9"
              />
            )}
            {dateRange && onDateChange && (
              <div className={cn('grid gap-2')}>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="date"
                      variant="outline"
                      className={cn(
                        'w-[300px] justify-start text-left font-normal',
                        !dateRange && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon />
                      {dateRange.from ? (
                        dateRange.to ? (
                          <>
                            {format(dateRange.from, 'LLL dd, y')} -{' '}
                            {format(dateRange.to, 'LLL dd, y')}
                          </>
                        ) : (
                          format(dateRange.from, 'LLL dd, y')
                        )
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="range"
                      required={true}
                      selected={dateRange}
                      onSelect={onDateChange}
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}
            {children}
          </div>
        )}

        <div className="flex items-center gap-2">
          {/* Filter dropdown */}
          {filterOptions && (
            <Select value={filterOptions.value} onValueChange={filterOptions.onChange}>
              <SelectTrigger className="w-[180px] bg-white">
                <SelectValue placeholder={`Select ${filterOptions.name}`} />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">All</SelectItem>
                  {filterOptions.options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          )}

          {/* Column visibility */}
          {enableColumnVisibility && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <ColumnsIcon className="mr-2 h-4 w-4" />
                  Columns
                  <ChevronDownIcon className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {table
                  .getAllColumns()
                  .filter(
                    (column) => typeof column.accessorFn !== 'undefined' && column.getCanHide()
                  )
                  .map((column) => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) => column.toggleVisibility(!!value)}
                      >
                        {column.id}
                      </DropdownMenuCheckboxItem>
                    );
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-muted">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} colSpan={header.colSpan}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  <Spinner size="small">{loadingMessage}</Spinner>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <DraggableRow key={row.id} row={row} onRowClick={onRowClick} />
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {enablePagination && (
        <div className="flex items-center justify-between px-2">
          {/* Selection info */}
          {enableSelection && (
            <div className="text-sm text-muted-foreground">
              {table.getFilteredSelectedRowModel().rows.length} of {totalItems || data.length}{' '}
              item(s) selected.
            </div>
          )}

          {/* Pagination controls */}
          <div
            className={cn(!enableSelection && 'justify-between w-full', ' flex items-center gap-4')}
          >
            <div className="flex items-center gap-2">
              <Label htmlFor="rows-per-page" className="text-sm font-medium">
                Rows per page
              </Label>
              <Select
                value={`${pagination.pageSize}`}
                onValueChange={(value) => {
                  table.setPageSize(Number(value));
                }}
              >
                <SelectTrigger id="rows-per-page">
                  <SelectValue placeholder={pagination.pageSize} />
                </SelectTrigger>
                <SelectContent side="top">
                  {[5, 10, 15, 20, 25].map((size) => (
                    <SelectItem key={size} value={`${size}`}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex w-fit items-center justify-center text-sm font-medium">
                Page {pagination.pageIndex + 1} of {Math.max(1, pageCount)}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  className="h-8 w-8 p-0"
                  onClick={() => table.setPageIndex(0)}
                  disabled={loading || !table.getCanPreviousPage()}
                >
                  <span className="sr-only">Go to first page</span>
                  <ChevronsLeftIcon className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  className="h-8 w-8 p-0"
                  onClick={() => table.previousPage()}
                  disabled={loading || !table.getCanPreviousPage()}
                >
                  <span className="sr-only">Go to previous page</span>
                  <ChevronLeftIcon className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  className="h-8 w-8 p-0"
                  onClick={() => table.nextPage()}
                  disabled={loading || !table.getCanNextPage()}
                >
                  <span className="sr-only">Go to next page</span>
                  <ChevronRightIcon className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  className="h-8 w-8 p-0"
                  onClick={() => table.setPageIndex(pageCount - 1)}
                  disabled={loading || !table.getCanNextPage()}
                >
                  <span className="sr-only">Go to last page</span>
                  <ChevronsRightIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
