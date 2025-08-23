"use server";

/**
 * @fileOverview A flow to seed the Firestore database with initial data.
 */

import { ai } from "@/ai/genkit";
import { z } from "genkit";
import { getFirestore, collection, writeBatch, doc } from "firebase/firestore";
import { app } from "@/lib/firebase";

const db = getFirestore(app);

const SeedDatabaseOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

export type SeedDatabaseOutput = z.infer<typeof SeedDatabaseOutputSchema>;

async function seedDatabaseLogic(): Promise<SeedDatabaseOutput> {
  const batch = writeBatch(db);

  // Sample Funds Data
  const fundsData = [
    { id: 'fund1', department: 'Public Works Department', allocated: 5000000, utilized: 3500000, project: 'Road construction at MG Road' },
    { id: 'fund2', department: 'Health Department', allocated: 2000000, utilized: 1500000, project: 'New equipment for General Hospital' },
    { id: 'fund3', department: 'Education Department', allocated: 7500000, utilized: 7000000, project: 'Smart classrooms in 10 schools' },
  ];
  const fundsCol = collection(db, 'funds');
  fundsData.forEach(fund => {
    const docRef = doc(fundsCol, fund.id);
    batch.set(docRef, fund);
  });

  // Sample Budgets Data
  const budgetsData = [
    { id: 'budget1', title: 'Park renovation in Ward 5', description: 'Renovate the children\'s park with new swings and benches.', votes: 120, status: 'open' },
    { id: 'budget2', title: 'Streetlight installation', description: 'Install 50 new LED streetlights in the west zone.', votes: 250, status: 'open' },
    { id: 'budget3', title: 'Community hall construction', description: 'Build a new community hall for public events.', votes: 80, status: 'closed' },
  ];
  const budgetsCol = collection(db, 'budgets');
  budgetsData.forEach(budget => {
    const docRef = doc(budgetsCol, budget.id);
    batch.set(docRef, budget);
  });

  // Sample Politicians Data
  const politiciansData = [
    { id: 'pol1', name: 'Ramesh Chennithala', constituency: 'Haripad', party: 'INC', projects: 5, fundsUtilized: 12000000 },
    { id: 'pol2', name: 'Pinarayi Vijayan', constituency: 'Dharmadam', party: 'CPI(M)', projects: 8, fundsUtilized: 25000000 },
    { id: 'pol3', name: 'V. D. Satheesan', constituency: 'Paravur', party: 'INC', projects: 4, fundsUtilized: 9500000 },
  ];
  const politiciansCol = collection(db, 'politicians');
  politiciansData.forEach(politician => {
    const docRef = doc(politiciansCol, politician.id);
    batch.set(docRef, politician);
  });
  
  // Sample Grievances Data
  const grievancesData = [
    { id: 'griev1', title: 'Pothole on main road', description: 'A large pothole near the bus stand is causing traffic issues.', location: { lat: 9.9312, lng: 76.2673 }, status: 'submitted', type: 'Roads' },
    { id: 'griev2', title: 'Garbage not collected', description: 'Waste has not been collected for a week in our area.', location: { lat: 10.8505, lng: 76.2711 }, status: 'in_progress', type: 'Waste' },
    { id: 'griev3', title: 'Broken streetlight', description: 'The streetlight on our street has been broken for a month.', location: { lat: 8.5241, lng: 76.9366 }, status: 'resolved', type: 'Utilities' },
  ];
  const grievancesCol = collection(db, 'grievances');
  grievancesData.forEach(grievance => {
    const docRef = doc(grievancesCol, grievance.id);
    batch.set(docRef, grievance);
  });

  try {
    await batch.commit();
    console.log("Database seeded successfully.");
    return {
      success: true,
      message: 'Database seeded successfully with sample data.',
    };
  } catch (error) {
    console.error("Error writing to Firestore:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    // We are not re-throwing the error here. Instead we are returning a structured error response.
    // The action on the client side will need to check the 'success' field.
    return {
        success: false,
        message: `Failed to write seed data to Firestore: ${errorMessage}`,
    };
  }
}

export const seedDatabaseFlow = ai.defineFlow(
  {
    name: 'seedDatabaseFlow',
    outputSchema: SeedDatabaseOutputSchema,
  },
  async () => {
    return await seedDatabaseLogic();
  }
);
