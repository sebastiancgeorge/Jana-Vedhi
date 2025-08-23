
"use server";

import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  serverTimestamp,
  query,
  orderBy,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Data types
export interface Topic {
  id: string;
  title: string;
  content: string;
  userId: string;
  userName: string;
  createdAt: number; // Changed from Timestamp
  lastReply?: {
      userName: string;
      createdAt: number; // Changed from Timestamp
  }
}

export interface Reply {
  id: string;
  content: string;
  userId: string;
  userName: string;
  createdAt: number; // Changed from Timestamp
}

// Zod schemas for input validation
const TopicSchema = z.object({
  title: z.string().min(1, "Title is required."),
  content: z.string().min(1, "Content is required."),
  userId: z.string(),
  userName: z.string(),
});
export type TopicInput = z.infer<typeof TopicSchema>;

const ReplySchema = z.object({
  content: z.string().min(1, "Reply content cannot be empty."),
  userId: z.string(),
  userName: z.string(),
});
export type ReplyInput = z.infer<typeof ReplySchema>;

// Helper function to convert Firestore doc to Topic
const toTopic = (doc: any): Topic => {
    const data = doc.data();
    const topic: Topic = {
        id: doc.id,
        title: data.title,
        content: data.content,
        userId: data.userId,
        userName: data.userName,
        createdAt: data.createdAt.toMillis(),
    };
    if (data.lastReply) {
        topic.lastReply = {
            userName: data.lastReply.userName,
            createdAt: data.lastReply.createdAt.toMillis(),
        };
    }
    return topic;
}

// Helper function to convert Firestore doc to Reply
const toReply = (doc: any): Reply => {
    const data = doc.data();
    return {
        id: doc.id,
        content: data.content,
        userId: data.userId,
        userName: data.userName,
        createdAt: data.createdAt.toMillis(),
    };
}


// Server Actions
export async function getTopics(): Promise<Topic[]> {
  try {
    const topicsCol = collection(db, "topics");
    // A simpler query that orders only by creation date to ensure all topics are fetched.
    // The more complex sorting (by last reply) will be handled on the client.
    const q = query(topicsCol, orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(toTopic);
  } catch (error) {
    console.error("Error fetching topics:", error);
    throw new Error("Failed to fetch topics.");
  }
}

export async function createTopic(topic: TopicInput) {
  const parsed = TopicSchema.safeParse(topic);
  if (!parsed.success) {
    throw new Error(parsed.error.errors.map(e => e.message).join(", "));
  }

  try {
    await addDoc(collection(db, "topics"), {
      ...parsed.data,
      createdAt: serverTimestamp(),
    });
    revalidatePath("/forum");
    return { success: true };
  } catch (error) {
    console.error("Error creating topic:", error);
    const msg = error instanceof Error ? error.message : "An unknown error occurred.";
    throw new Error(`Failed to create topic: ${msg}`);
  }
}

export async function getTopic(topicId: string): Promise<Topic | null> {
    try {
        const topicRef = doc(db, "topics", topicId);
        const docSnap = await getDoc(topicRef);
        if (docSnap.exists()) {
            return toTopic(docSnap);
        }
        return null;
    } catch (error) {
        console.error("Error fetching topic:", error);
        throw new Error("Failed to fetch topic.");
    }
}

export async function getReplies(topicId: string): Promise<Reply[]> {
    try {
        const repliesCol = collection(db, "topics", topicId, "replies");
        const q = query(repliesCol, orderBy("createdAt", "asc"));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(toReply);
    } catch (error) {
        console.error("Error fetching replies:", error);
        throw new Error("Failed to fetch replies.");
    }
}

export async function addReply(topicId: string, reply: ReplyInput) {
    const parsed = ReplySchema.safeParse(reply);
    if (!parsed.success) {
        throw new Error(parsed.error.errors.map(e => e.message).join(", "));
    }

    try {
        const topicRef = doc(db, "topics", topicId);
        const repliesCol = collection(db, "topics", topicId, "replies");
        
        const replyTimestamp = serverTimestamp();

        // Add the new reply
        await addDoc(repliesCol, {
            ...parsed.data,
            createdAt: replyTimestamp,
        });

        // Update the lastReply field on the parent topic
        await updateDoc(topicRef, {
            lastReply: {
                userName: parsed.data.userName,
                createdAt: replyTimestamp
            }
        });

        revalidatePath(`/forum`);
        revalidatePath(`/forum/${topicId}`);
        return { success: true };
    } catch (error) {
        console.error("Error adding reply:", error);
        const msg = error instanceof Error ? error.message : "An unknown error occurred.";
        throw new Error(`Failed to add reply: ${msg}`);
    }
}
