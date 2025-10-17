"use client";

import { useState, useEffect, useMemo } from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Product } from '@prisma/client';
import { toProductDTO } from '@/lib/normalization';
import { ProductDTO } from '@/types';
import debounce from 'lodash.debounce';

const columns: ColumnDef<ProductDTO>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: "Name",
    },
    {
        accessorKey: "category.name",
        header: "Category",
    },
    {
      accessorKey: "priceVnd",
      header: "Price (VND)",
    },
    {
      accessorKey: "stockStatus",
      header: "Stock Status",
    },
    {
      accessorKey: "isActive",
      header: "Active",
    },
  ];

export default function ProductsPage() {
    const [data, setData] = useState<ProductDTO[]>([]);
    const [sorting, setSorting] = useState<SortingState>([]);
    const [filtering, setFiltering] = useState('');
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        onPaginationChange: setPagination,
        manualPagination: true,
        manualSorting: true,
        manualFiltering: true,
        state: {
          sorting,
          pagination,
        },
      });

    const debouncedFetchData = useMemo(() => debounce(async (filterValue: string) => {
        const sortParam = sorting.length > 0 ? `&sort=${sorting[0].id}&order=${sorting[0].desc ? 'desc' : 'asc'}` : '';
        const filterParam = filterValue ? `&filter=${filterValue}` : '';
        const res = await fetch(`/api/admin/products/list?page=${pagination.pageIndex + 1}&limit=${pagination.pageSize}${sortParam}${filterParam}`);
        const { data: products, pagination: newPagination } = await res.json();
        const productDTOs = products.map(toProductDTO);
        setData(productDTOs);
    }, 500), [pagination, sorting]);


    useEffect(() => {
        debouncedFetchData(filtering);
    }, [filtering, debouncedFetchData]);


  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-4">Products</h1>
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter by name..."
          value={filtering}
          onChange={(event) => setFiltering(event.target.value)}
          className="max-w-sm"
        />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
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
  );
}
