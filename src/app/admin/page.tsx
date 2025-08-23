"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { seedDatabase } from "./actions";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Loader2 } from "lucide-react";

export default function AdminPage() {
  const { toast } = useToast();
  const [isSeeding, setIsSeeding] = useState(false);

  const handleSeed = async () => {
    setIsSeeding(true);
    try {
      await seedDatabase();
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
    <div>
      <h1 className="text-3xl font-bold tracking-tight text-primary">Admin Console</h1>
      <p className="text-muted-foreground mb-6">Manage platform data and settings.</p>
      <Card>
        <CardHeader>
          <CardTitle>Admin Dashboard</CardTitle>
          <CardDescription>Overview of the platform's key metrics.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>Admin-specific dashboards and CRUD operations will be available here.</p>
          <div>
            <h3 className="font-semibold mb-2">Database Seeding</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Click the button below to populate the Firestore database with initial sample data for various features like funds, budgets, and politicians. This is useful for development and demonstration.
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
