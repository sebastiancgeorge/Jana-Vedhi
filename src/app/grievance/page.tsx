"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { type GrievanceInput, submitGrievance } from "./actions";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { z } from "zod";

const grievanceTypes = ["Roads", "Waste", "Utilities", "Water", "Sanitation", "Other"];

// Define the schema in the component file that uses it for the form.
const GrievanceSchema = z.object({
  title: z.string().min(1, { message: "Title is required." }),
  description: z.string().min(1, { message: "Description is required." }),
  type: z.string().min(1, { message: "Grievance type is required." }),
  userId: z.string(),
});

export default function GrievancePage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { t } = useTranslation();

  const form = useForm<GrievanceInput>({
    resolver: zodResolver(GrievanceSchema),
    defaultValues: {
      title: "",
      description: "",
      type: "",
      userId: user?.uid || "",
    },
  });

  if (!user) {
    router.push("/login");
    return null;
  }
  
  // Keep userId in form sync with auth state
  form.setValue("userId", user.uid);

  const onSubmit = async (data: GrievanceInput) => {
    setIsSubmitting(true);
    try {
      await submitGrievance(data);
      toast({
        title: t("grievance_submitted"),
        description: t("grievance_submitted_desc"),
      });
      form.reset();
      router.push("/");
    } catch (error) {
      toast({
        variant: "destructive",
        title: t("submission_failed"),
        description: error instanceof Error ? error.message : t("unknown_error"),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight text-primary">{t("submit_grievance")}</h1>
      <p className="text-muted-foreground mb-6">{t("submit_grievance_desc")}</p>
      <Card>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardHeader>
              <CardTitle>{t("new_grievance_form")}</CardTitle>
              <CardDescription>{t("new_grievance_form_desc")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("title")}</FormLabel>
                    <FormControl>
                      <Input placeholder={t("title_placeholder")} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("grievance_type")}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t("grievance_type_placeholder")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {grievanceTypes.map(type => (
                           <SelectItem key={type} value={type}>{t(type)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("description")}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t("description_placeholder")}
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               {/* In a real app, you'd have file upload and geolocation components here */}
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t("submit_grievance_button")}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
