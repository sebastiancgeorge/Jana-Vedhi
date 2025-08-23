
"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  seedDatabase,
  getGrievances, updateGrievanceStatus, deleteGrievance, type Grievance, type GrievanceStatus,
  getFunds, addFund, updateFund, deleteFund, type Fund, type FundInput,
  getBudgets, addBudget, updateBudget, deleteBudget, type Budget, type BudgetInput,
} from "./actions";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState, useMemo, useCallback } from "react";
import { Loader2, Trash2, MoreHorizontal, PlusCircle } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { type ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const fundSchema = z.object({
    department: z.string().min(1, "Department is required"),
    project: z.string().min(1, "Project is required"),
    allocated: z.coerce.number().min(0, "Allocated funds must be non-negative"),
    utilized: z.coerce.number().min(0, "Utilized funds must be non-negative"),
}).refine(data => data.utilized <= data.allocated, {
    message: "Utilized funds cannot exceed allocated funds",
    path: ["utilized"],
});

const budgetSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  status: z.enum(["open", "closed"]),
  votes: z.coerce.number().min(0).optional(),
});


export default function AdminPage() {
  const { toast } = useToast();
  const [isSeeding, setIsSeeding] = useState(false);
  const { user, userRole, loading } = useAuth();
  const router = useRouter();
  
  const [grievances, setGrievances] = useState<Grievance[]>([]);
  const [funds, setFunds] = useState<Fund[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);

  const [loadingData, setLoadingData] = useState(true);

  // Dialog states
  const [isFundDialogOpen, setIsFundDialogOpen] = useState(false);
  const [editingFund, setEditingFund] = useState<Fund | null>(null);
  const [isBudgetDialogOpen, setIsBudgetDialogOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);


  const fundForm = useForm<z.infer<typeof fundSchema>>({
    resolver: zodResolver(fundSchema),
    defaultValues: { department: "", project: "", allocated: 0, utilized: 0 },
  });

  const budgetForm = useForm<z.infer<typeof budgetSchema>>({
    resolver: zodResolver(budgetSchema),
    defaultValues: { title: "", description: "", status: "open", votes: 0 },
  });
  
  const fetchData = useCallback(async () => {
    try {
      setLoadingData(true);
      const [grievancesData, fundsData, budgetsData] = await Promise.all([
        getGrievances(),
        getFunds(),
        getBudgets()
      ]);
      setGrievances(grievancesData);
      setFunds(fundsData);
      setBudgets(budgetsData);
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Could not fetch platform data." });
    } finally {
      setLoadingData(false);
    }
  }, [toast]);

  useEffect(() => {
    if (!loading && (!userRole || userRole !== 'admin')) {
      toast({ variant: "destructive", title: "Access Denied", description: "You do not have permission." });
      router.push("/");
    } else if (userRole === 'admin') {
      fetchData();
    }
  }, [user, userRole, loading, router, toast, fetchData]);

  // Grievance Handlers
  const handleUpdateGrievanceStatus = async (id: string, status: GrievanceStatus) => {
    await updateGrievanceStatus(id, status);
    fetchData();
    toast({ title: "Success", description: "Grievance status updated." });
  };

  const handleDeleteGrievance = async (id: string) => {
    await deleteGrievance(id);
    fetchData();
    toast({ title: "Success", description: "Grievance deleted." });
  };

  // Fund Handlers
  const handleFundSubmit = async (values: z.infer<typeof fundSchema>) => {
      try {
        if (editingFund) {
            await updateFund(editingFund.id, values);
            toast({ title: "Success", description: "Fund updated." });
        } else {
            await addFund(values);
            toast({ title: "Success", description: "Fund added." });
        }
        fetchData();
        setIsFundDialogOpen(false);
        setEditingFund(null);
      } catch (error) {
          const msg = error instanceof Error ? error.message : "An unknown error occurred.";
          toast({ variant: "destructive", title: "Error", description: msg });
      }
  };
   const handleDeleteFund = async (id: string) => {
      await deleteFund(id);
      fetchData();
      toast({ title: "Success", description: "Fund deleted." });
  };

  // Budget Handlers
  const handleBudgetSubmit = async (values: z.infer<typeof budgetSchema>) => {
    try {
        if (editingBudget) {
            await updateBudget(editingBudget.id, values);
            toast({ title: "Success", description: "Budget proposal updated." });
        } else {
            await addBudget(values);
            toast({ title: "Success", description: "Budget proposal added." });
        }
        fetchData();
        setIsBudgetDialogOpen(false);
        setEditingBudget(null);
    } catch (error) {
        const msg = error instanceof Error ? error.message : "An unknown error occurred.";
        toast({ variant: "destructive", title: "Error", description: msg });
    }
  };

  const handleDeleteBudget = async (id: string) => {
      await deleteBudget(id);
      fetchData();
      toast({ title: "Success", description: "Budget proposal deleted." });
  };
  
  // Table Columns
  const grievanceColumns: ColumnDef<Grievance>[] = useMemo(() => [
    { accessorKey: "title", header: "Title" }, { accessorKey: "type", header: "Type" },
    {
        accessorKey: "status", header: "Status",
        cell: ({ row }) => <Badge variant={row.original.status === 'resolved' ? 'outline' : row.original.status === 'in_progress' ? 'default' : 'secondary'}>{row.original.status}</Badge>
    },
    {
      id: "actions", cell: ({ row }) => <GrievanceActions grievance={row.original} />,
    },
  ], []);
  
  const fundColumns: ColumnDef<Fund>[] = useMemo(() => [
    { accessorKey: "department", header: "Department" }, { accessorKey: "project", header: "Project" },
    { accessorKey: "allocated", header: "Allocated", cell: ({ row }) => `₹${row.original.allocated.toLocaleString()}` },
    { accessorKey: "utilized", header: "Utilized", cell: ({ row }) => `₹${row.original.utilized.toLocaleString()}` },
    { id: "actions", cell: ({ row }) => <FundActions fund={row.original} /> },
  ], []);

  const budgetColumns: ColumnDef<Budget>[] = useMemo(() => [
    { accessorKey: "title", header: "Title" }, { accessorKey: "description", header: "Description" },
    { accessorKey: "votes", header: "Votes" },
    { accessorKey: "status", header: "Status", cell: ({ row }) => <Badge variant={row.original.status === 'open' ? 'secondary' : 'destructive'}>{row.original.status}</Badge> },
    { id: "actions", cell: ({ row }) => <BudgetActions budget={row.original} /> },
  ], []);

  const grievanceTable = useReactTable({ data: grievances, columns: grievanceColumns, getCoreRowModel: getCoreRowModel() });
  const fundTable = useReactTable({ data: funds, columns: fundColumns, getCoreRowModel: getCoreRowModel() });
  const budgetTable = useReactTable({ data: budgets, columns: budgetColumns, getCoreRowModel: getCoreRowModel() });

  // Action Components for Menus
  const GrievanceActions = ({ grievance }: { grievance: Grievance }) => (
      <ActionMenu
          onDelete={() => handleDeleteGrievance(grievance.id)}
          editItems={[
              { label: "Mark as Submitted", onClick: () => handleUpdateGrievanceStatus(grievance.id, "submitted") },
              { label: "Mark as In Progress", onClick: () => handleUpdateGrievanceStatus(grievance.id, "in_progress") },
              { label: "Mark as Resolved", onClick: () => handleUpdateGrievanceStatus(grievance.id, "resolved") },
          ]}
      />
  );
  
  const FundActions = ({ fund }: { fund: Fund }) => (
    <ActionMenu
        onEdit={() => { setEditingFund(fund); fundForm.reset(fund); setIsFundDialogOpen(true); }}
        onDelete={() => handleDeleteFund(fund.id)}
    />
  );

  const BudgetActions = ({ budget }: { budget: Budget }) => (
      <ActionMenu
          onEdit={() => { setEditingBudget(budget); budgetForm.reset(budget); setIsBudgetDialogOpen(true); }}
          onDelete={() => handleDeleteBudget(budget.id)}
      />
  );

  const handleSeed = async () => {
    setIsSeeding(true);
    try {
      await seedDatabase();
      await fetchData();
      toast({ title: "Success", description: "Database has been seeded." });
    } catch (error) {
       const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      toast({ variant: "destructive", title: "Error", description: `Failed to seed: ${errorMessage}` });
    } finally {
      setIsSeeding(false);
    }
  };

  if (loading || !userRole) {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }
  if (userRole !== 'admin') {
    return null; 
  }
  
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight text-primary">Admin Console</h1>
      <p className="text-muted-foreground mb-6">Manage platform data and settings.</p>
      
      {loadingData ? (
        <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>
      ) : (
        <>
          <DataTableCard
            title="Grievance Management"
            description="View, update status, and delete submitted grievances."
            table={grievanceTable}
            columns={grievanceColumns}
          />

          <Dialog open={isFundDialogOpen} onOpenChange={(isOpen) => { setIsFundDialogOpen(isOpen); if (!isOpen) setEditingFund(null); }}>
             <DataTableCard
                title="Fund Management"
                description="Add, edit, and delete fund allocation records."
                table={fundTable}
                columns={fundColumns}
                onAdd={() => { setEditingFund(null); fundForm.reset(); setIsFundDialogOpen(true); }}
             />
             <FundDialogContent form={fundForm} onSubmit={handleFundSubmit} isEditing={!!editingFund} />
          </Dialog>

          <Dialog open={isBudgetDialogOpen} onOpenChange={(isOpen) => { setIsBudgetDialogOpen(isOpen); if (!isOpen) setEditingBudget(null); }}>
              <DataTableCard
                title="Budget Proposal Management"
                description="Add, edit, and delete budget proposals for voting."
                table={budgetTable}
                columns={budgetColumns}
                onAdd={() => { setEditingBudget(null); budgetForm.reset(); setIsBudgetDialogOpen(true); }}
              />
              <BudgetDialogContent form={budgetForm} onSubmit={handleBudgetSubmit} isEditing={!!editingBudget} />
          </Dialog>
        </>
      )}
      
      <Card>
        <CardHeader><CardTitle>Database Tools</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">Populate the database with initial sample data. This will overwrite existing data.</p>
          <Button onClick={handleSeed} disabled={isSeeding}>
            {isSeeding && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Seed Database
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}


// Reusable Components
const DataTableCard = ({ title, description, table, columns, onAdd }: any) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </div>
            {onAdd && (
                <Button onClick={onAdd}><PlusCircle className="mr-2 h-4 w-4" /> Add New</Button>
            )}
        </CardHeader>
        <CardContent>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup: any) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header: any) => <TableHead key={header.id}>{flexRender(header.column.columnDef.header, header.getContext())}</TableHead>)}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? table.getRowModel().rows.map((row: any) => (
                            <TableRow key={row.id}>
                                {row.getVisibleCells().map((cell: any) => <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>)}
                            </TableRow>
                        )) : <TableRow><TableCell colSpan={columns.length} className="h-24 text-center">No records found.</TableCell></TableRow>}
                    </TableBody>
                </Table>
            </div>
        </CardContent>
    </Card>
);

