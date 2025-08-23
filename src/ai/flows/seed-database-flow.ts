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

  // Sample Users Data
  const usersData = [
    { id: 'user1', email: 'citizen1@example.com', aadhaar: '111122223333', role: 'citizen', aadhaarVerified: true, createdAt: new Date() },
    { id: 'user2', email: 'citizen2@example.com', aadhaar: '444455556666', role: 'citizen', aadhaarVerified: true, createdAt: new Date() },
    { id: 'user3', email: 'citizen3@example.com', aadhaar: '123412341234', role: 'citizen', aadhaarVerified: true, createdAt: new Date() },
    { id: 'user4', email: 'citizen4@example.com', aadhaar: '567856785678', role: 'citizen', aadhaarVerified: true, createdAt: new Date() },
    { id: 'user5', email: 'citizen5@example.com', aadhaar: '987698769876', role: 'citizen', aadhaarVerified: true, createdAt: new Date() },
    { id: 'user6', email: 'citizen6@example.com', aadhaar: '432143214321', role: 'citizen', aadhaarVerified: true, createdAt: new Date() },
    { id: 'user7', email: 'citizen7@example.com', aadhaar: '876587658765', role: 'citizen', aadhaarVerified: true, createdAt: new Date() },
    { id: 'admin1', email: 'admin@example.gov', aadhaar: '777788889999', role: 'admin', aadhaarVerified: true, createdAt: new Date() },
  ];
  const usersCol = collection(db, 'users');
  usersData.forEach(user => {
    const docRef = doc(usersCol, user.id);
    batch.set(docRef, user);
  });

  // Sample Funds Data
  const fundsData = [
    { id: 'fund1', department: 'Public Works Department', allocated: 5000000, utilized: 3500000, project: 'Road construction at MG Road' },
    { id: 'fund2', department: 'Health Department', allocated: 2000000, utilized: 1500000, project: 'New equipment for General Hospital' },
    { id: 'fund3', department: 'Education Department', allocated: 7500000, utilized: 7000000, project: 'Smart classrooms in 10 schools' },
    { id: 'fund4', department: 'Water Authority', allocated: 3000000, utilized: 1200000, project: 'Pipeline extension to rural areas' },
    { id: 'fund5', department: 'Social Welfare', allocated: 1500000, utilized: 1450000, project: 'Mid-day meal scheme for schools' },
    { id: 'fund6', department: 'Tourism Department', allocated: 4000000, utilized: 3800000, project: 'Beach beautification project' },
    { id: 'fund7', department: 'Agriculture Department', allocated: 2500000, utilized: 2000000, project: 'Subsidy for organic farming' },
    { id: 'fund8', department: 'IT Department', allocated: 6000000, utilized: 5500000, project: 'Free Wi-Fi hotspots in city centers' },
    { id: 'fund9', department: 'Public Works Department', allocated: 3200000, utilized: 3000000, project: 'Bridge repair over Periyar river' },
    { id: 'fund10', department: 'Health Department', allocated: 1800000, utilized: 1750000, project: 'Mobile clinic for coastal areas' },
    { id: 'fund11', department: 'Education Department', allocated: 4500000, utilized: 4000000, project: 'Scholarship for underprivileged students' },
    { id: 'fund12', department: 'Social Welfare', allocated: 2200000, utilized: 2100000, project: 'Pension scheme for the elderly' },
    { id: 'fund13', department: 'Fisheries Department', allocated: 1900000, utilized: 1500000, project: 'Modernization of fishing harbors' },
    { id: 'fund14', department: 'Environment Department', allocated: 1000000, utilized: 800000, project: 'Afforestation drive in Western Ghats' },
    { id: 'fund15', department: 'Public Works Department', allocated: 6500000, utilized: 6500000, project: 'New flyover construction at Kazhakootam' },
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
    { id: 'budget4', title: 'Waste management system upgrade', description: 'Purchase new bins and a collection truck for the city.', votes: 310, status: 'open' },
    { id: 'budget5', title: 'Public library book acquisition', description: 'Acquire 1000 new books for the public library.', votes: 150, status: 'closed' },
    { id: 'budget6', title: 'Rainwater harvesting initiative', description: 'Provide subsidies for installing rainwater harvesting systems.', votes: 180, status: 'open' },
    { id: 'budget7', title: 'Free public gym setup', description: 'Set up an open-air gym in the central park.', votes: 220, status: 'open' },
    { id: 'budget8', title: 'E-waste collection drive', description: 'Organize a monthly e-waste collection program.', votes: 95, status: 'closed' },
    { id: 'budget9', title: 'CCTV installation for safety', description: 'Install security cameras in key residential areas.', votes: 450, status: 'open' },
    { id: 'budget10', title: 'Beautification of riverfront', description: 'Develop a walkway and seating along the river.', votes: 280, status: 'closed' },
    { id: 'budget11', title: 'Skill development workshops', description: 'Conduct free workshops for unemployed youth.', votes: 170, status: 'open' },
    { id: 'budget12', title: 'Animal shelter upgrade', description: 'Expand and modernize the city animal shelter.', votes: 300, status: 'open' },
    { id: 'budget13', title: 'Public toilet construction', description: 'Build and maintain clean public toilets in market areas.', votes: 190, status: 'closed' },
    { id: 'budget14', title: 'Solar panel subsidies for homes', description: 'Promote renewable energy with home solar panel subsidies.', votes: 350, status: 'open' },
    { id: 'budget15', title: 'Digital literacy program for seniors', description: 'Provide free classes on using smartphones and computers.', votes: 130, status: 'closed' },
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
    { id: 'pol4', name: 'K. K. Shailaja', constituency: 'Mattannur', party: 'CPI(M)', projects: 6, fundsUtilized: 18000000 },
    { id: 'pol5', name: 'Oommen Chandy', constituency: 'Puthuppally', party: 'INC', projects: 7, fundsUtilized: 15000000 },
    { id: 'pol6', name: 'E. P. Jayarajan', constituency: 'Mattannur', party: 'CPI(M)', projects: 5, fundsUtilized: 11000000 },
    { id: 'pol7', name: 'K. Muraleedharan', constituency: 'Nemom', party: 'INC', projects: 3, fundsUtilized: 8500000 },
    { id: 'pol8', name: 'A. K. Balan', constituency: 'Tarur', party: 'CPI(M)', projects: 7, fundsUtilized: 16000000 },
    { id: 'pol9', name: 'T. M. Thomas Isaac', constituency: 'Alappuzha', party: 'CPI(M)', projects: 9, fundsUtilized: 22000000 },
    { id: 'pol10', name: 'P. K. Kunhalikutty', constituency: 'Vengara', party: 'IUML', projects: 6, fundsUtilized: 14000000 },
  ];
  const politiciansCol = collection(db, 'politicians');
  politiciansData.forEach(politician => {
    const docRef = doc(politiciansCol, politician.id);
    batch.set(docRef, politician);
  });
  
  // Sample Grievances Data
  const grievancesData = [
    { id: 'griev1', title: 'Pothole on main road', description: 'A large pothole near the bus stand is causing traffic issues.', location: { lat: 9.9312, lng: 76.2673 }, status: 'submitted', type: 'Roads', createdAt: new Date() },
    { id: 'griev2', title: 'Garbage not collected', description: 'Waste has not been collected for a week in our area.', location: { lat: 10.8505, lng: 76.2711 }, status: 'in_progress', type: 'Waste', createdAt: new Date() },
    { id: 'griev3', title: 'Broken streetlight', description: 'The streetlight on our street has been broken for a month.', location: { lat: 8.5241, lng: 76.9366 }, status: 'resolved', type: 'Utilities', createdAt: new Date() },
    { id: 'griev4', title: 'Leaking water pipe', description: 'Clean water is being wasted due to a leak in the main pipeline.', location: { lat: 9.5916, lng: 76.5222 }, status: 'submitted', type: 'Water', createdAt: new Date() },
    { id: 'griev5', title: 'Clogged drainage system', description: 'The drainage in our locality is clogged, causing waterlogging.', location: { lat: 11.2588, lng: 75.7804 }, status: 'in_progress', type: 'Sanitation', createdAt: new Date() },
    { id: 'griev6', title: 'Irregular bus service', description: 'The public bus service is highly irregular and unreliable.', location: { lat: 9.9679, lng: 76.2844 }, status: 'submitted', type: 'Transportation', createdAt: new Date() },
    { id: 'griev7', title: 'Encroachment on public park', description: 'A portion of the public park has been illegally encroached upon.', location: { lat: 8.4856, lng: 76.9535 }, status: 'in_progress', type: 'Other', createdAt: new Date() },
    { id: 'griev8', title: 'Damaged playground equipment', description: 'The swings and slides in the children\'s park are broken.', location: { lat: 10.5276, lng: 76.2144 }, status: 'resolved', type: 'Utilities', createdAt: new Date() },
    { id: 'griev9', title: 'Stray dog menace', description: 'A large number of stray dogs are causing a nuisance and safety hazard.', location: { lat: 11.6643, lng: 75.5537 }, status: 'submitted', type: 'Other', createdAt: new Date() },
    { id: 'griev10', title: 'Poor road lighting', description: 'The lighting on the highway bypass is inadequate, leading to accidents.', location: { lat: 9.4933, lng: 76.3278 }, status: 'in_progress', type: 'Roads', createdAt: new Date() },
    { id: 'griev11', title: 'Illegal dumping of waste in river', description: 'Construction debris and other waste is being dumped into the river.', location: { lat: 10.1633, lng: 76.6234 }, status: 'submitted', type: 'Waste', createdAt: new Date() },
    { id: 'griev12', title: 'Frequent power outages', description: 'We are experiencing multiple power cuts every day in our area.', location: { lat: 8.7642, lng: 76.7145 }, status: 'resolved', type: 'Utilities', createdAt: new Date() },
    { id: 'griev13', title: 'Contaminated water supply', description: 'The tap water has a foul smell and appears to be contaminated.', location: { lat: 10.7766, lng: 76.0125 }, status: 'in_progress', type: 'Water', createdAt: new Date() },
    { id: 'griev14', title: 'Lack of public toilets', description: 'There are no public toilets available in the main market area.', location: { lat: 11.2588, lng: 75.7804 }, status: 'submitted', type: 'Sanitation', createdAt: new Date() },
    { id: 'griev15', title: 'Unfinished road work', description: 'The road work started 6 months ago but has been left unfinished.', location: { lat: 9.9312, lng: 76.2673 }, status: 'in_progress', type: 'Roads', createdAt: new Date() },
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
