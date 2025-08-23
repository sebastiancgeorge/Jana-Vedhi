
"use client";

import { useEffect, useState, useMemo } from "react";
import { type ColumnDef, flexRender, getCoreRowModel, useReactTable, getPaginationRowModel, getSortedRowModel, getFilteredRowModel, type SortingState, type ColumnFiltersState } from "@tanstack/react-table";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Loader2 } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bar, CartesianGrid, XAxis, YAxis, Legend, BarChart as RechartsBarChart, PieChart as RechartsPieChart, Pie, Cell } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

interface Fund {
  id: string;
  department: string;
  project: string;
  allocated: number;
  utilized: number;
}

interface PieChartData {
    name: string;
    value: number;
    fill: string;
}

export default function FundsPage() {
  const [funds, setFunds] = useState<Fund[]>([]);
  const [loading, setLoading] = useState(true);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const { t, ready } = useTranslation();
  const PIE_COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];


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

  const departments = useMemo(() => {
    const allDepartments = funds.map(fund => fund.department);
    return [...new Set(allDepartments)];
  }, [funds]);
  
  const barChartData = useMemo(() => {
    const dataByDept: { [key: string]: { allocated: number; utilized: number } } = {};
    funds.forEach(fund => {
        if (!dataByDept[fund.department]) {
            dataByDept[fund.department] = { allocated: 0, utilized: 0 };
        }
        dataByDept[fund.department].allocated += fund.allocated;
        dataByDept[fund.department].utilized += fund.utilized;
    });
    return Object.keys(dataByDept).map(dept => ({
        department: t(dept),
        allocated: dataByDept[dept].allocated,
        utilized: dataByDept[dept].utilized
    }));
  }, [funds, t]);
  
  const pieChartData: PieChartData[] = useMemo(() => {
    const dataByDept: { [key: string]: number } = {};
    funds.forEach(fund => {
        if (!dataByDept[fund.department]) {
            dataByDept[fund.department] = 0;
        }
        dataByDept[fund.department] += fund.allocated;
    });
     return Object.keys(dataByDept).map((dept, index) => ({
        name: t(dept),
        value: dataByDept[dept],
        fill: PIE_COLORS[index % PIE_COLORS.length]
    }));
  }, [funds, t, PIE_COLORS]);


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
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
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
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-primary">{t("funds_overview")}</h1>
        <p className="text-muted-foreground">{t("funds_overview_desc")}</p>
      </header>
       <div className="grid gap-6 md:grid-cols-2">
         <Card>
          <CardHeader>
              <CardTitle>Fund Utilization by Department</CardTitle>
              <CardDescription>Comparison of allocated vs. utilized funds.</CardDescription>
          </CardHeader>
          <CardContent>
              <ChartContainer config={{
                  allocated: { label: t('allocated_funds'), color: "hsl(var(--chart-2))" },
                  utilized: { label: t('utilized_funds'), color: "hsl(var(--chart-1))" },
              }} className="h-[300px] w-full">
                  <RechartsBarChart data={barChartData} margin={{ top: 20, right: 20, bottom: 5, left: 0 }}>
                      <CartesianGrid vertical={false} />
                      <XAxis dataKey="department" tickLine={false} tickMargin={10} axisLine={false} angle={-45} textAnchor="end" height={80} />
                      <YAxis tickFormatter={(value) => `₹${Number(value) / 100000}L`} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Bar dataKey="allocated" fill="var(--color-allocated)" radius={4} />
                      <Bar dataKey="utilized" fill="var(--color-utilized)" radius={4} />
                  </RechartsBarChart>
              </ChartContainer>
          </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>Fund Distribution by Department</CardTitle>
                <CardDescription>Proportion of total funds allocated to each department.</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center">
                <ChartContainer config={{}} className="h-[300px] w-full">
                    <RechartsPieChart>
                         <ChartTooltip content={<ChartTooltipContent />} />
                         <Legend />
                        <Pie data={pieChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100}>
                            {pieChartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                        </Pie>
                    </RechartsPieChart>
                </ChartContainer>
            </CardContent>
        </Card>
       </div>
      <Card>
        <CardHeader>
          <CardTitle>{t("public_funds_tracker")}</CardTitle>
          <CardDescription>{t("public_funds_tracker_desc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center py-4">
            <Select
              value={(table.getColumn("department")?.getFilterValue() as string) ?? ""}
              onValueChange={(value) => table.getColumn("department")?.setFilterValue(value === "all" ? "" : value)}
            >
              <SelectTrigger className="w-[280px]">
                <SelectValue placeholder={t("department")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("all_departments")}</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {t(dept)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
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
