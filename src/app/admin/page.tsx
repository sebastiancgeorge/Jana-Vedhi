
"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { seedDatabase, getGrievances, updateGrievanceStatus, deleteGrievance, type Grievance, type GrievanceStatus } from "./actions";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState, useMemo } from "react";
import { Loader2, Trash2, MoreHorizontal } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { type ColumnDef, flexRender, getCoreRowModel, useReactTable, getPaginationRowModel, getSortedRowModel, getFilteredRowModel } from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";

export default function AdminPage() {
  const { toast } = useToast();
  const [isSeeding, setIsSeeding] = useState(false);
  const [grievances, setGrievances] = useState<Grievance[]>([]);
  const [loadingGrievances, setLoadingGrievances] = useState(true);
  const { user, userRole, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && userRole && userRole !== 'admin') {
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "You do not have permission to view this page.",
      });
      router.push("/");
    }
  }, [user, userRole, loading, router, toast]);
  
  useEffect(() => {
    if(userRole === 'admin') {
      const fetchGrievances = async () => {
        try {
          setLoadingGrievances(true);
          const data = await getGrievances();
          setGrievances(data);
        } catch (error) {
          toast({ variant: "destructive", title: "Error", description: "Could not fetch grievances." });
        } finally {
          setLoadingGrievances(false);
        }
      };
      fetchGrievances();
    }
  }, [userRole, toast]);
  
  
  const handleUpdateStatus = async (id: string, status: GrievanceStatus) => {
    try {
      await updateGrievanceStatus(id, status);
      setGrievances(prev => prev.map(g => g.id === id ? { ...g, status } : g));
      toast({ title: "Success", description: "Grievance status updated." });
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Could not update status.";
      toast({ variant: "destructive", title: "Error", description: msg });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteGrievance(id);
      setGrievances(prev => prev.filter(g => g.id !== id));
      toast({ title: "Success", description: "Grievance deleted." });
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Could not delete grievance.";
      toast({ variant: "destructive", title: "Error", description: msg });
    }
  };


  const columns: ColumnDef<Grievance>[] = useMemo(() => [
    {
      accessorKey: "title",
      header: "Title",
    },
    {
      accessorKey: "type",
      header: "Type",
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("status") as GrievanceStatus;
            const getStatusVariant = () => {
                switch (status) {
                    case 'submitted': return 'secondary';
                    case 'in_progress': return 'default';
                    case 'resolved': return 'outline';
                    default: return 'secondary';
                }
            };
            return <Badge variant={getStatusVariant()}>{status}</Badge>;
        }
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const grievance = row.original;
        return (
          <AlertDialog>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => handleUpdateStatus(grievance.id, "submitted")}>Mark as Submitted</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleUpdateStatus(grievance.id, "in_progress")}>Mark as In Progress</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleUpdateStatus(grievance.id, "resolved")}>Mark as Resolved</DropdownMenuItem>
                <DropdownMenuSeparator />
                 <AlertDialogTrigger asChild>
                    <DropdownMenuItem className="text-destructive focus:text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </DropdownMenuItem>
                 </AlertDialogTrigger>
              </DropdownMenuContent>
            </DropdownMenu>
             <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the grievance from the database.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => handleDelete(grievance.id)} className="bg-destructive hover:bg-destructive/90">
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        );
      },
    },
  ], []);

  const table = useReactTable({
    data: grievances,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  if (loading || !userRole) {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (userRole !== 'admin') {
    return null; 
  }

  const handleSeed = async () => {
    setIsSeeding(true);
    try {
      await seedDatabase();
      const data = await getGrievances();
      setGrievances(data);
      toast({
        title: "Success",
        description: "Database has been seeded with sample data.",
      });
    } catch (error) {
       const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      console.error("Failed to seed database:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to seed the database: ${errorMessage}`,
      });
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight text-primary">Admin Console</h1>
      <p className="text-muted-foreground mb-6">Manage platform data and settings.</p>
      
      <Card>
        <CardHeader>
          <CardTitle>Grievance Management</CardTitle>
          <CardDescription>View, update status, and delete submitted grievances.</CardDescription>
        </CardHeader>
        <CardContent>
          {loadingGrievances ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
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
                        No grievances found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Database Tools</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Database Seeding</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Populate the database with initial sample data. This will overwrite existing data.
            </p>
            <Button onClick={handleSeed} disabled={isSeeding}>
              {isSeeding && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Seed Database
            </Button>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
