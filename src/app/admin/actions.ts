"use server";

import { seedDatabaseFlow } from "@/ai/flows/seed-database-flow";

export async function seedDatabase() {
  try {
    const result = await seedDatabaseFlow();
    if (!result.success) {
      // If the flow itself indicates failure, throw an error with its message.
      throw new Error(result.message);
    }
    return result;
  } catch (error) {
    console.error("Error seeding database from action:", error);
    // This will catch errors from the flow execution itself, or the one we threw above.
    const errorMessage = error instanceof Error ? error.message : "Failed to seed database.";
    throw new Error(errorMessage);
  }
}
