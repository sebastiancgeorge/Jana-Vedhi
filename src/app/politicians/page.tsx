import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function PoliticiansPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight text-primary">Politician &amp; Official Tracker</h1>
      <p className="text-muted-foreground mb-6">Find official profiles with project and fund summaries.</p>
      <Card>
        <CardHeader>
          <CardTitle>Public Officials</CardTitle>
          <CardDescription>Search and view profiles of MLAs and other officials.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>A searchable list or grid of politician profiles will be displayed here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
