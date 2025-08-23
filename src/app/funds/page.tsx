import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function FundsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight text-primary">Funds Overview</h1>
      <p className="text-muted-foreground mb-6">Track department-wise fund allocation and project details.</p>
      <Card>
        <CardHeader>
          <CardTitle>Public Funds Tracker</CardTitle>
          <CardDescription>Filter, sort, and view project funding information.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>A dynamic table or dashboard for tracking funds will be implemented here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
