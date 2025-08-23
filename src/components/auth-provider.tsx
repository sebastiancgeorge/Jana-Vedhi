
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
import { doc, setDoc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { validateAadhaar } from "@/ai/flows/validate-aadhaar-flow";
import { Loader2 } from "lucide-react";

type UserRole = 'citizen' | 'admin';

interface AuthContextType {
  user: User | null;
  userRole: UserRole | null;
  loading: boolean;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, aadhaar: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      if (user) {
        setUser(user);
        // Fetch user role from Firestore
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setUserRole(userDoc.data().role || 'citizen');
        } else {
          // Handle case where user exists in Auth but not in Firestore
          setUserRole('citizen');
        }
      } else {
        setUser(null);
        setUserRole(null);
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
      const validationResult = await validateAadhaar({ aadhaarNumber: aadhaar });

      if (!validationResult.isValid) {
        throw new Error(validationResult.reason || "Invalid Aadhaar number.");
      }
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      const newUser = userCredential.user;

      const role: UserRole = email === 'admin@example.gov' ? 'admin' : 'citizen';

      // Create a document in Firestore 'users' collection
      await setDoc(doc(db, "users", newUser.uid), {
        email: newUser.email,
        aadhaar: aadhaar,
        role: role,
        aadhaarVerified: true,
        createdAt: new Date(),
      });

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
