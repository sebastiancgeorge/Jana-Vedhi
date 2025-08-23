import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function AdminPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight text-primary">Admin Console</h1>
      <p className="text-muted-foreground mb-6">Manage platform data and settings.</p>
      <Card>
        <CardHeader>
          <CardTitle>Admin Dashboard</CardTitle>
          <CardDescription>Overview of the platform's key metrics.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Admin-specific dashboards and CRUD operations will be available here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
