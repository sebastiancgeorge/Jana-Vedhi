import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function BudgetPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight text-primary">Budget Voting</h1>
      <p className="text-muted-foreground mb-6">Participate in local governance by voting on budget proposals.</p>
      <Card>
        <CardHeader>
          <CardTitle>Open Budgets</CardTitle>
          <CardDescription>Review and vote on the following budget proposals.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>A list of open budgets with voting options will be displayed here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
