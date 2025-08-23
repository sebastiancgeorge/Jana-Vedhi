
"use server";

import { seedDatabaseFlow } from "@/ai/flows/seed-database-flow";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, updateDoc, deleteDoc, addDoc, serverTimestamp, type Timestamp } from "firebase/firestore";
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

// Grievance Management
export type GrievanceStatus = "submitted" | "in_progress" | "resolved";

export interface Grievance {
    id: string;
    title: string;
    description: string;
    status: GrievanceStatus;
    type: string;
    userId: string;
    createdAt: Timestamp; // Correctly type the Firestore Timestamp
}


export async function getGrievances(): Promise<Grievance[]> {
    try {
        const grievancesCol = collection(db, "grievances");
        const snapshot = await getDocs(grievancesCol);
         // The data is already serializable as long as we type it correctly.
         // Next.js handles the conversion of Timestamps automatically if they are typed.
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


// Fund Management
export interface Fund {
  id: string;
  department: string;
  project: string;
  allocated: number;
  utilized: number;
}
export type FundInput = Omit<Fund, 'id'>;


export async function getFunds(): Promise<Fund[]> {
    try {
        const fundsCol = collection(db, "funds");
        const snapshot = await getDocs(fundsCol);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Fund));
    } catch (error) {
        console.error("Error fetching funds:", error);
        throw new Error("Failed to fetch funds.");
    }
}

export async function addFund(fund: FundInput) {
    try {
        await addDoc(collection(db, "funds"), fund);
        revalidatePath("/admin");
        return { success: true };
    } catch (error) {
        console.error("Error adding fund:", error);
        throw new Error("Failed to add fund.");
    }
}

export async function updateFund(id: string, fund: Partial<FundInput>) {
    try {
        const fundRef = doc(db, "funds", id);
        await updateDoc(fundRef, fund);
        revalidatePath("/admin");
        return { success: true };
    } catch (error) {
        console.error("Error updating fund:", error);
        throw new Error("Failed to update fund.");
    }
}

export async function deleteFund(id: string) {
    try {
        await deleteDoc(doc(db, "funds", id));
        revalidatePath("/admin");
        return { success: true };
    } catch (error) {
        console.error("Error deleting fund:", error);
        throw new Error("Failed to delete fund.");
    }
}

// Budget Management
export interface Budget {
  id: string;
  title: string;
  description: string;
  votes: number;
  status: 'open' | 'closed';
}

export type BudgetInput = Omit<Budget, 'id' | 'votes'> & { votes?: number };

export async function getBudgets(): Promise<Budget[]> {
    try {
        const budgetsCol = collection(db, "budgets");
        const snapshot = await getDocs(budgetsCol);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Budget));
    } catch (error) {
        console.error("Error fetching budgets:", error);
        throw new Error("Failed to fetch budgets.");
    }
}

export async function addBudget(budget: BudgetInput) {
    try {
        await addDoc(collection(db, "budgets"), { ...budget, votes: budget.votes || 0 });
        revalidatePath("/admin");
        return { success: true };
    } catch (error) {
        console.error("Error adding budget:", error);
        throw new Error("Failed to add budget.");
    }
}

export async function updateBudget(id: string, budget: Partial<BudgetInput>) {
    try {
        const budgetRef = doc(db, "budgets", id);
        await updateDoc(budgetRef, budget);
        revalidatePath("/admin");
        return { success: true };
    } catch (error) {
        console.error("Error updating budget:", error);
        throw new Error("Failed to update budget.");
    }
}

export async function deleteBudget(id: string) {
    try {
        await deleteDoc(doc(db, "budgets", id));
        revalidatePath("/admin");
        return { success: true };
    } catch (error)
        console.error("Error deleting budget:", error);
        throw new Error("Failed to delete budget.");
    }
}
