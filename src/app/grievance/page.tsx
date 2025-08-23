import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function GrievancePage() {
  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight text-primary">Submit a Grievance</h1>
      <p className="text-muted-foreground mb-6">Report issues in your area for resolution.</p>
      <Card>
        <CardHeader>
          <CardTitle>New Grievance Form</CardTitle>
          <CardDescription>Please provide the details of your grievance below.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>The form for submitting grievances with geolocation and photo upload will be here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
