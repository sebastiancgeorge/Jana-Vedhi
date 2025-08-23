
"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { Leaf, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";

const signInSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
});

const signUpSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
  aadhaar: z.string().regex(/^[0-9]{12}$/, { message: "Must be a 12-digit Aadhaar number." }),
});

const MAX_ATTEMPTS = 3;

export default function LoginPage() {
  const { user, signInWithEmail, signUpWithEmail, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState<{ [email: string]: number }>({});
  const [lockout, setLockout] = useState<{ [email: string]: Date }>({});

  const signInForm = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  const signUpForm = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { email: "", password: "", aadhaar: "" },
  });


  useEffect(() => {
    if (user) {
      router.push("/");
    }
  }, [user, router]);

  const onSignInSubmit = async (values: z.infer<typeof signInSchema>) => {
    setIsSubmitting(true);
    const { email, password } = values;

    if (lockout[email] && new Date() < lockout[email]) {
      const remainingTime = Math.ceil((lockout[email].getTime() - new Date().getTime()) / 1000);
      toast({
        variant: "destructive",
        title: "Too many attempts",
        description: `Please try again in ${remainingTime} seconds.`,
      });
      setIsSubmitting(false);
      return;
    }


    try {
      await signInWithEmail(email, password);
      // Reset attempts on successful login
      if (loginAttempts[email]) {
        setLoginAttempts(prev => {
          const newAttempts = { ...prev };
          delete newAttempts[email];
          return newAttempts;
        });
        setLockout(prev => {
            const newLockout = { ...prev };
            delete newLockout[email];
            return newLockout;
        });
      }
    } catch (error: any) {
        if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
            const currentAttempts = (loginAttempts[email] || 0) + 1;
            setLoginAttempts(prev => ({...prev, [email]: currentAttempts}));

            if(currentAttempts >= MAX_ATTEMPTS) {
                const lockoutUntil = new Date(new Date().getTime() + 60000); // 1 minute lockout
                setLockout(prev => ({...prev, [email]: lockoutUntil}));
                toast({
                    variant: "destructive",
                    title: "Too many failed attempts",
                    description: "Your account is temporarily locked. Please try again in a minute.",
                });
            } else {
                 toast({
                    variant: "destructive",
                    title: "Sign-in Failed",
                    description: `Invalid credentials. ${MAX_ATTEMPTS - currentAttempts} attempts remaining.`,
                });
            }
        } else {
            toast({
                variant: "destructive",
                title: "Sign-in Failed",
                description: error.message || "An unexpected error occurred.",
            });
        }
    } finally {
        setIsSubmitting(false);
    }
  };

  const onSignUpSubmit = async (values: z.infer<typeof signUpSchema>) => {
    setIsSubmitting(true);
    await signUpWithEmail(values.email, values.password, values.aadhaar);
    setIsSubmitting(false);
  };
  
  const isLocked = signInForm.watch("email") && lockout[signInForm.watch("email")] && new Date() < lockout[signInForm.watch("email")];

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Leaf className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-2xl">Welcome to Jana Vedhi</CardTitle>
          <CardDescription>
            Sign in or create an account to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            <TabsContent value="signin">
              <Form {...signInForm}>
                <form onSubmit={signInForm.handleSubmit(onSignInSubmit)} className="space-y-4 mt-4">
                  <FormField
                    control={signInForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="name@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={signInForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={isSubmitting || loading || isLocked}>
                    {isSubmitting || loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    {isLocked ? "Account Locked" : "Sign In"}
                  </Button>
                </form>
              </Form>
            </TabsContent>
            <TabsContent value="signup">
               <Form {...signUpForm}>
                <form onSubmit={signUpForm.handleSubmit(onSignUpSubmit)} className="space-y-4 mt-4">
                  <FormField
                    control={signUpForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="name@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={signUpForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={signUpForm.control}
                    name="aadhaar"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Aadhaar Number</FormLabel>
                        <FormControl>
                          <Input placeholder="xxxx-xxxx-xxxx" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={isSubmitting || loading}>
                     {isSubmitting || loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Create Account
                  </Button>
                </form>
              </Form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
