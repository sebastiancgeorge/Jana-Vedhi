import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function HeatmapPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight text-primary">Grievance Heatmap</h1>
      <p className="text-muted-foreground mb-6">Visualize the density of grievances across Kerala.</p>
      <Card>
        <CardHeader>
          <CardTitle>Kerala Grievance Map</CardTitle>
          <CardDescription>Filter by issue type, severity, and date range.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>An interactive map with heatmap and clustering features will be displayed here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
