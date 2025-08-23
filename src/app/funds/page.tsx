"use client";

import { useEffect, useState, useMemo } from "react";
import { type ColumnDef, flexRender, getCoreRowModel, useReactTable, getPaginationRowModel, getSortedRowModel, type SortingState } from "@tanstack/react-table";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Loader2 } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";

interface Fund {
  id: string;
  department: string;
  project: string;
  allocated: number;
  utilized: number;
}

export default function FundsPage() {
  const [funds, setFunds] = useState<Fund[]>([]);
  const [loading, setLoading] = useState(true);
  const [sorting, setSorting] = useState<SortingState>([]);
  const { t, ready } = useTranslation();

  useEffect(() => {
    const fetchFunds = async () => {
      try {
        const fundsCollection = collection(db, "funds");
        const fundsSnapshot = await getDocs(fundsCollection);
        const fundsList = fundsSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Fund[];
        setFunds(fundsList);
      } catch (error) {
        console.error("Error fetching funds:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFunds();
  }, []);

  const columns: ColumnDef<Fund>[] = useMemo(() => [
    {
      accessorKey: "department",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          {t("department")} <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => t(row.getValue("department")),
    },
    {
      accessorKey: "project",
      header: t("project"),
       cell: ({ row }) => t(row.getValue("project")),
    },
    {
      accessorKey: "allocated",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
           {t("allocated_funds")} <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("allocated"));
        return <div className="text-right font-medium">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount)}</div>;
      },
    },
    {
      accessorKey: "utilized",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
           {t("utilized_funds")} <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("utilized"));
        return <div className="text-right font-medium">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount)}</div>;
      },
    },
  ], [t]);


  const table = useReactTable({
    data: funds,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
  });

  if (loading || !ready) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight text-primary">{t("funds_overview")}</h1>
      <p className="text-muted-foreground mb-6">{t("funds_overview_desc")}</p>
      <Card>
        <CardHeader>
          <CardTitle>{t("public_funds_tracker")}</CardTitle>
          <CardDescription>{t("public_funds_tracker_desc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map(headerGroup => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map(header => (
                      <TableHead key={header.id}>
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map(row => (
                    <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                      {row.getVisibleCells().map(cell => (
                        <TableCell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                      {t("no_results")}
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
                {t("previous")}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                {t("next")}
              </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
