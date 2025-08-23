
"use server";

import { db } from "@/lib/firebase";
import { collection, getDocs, query, where, orderBy, type Timestamp } from "firebase/firestore";

export interface Grievance {
  id: string;
  title: string;
  description: string;
  status: 'submitted' | 'in_progress' | 'resolved';
  type: string;
  createdAt: Timestamp;
}

export async function getUserGrievances(userId: string): Promise<Grievance[]> {
  if (!userId) {
    return [];
  }

  try {
    const grievancesRef = collection(db, "grievances");
    const q = query(
      grievancesRef,
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(q);
    // Next.js can serialize Firestore Timestamps if they are correctly typed.
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Grievance));
  } catch (error) {
    console.error("Error fetching user grievances:", error);
    return [];
  }
}
