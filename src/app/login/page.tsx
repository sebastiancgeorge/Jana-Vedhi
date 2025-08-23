"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { Leaf } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    role="img"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <title>Google</title>
    <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.02 1.02-2.62 1.98-4.66 1.98-3.55 0-6.43-2.91-6.43-6.49S6.07 7.42 9.62 7.42c1.93 0 3.14.79 3.86 1.5l2.44-2.44C14.47 4.79 12.4 3.88 9.62 3.88c-4.87 0-8.88 3.96-8.88 8.88s3.96 8.88 8.88 8.88c2.45 0 4.3-.83 5.76-2.32 1.49-1.49 2.1-3.66 2.1-6.21 0-.46-.05-.89-.12-1.32H12.48z" />
  </svg>
);


export default function LoginPage() {
  const { user, signInWithGoogle, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push("/");
    }
  }, [user, router]);

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Leaf className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-2xl">Welcome to Jana Vedhi</CardTitle>
          <CardDescription>Sign in to access your dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <Button
              variant="outline"
              onClick={signInWithGoogle}
              disabled={loading}
            >
              <GoogleIcon className="mr-2 h-5 w-5 fill-black dark:fill-white" />
              {loading ? "Signing in..." : "Sign in with Google"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