const ActionMenu = ({ onEdit, onDelete, editItems }: { onEdit?: () => void, onDelete: () => void, editItems?: { label: string, onClick: () => void }[] }) => (
    <AlertDialog>
        <DropdownMenu>
            <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                {onEdit && <DropdownMenuItem onClick={onEdit}>Edit</DropdownMenuItem>}
                {editItems?.map(item => <DropdownMenuItem key={item.label} onClick={item.onClick}>{item.label}</DropdownMenuItem>)}
                <DropdownMenuSeparator />
                <AlertDialogTrigger asChild><DropdownMenuItem className="text-destructive focus:text-destructive"><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem></AlertDialogTrigger>
            </DropdownMenuContent>
        </DropdownMenu>
        <AlertDialogContent>
            <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This action is permanent and cannot be undone.</AlertDialogDescription></AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={onDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
);


const FundDialogContent = ({ form, onSubmit, isEditing }: { form: any, onSubmit: (values: any) => void, isEditing: boolean }) => (
    <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
            <DialogTitle>{isEditing ? "Edit Fund" : "Add Fund"}</DialogTitle>
            <DialogDescription>Fill in the details for the fund record.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="department" render={({ field }) => (
                    <FormItem><FormLabel>Department</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                 <FormField control={form.control} name="project" render={({ field }) => (
                    <FormItem><FormLabel>Project</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                 <FormField control={form.control} name="allocated" render={({ field }) => (
                    <FormItem><FormLabel>Allocated Funds</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                 <FormField control={form.control} name="utilized" render={({ field }) => (
                    <FormItem><FormLabel>Utilized Funds</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <DialogFooter>
                    <DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose>
                    <Button type="submit" disabled={form.formState.isSubmitting}>{form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save</Button>
                </DialogFooter>
            </form>
        </Form>
    </DialogContent>
);

const BudgetDialogContent = ({ form, onSubmit, isEditing }: { form: any, onSubmit: (values: any) => void, isEditing: boolean }) => (
    <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
            <DialogTitle>{isEditing ? "Edit Budget" : "Add Budget"}</DialogTitle>
            <DialogDescription>Fill in the details for the budget proposal.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                 <FormField control={form.control} name="title" render={({ field }) => (
                    <FormItem><FormLabel>Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                 <FormField control={form.control} name="description" render={({ field }) => (
                    <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="status" render={({ field }) => (
                    <FormItem><FormLabel>Status</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent><SelectItem value="open">Open</SelectItem><SelectItem value="closed">Closed</SelectItem></SelectContent>
                    </Select><FormMessage /></FormItem>
                )} />
                 <FormField control={form.control} name="votes" render={({ field }) => (
                    <FormItem><FormLabel>Votes</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <DialogFooter>
                    <DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose>
                    <Button type="submit" disabled={form.formState.isSubmitting}>{form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save</Button>
                </DialogFooter>
            </form>
        </Form>
    </DialogContent>
);
