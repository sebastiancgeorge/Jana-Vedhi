"use server";

import { seedDatabaseFlow } from "@/ai/flows/seed-database-flow";

export async function seedDatabase() {
  try {
    await seedDatabaseFlow();
  } catch (error) {
    console.error("Error seeding database from action:", error);
    throw new Error("Failed to seed database.");
  }
}
