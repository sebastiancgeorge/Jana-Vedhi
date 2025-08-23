"use client";

import { createContext, useEffect, useState, type ReactNode } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  type User,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { validateAadhaar } from "@/ai/flows/validate-aadhaar-flow";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, aadhaar: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
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
       toast({
        variant: "destructive",
        title: "Sign-in Failed",
        description: error.message || "Could not sign in. Please check your credentials and try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const signUpWithEmail = async (email: string, pass: string, aadhaar: string) => {
    setLoading(true);
    try {
      const validationResult = await validateAadhaar({ aadhaarNumber: aadhaar });

      if (!validationResult.isValid) {
        throw new Error(validationResult.reason || "Invalid Aadhaar number.");
      }
      
      await createUserWithEmailAndPassword(auth, email, pass);
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
    } finally {
      setLoading(false);
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
