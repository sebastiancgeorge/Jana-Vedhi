"use server";

import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  runTransaction,
} from "firebase/firestore";

export interface Budget {
  id: string;
  title: string;
  description: string;
  votes: number;
  status: "open" | "closed";
  votedBy: string[];
}

export async function getBudgets(): Promise<Budget[]> {
  const budgetsCol = collection(db, "budgets");
  const snapshot = await getDocs(budgetsCol);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Budget));
}

export async function toggleVote(budgetId: string, userId: string, hasVoted: boolean): Promise<{ success: boolean, newVotes: number }> {
    if (!userId) {
        throw new Error("User must be logged in to vote.");
    }

  const budgetRef = doc(db, "budgets", budgetId);

  try {
    const newVoteCount = await runTransaction(db, async (transaction) => {
        const budgetDoc = await transaction.get(budgetRef);
        if (!budgetDoc.exists()) {
            throw new Error("Budget proposal not found.");
        }

        const data = budgetDoc.data() as Budget;

        if (data.status === 'closed') {
            throw new Error("Voting on this budget is closed.");
        }

        const currentVotes = data.votes || 0;
        const votedBy = data.votedBy || [];
        let newVotes;

        if (hasVoted) {
            // User is withdrawing their vote
             if (!votedBy.includes(userId)) {
                // To prevent inconsistencies, though the UI should prevent this.
                return currentVotes;
            }
            newVotes = currentVotes - 1;
            transaction.update(budgetRef, { 
                votes: newVotes,
                votedBy: arrayRemove(userId)
            });
        } else {
            // User is casting a vote
            if (votedBy.includes(userId)) {
                // To prevent inconsistencies, though the UI should prevent this.
                return currentVotes;
            }
            newVotes = currentVotes + 1;
            transaction.update(budgetRef, {
                votes: newVotes,
                votedBy: arrayUnion(userId)
            });
        }
        return newVotes;
    });

    return { success: true, newVotes: newVoteCount };
  } catch (error) {
    console.error("Error toggling vote:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    throw new Error(errorMessage);
  }
}
