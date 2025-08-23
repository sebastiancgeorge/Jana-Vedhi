
"use server";

import { db } from "@/lib/firebase";
import { collection, getDocs, query, where, orderBy, type Timestamp } from "firebase/firestore";

export interface Grievance {
  id: string;
  title: string;
  description: string;
  status: 'submitted' | 'in_progress' | 'resolved';
  type: string;
  createdAt: number; // Changed from Timestamp
}

const toGrievance = (doc: any): Grievance => {
    const data = doc.data();
    return {
        id: doc.id,
        title: data.title,
        description: data.description,
        status: data.status,
        type: data.type,
        createdAt: data.createdAt.toMillis(),
    };
};

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
    return snapshot.docs.map(toGrievance);
  } catch (error) {
    console.error("Error fetching user grievances:", error);
    return [];
  }
}
