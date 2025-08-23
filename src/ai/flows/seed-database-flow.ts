"use server";

/**
 * @fileOverview A flow to seed the Firestore database with initial data.
 */

import { ai } from "@/ai/genkit";
import { z } from "genkit";
import { getFirestore, collection, writeBatch, doc } from "firebase/firestore";
import { app } from "@/lib/firebase"; // Using existing firebase app instance

const db = getFirestore(app);

const SeedDatabaseOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

export async function seedDatabase(input: void): Promise<z.infer<typeof SeedDatabaseOutputSchema>> {
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
    return {
      success: true,
      message: 'Database seeded successfully with sample data.',
    };
  } catch (error) {
    console.error("Error seeding database:", error);
    // It's better to re-throw the original error or a new error with more context
    if (error instanceof Error) {
        throw new Error(`Failed to write seed data to Firestore: ${error.message}`);
    }
    throw new Error("Failed to write seed data to Firestore due to an unknown error.");
  }
}


export const seedDatabaseFlow = ai.defineFlow(
  {
    name: 'seedDatabaseFlow',
    outputSchema: SeedDatabaseOutputSchema,
  },
  seedDatabase
);

// This is to update the action file to call the flow correctly.
// The existing `seedDatabase` in `actions.ts` calls `seedDatabaseFlow()` which is correct.
// The original `seedDatabaseFlow` was an async function, not a flow.
// I've wrapped it in `ai.defineFlow` and named it `seedDatabaseFlow`.
// The original `seedDatabaseFlow` function is now named `seedDatabase` and is the flow's implementation.
// This is to avoid a name collision.
// I'll also update the admin action to call this flow.
// No, the action already calls `seedDatabaseFlow`. The problem is that the `seedDatabaseFlow` was not a flow. It is now.

// I will also fix the `admin/actions.ts` file to ensure it's calling the flow correctly.
// Let's check `admin/actions.ts`
// import { seedDatabaseFlow } from "@/ai/flows/seed-database-flow";
// export async function seedDatabase() { ... await seedDatabaseFlow(); ... }
// This is correct. `seedDatabaseFlow` is exported from the flow file.

// The issue is in the old seed-database-flow.ts.
// - It had a helper function `doc` that was shadowing the imported `doc`
// - `writeBatch` was used but not `doc` to specify document IDs.
// - The main `seedDatabaseFlow` was an async function, not a Genkit flow.
// I have addressed all these issues in the new version.
// The new version should work as expected.
// I will just provide the change for `seed-database-flow.ts`.
// I also noticed that the `admin/actions.ts` calls `seedDatabaseFlow` which is now a flow.
// The flow takes no arguments. The action calls it with no arguments. This is correct.

// Let's re-examine `src/ai/flows/seed-database-flow.ts`
// I defined `seedDatabase` as the implementation and then wrapped it in `seedDatabaseFlow`.
// I am exporting `seedDatabaseFlow`. The admin action imports and uses that. This is good.
// The `seedDatabase` function has `input: void`. The flow also has no input schema, which is correct.
// Looks good. I'll make the change.
// The error was that `doc` was not imported and that the batch was not using it correctly.
// The `doc(docRef, fund.id)` was wrong. It should be `doc(collectionRef, id)`.
// `const docRef = collection(db, 'funds'); batch.set(doc(docRef, fund.id), fund);` -> WRONG
// Correct is:
// `const fundsCol = collection(db, 'funds'); const docRef = doc(fundsCol, fund.id); batch.set(docRef, fund);`
// This is what I have implemented.

// The old file also had a `seedDatabaseFlowInternal`. It should be `seedDatabaseFlow`.
// I've corrected that.

// The old file was also missing an import for `doc` from `firebase/firestore`.
// My new file has it: `import { getFirestore, collection, writeBatch, doc } from "firebase/firestore";`

// The old `seedDatabaseFlow` function is now the implementation for the flow, and I've renamed it to `seedDatabase` to avoid conflicts.
// The exported flow is `seedDatabaseFlow`.
// The admin action calls `seedDatabaseFlow()`. When you call a flow function, you don't need `await` if it's from a server component/action to the flow. But `actions.ts` is just a server action, not a component. So `await` is correct.
// And `seedDatabase` in actions.ts is an async function. Yes, that is correct.

// The changes look solid.
