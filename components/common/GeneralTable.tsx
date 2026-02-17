'use client';

import React, { useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  ColumnDef,
  SortingState,
} from '@tanstack/react-table';
import { ArrowDown, ArrowUp } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { IPagination } from '@/types/pagination.type';

/** Дозволяє задати ширину та вирівнювання колонки ззовні через columnDef.meta */
export type DataTableColumnMeta = {
  width?: string;
  className?: string;
  align?: 'left' | 'center' | 'right';
};

const alignClass: Record<NonNullable<DataTableColumnMeta['align']>, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
};

const alignFlexClass: Record<NonNullable<DataTableColumnMeta['align']>, string> = {
  left: 'justify-start',
  center: 'justify-center',
  right: 'justify-end',
};

declare module '@tanstack/react-table' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData, TValue> extends DataTableColumnMeta {}
}

type DataTableProps<T> = {
  data: T[];
  columns: ColumnDef<T>[];
  pagination: IPagination;
  onClickPagination: (page: number) => Promise<void>;
  renderRow?: (row: T) => React.ReactNode;
  isLoading?: boolean;
};

export function DataTable<T>({
  data,
  columns,
  renderRow,
  pagination,
  onClickPagination,
  isLoading = false,
}: DataTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const rows = table.getRowModel().rows;

  return (
    <div className="w-full space-y-4">
      <div className="rounded-md border">
        <Table className="overflow-x-scroll">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  const isSorted = header.column.getIsSorted();
                  const meta = header.column.columnDef.meta as DataTableColumnMeta | undefined;
                  return (
                    <TableHead
                      key={header.id}
                      onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                      className={cn(
                        canSort && 'cursor-pointer select-none hover:bg-muted/50',
                        meta?.align && alignClass[meta.align],
                        meta?.className,
                      )}
                      style={meta?.width ? { width: meta.width } : undefined}
                    >
                      <div
                        className={cn(
                          'flex items-center gap-1.5',
                          meta?.align && alignFlexClass[meta.align],
                        )}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {canSort && isSorted && (
                          <span className="inline-flex text-muted-foreground">
                            {isSorted === 'asc' ? (
                              <ArrowUp className="size-4" />
                            ) : (
                              <ArrowDown className="size-4" />
                            )}
                          </span>
                        )}
                      </div>
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  Loading...
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  No data
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) =>
                renderRow ? (
                  <TableRow key={row.id}>{renderRow(row.original)}</TableRow>
                ) : (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => {
                      const cellMeta = cell.column.columnDef.meta as
                        | DataTableColumnMeta
                        | undefined;
                      return (
                        <TableCell
                          key={cell.id}
                          className={cn(
                            cellMeta?.align && alignClass[cellMeta.align],
                            cellMeta?.className,
                          )}
                          style={cellMeta?.width ? { width: cellMeta.width } : undefined}
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ),
              )
            )}
          </TableBody>
        </Table>
      </div>

      {pagination.totalPages > 1 && (
        <Pagination>
          <PaginationContent className="flex items-center gap-4">
            <PaginationItem>
              <PaginationPrevious
                onClick={
                  pagination.page > 1 ? () => onClickPagination(pagination.page - 1) : () => {}
                }
                className={cn(pagination.page > 1 && 'cursor-pointer')}
                isActive={pagination.page > 1}
              />
            </PaginationItem>
            <span>
              {pagination.page} of {pagination.totalPages}
            </span>
            <PaginationItem>
              <PaginationNext
                onClick={() =>
                  pagination.page < pagination.totalPages
                    ? onClickPagination(pagination.page + 1)
                    : () => {}
                }
                className={cn(pagination.page < pagination.totalPages && 'cursor-pointer')}
                isActive={pagination.page < pagination.totalPages}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
