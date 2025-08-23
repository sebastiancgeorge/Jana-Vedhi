
"use server";

import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

export interface GrievanceLocation {
  id: string;
  title: string;
  location: {
    lat: number;
    lng: number;
  };
}

export async function getGrievanceLocations(): Promise<GrievanceLocation[]> {
  try {
    const grievancesRef = collection(db, "grievances");
    const q = query(grievancesRef, where("location", "!=", null));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      console.log("No grievances with locations found.");
      return [];
    }

    const locations: GrievanceLocation[] = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      // Ensure the document has a location field with lat and lng
      if (data.location && typeof data.location.lat === 'number' && typeof data.location.lng === 'number') {
        locations.push({
          id: doc.id,
          title: data.title,
          location: data.location,
        });
      }
    });
    
    return locations;
  } catch (error) {
    console.error("Error fetching grievance locations:", error);
    return [];
  }
}
