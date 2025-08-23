
"use server";

import { seedDatabaseFlow } from "@/ai/flows/seed-database-flow";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { revalidatePath } from "next/cache";

export async function seedDatabase() {
  try {
    const result = await seedDatabaseFlow();
    if (!result.success) {
      throw new Error(result.message);
    }
    revalidatePath("/admin");
    return result;
  } catch (error) {
    console.error("Error seeding database from action:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to seed database.";
    throw new Error(errorMessage);
  }
}

export type GrievanceStatus = "submitted" | "in_progress" | "resolved";

export interface Grievance {
    id: string;
    title: string;
    description: string;
    status: GrievanceStatus;
    type: string;
    userId: string;
    createdAt: any;
}


export async function getGrievances(): Promise<Grievance[]> {
    try {
        const grievancesCol = collection(db, "grievances");
        const snapshot = await getDocs(grievancesCol);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Grievance));
    } catch (error) {
        console.error("Error fetching grievances:", error);
        throw new Error("Failed to fetch grievances.");
    }
}

export async function updateGrievanceStatus(id: string, status: GrievanceStatus) {
    try {
        const grievanceRef = doc(db, "grievances", id);
        await updateDoc(grievanceRef, { status });
        revalidatePath("/admin");
        return { success: true };
    } catch (error) {
        console.error("Error updating grievance status:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        throw new Error(`Failed to update status: ${errorMessage}`);
    }
}

export async function deleteGrievance(id: string) {
    try {
        const grievanceRef = doc(db, "grievances", id);
        await deleteDoc(grievanceRef);
        revalidatePath("/admin");
        return { success: true };
    } catch (error) {
        console.error("Error deleting grievance:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        throw new Error(`Failed to delete grievance: ${errorMessage}`);
    }
}
