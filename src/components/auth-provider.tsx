
"use client";

import { createContext, useEffect, useState, type ReactNode } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  type User,
} from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { validateAadhaar } from "@/ai/flows/validate-aadhaar-flow";
import { Loader2 } from "lucide-react";

type UserRole = 'citizen' | 'admin';

interface UserDetails {
    name: string;
    role: UserRole;
    aadhaar: string;
    aadhaarVerified: boolean;
}

interface AuthContextType {
  user: User | null;
  userDetails: UserDetails | null;
  userRole: UserRole | null;
  loading: boolean;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, aadhaar: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      if (user) {
        setUser(user);
        // Always fetch user role from Firestore as the source of truth
        const userDocRef = doc(db, "users", user.email!);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data() as UserDetails;
          setUserDetails(userData);
          setUserRole(userData.role || 'citizen');
        } else {
            setUserRole('citizen');
            setUserDetails(null);
        }
      } else {
        setUser(null);
        setUserRole(null);
        setUserDetails(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signInWithEmail = async (email: string, pass: string) => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      router.push("/");
       toast({
        title: "Signed In",
        description: "You have successfully signed in.",
      });
    } catch (error: any) {
      console.error("Error signing in:", error);
      // Re-throw the error so the calling component can handle it
      throw error;
    } finally {
      // Auth state change will set loading to false
    }
  };

  const signUpWithEmail = async (email: string, pass: string, aadhaar: string) => {
    setLoading(true);
    try {
      // Check if user already exists
      const userDocRef = doc(db, "users", email);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
          throw new Error("An account with this email already exists. Please sign in.");
      }

      const validationResult = await validateAadhaar({ aadhaarNumber: aadhaar });
  
      if (!validationResult.isValid) {
        throw new Error(validationResult.reason || "Invalid Aadhaar number.");
      }
  
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      const newUser = userCredential.user;
      
      const name = email.split('@')[0]; // Simple name generation
  
      // Create a document in Firestore 'users' collection for the new citizen
      await setDoc(doc(db, "users", newUser.email!), {
        email: newUser.email,
        aadhaar: aadhaar,
        role: 'citizen',
        aadhaarVerified: true,
        createdAt: new Date(),
        name: name,
      });
      
      setUserRole('citizen');
  
      router.push("/");
      toast({
        title: "Account Created",
        description: "You have successfully created an account and signed in.",
      });
    } catch (error: any) {
       console.error("Error signing up:", error);
       toast({
        variant: "destructive",
        title: "Sign-up Failed",
        description: error.message || "Could not create an account. Please try again.",
      });
       setLoading(false); // Manually set loading on sign-up failure
    } finally {
      // Auth state change will set loading to false on success
    }
  }

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      router.push("/login");
      toast({
        title: "Signed Out",
        description: "You have been successfully signed out.",
      });
    } catch (error) {
      console.error("Error signing out:", error);
       toast({
        variant: "destructive",
        title: "Sign-out Failed",
        description: "Could not sign out. Please try again.",
      });
    }
  };

  const value = {
    user,
    userDetails,
    userRole,
    loading,
    signInWithEmail,
    signUpWithEmail,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div> : children}
    </AuthContext.Provider>
  );
}

    