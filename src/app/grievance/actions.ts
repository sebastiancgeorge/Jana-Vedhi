
"use server";

import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { z } from "zod";

// The schema is now defined in the page.tsx file where the form is.
// We still need the type here for the function argument.
const GrievanceSchema = z.object({
  title: z.string().min(1, { message: "Title is required." }),
  description: z.string().min(1, { message: "Description is required." }),
  type: z.string().min(1, { message: "Grievance type is required." }),
  userId: z.string(),
});

export type GrievanceInput = z.infer<typeof GrievanceSchema>;


export async function submitGrievance(input: GrievanceInput) {
  const parsedInput = GrievanceSchema.safeParse(input);

  if (!parsedInput.success) {
    throw new Error(parsedInput.error.errors.map(e => e.message).join(", "));
  }

  try {
    await addDoc(collection(db, "grievances"), {
      ...parsedInput.data,
      status: "submitted",
      createdAt: serverTimestamp(),
      // In a real app, you would get location data from the client
      location: { lat: 9.9312, lng: 76.2673 }, 
    });
    return { success: true, message: "Grievance submitted successfully." };
  } catch (error) {
    console.error("Error submitting grievance:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    // Re-throw the error to be caught by the form's catch block
    throw new Error(`Failed to submit grievance: ${errorMessage}`);
  }
}
