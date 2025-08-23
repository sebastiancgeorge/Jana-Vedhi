import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function ProfilePage() {
  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight text-primary">User Profile</h1>
      <p className="text-muted-foreground mb-6">Manage your personal data and preferences.</p>
      <Card>
        <CardHeader>
          <CardTitle>My Information</CardTitle>
          <CardDescription>Update your profile details and preferences.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>User profile form with fields for managing data will be here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
