import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function NotificationsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight text-primary">Notifications</h1>
      <p className="text-muted-foreground mb-6">Manage your push notification preferences.</p>
      <Card>
        <CardHeader>
          <CardTitle>Notification Settings</CardTitle>
          <CardDescription>Opt-in to topics you care about.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>A list of notification topics (district, LSG, categories) with toggles will be here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
