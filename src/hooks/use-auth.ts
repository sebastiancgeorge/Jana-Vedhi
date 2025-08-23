"use client";

import { useContext } from "react";
import { AuthContext } from "@/components/auth-provider";
import { type User } from "firebase/auth";

type UserRole = 'citizen' | 'admin';

interface UserDetails {
    name: string;
    role: UserRole;
    aadhaar: string;
    aadhaarVerified: boolean;
}

interface AuthHook {
  user: User | null;
  userDetails: UserDetails | null;
  userRole: UserRole | null;
  loading: boolean;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, aadhaar: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuth = (): AuthHook => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

    