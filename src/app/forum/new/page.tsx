"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { createTopic } from "../actions";
import { useTranslation } from "@/hooks/use-translation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";

const TopicSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters long."),
  content: z.string().min(10, "Content must be at least 10 characters long."),
});

export default function NewTopicPage() {
  const { user, userDetails, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const { t } = useTranslation();

  const form = useForm<z.infer<typeof TopicSchema>>({
    resolver: zodResolver(TopicSchema),
    defaultValues: { title: "", content: "" },
  });
  
  useEffect(() => {
    if (!authLoading && !user) {
      toast({ variant: 'destructive', title: t('login_required'), description: 'You must be logged in to create a topic.'})
      router.push("/login");
    }
  }, [user, authLoading, router, toast, t]);


  const onSubmit = async (data: z.infer<typeof TopicSchema>) => {
    if (!user) return;
    try {
      await createTopic({
        ...data,
        userId: user.uid,
        userName: userDetails?.name ?? user.email ?? 'Anonymous',
      });
      toast({ title: t("topic_created_successfully") });
      router.push("/forum");
    } catch (error) {
      toast({
        variant: "destructive",
        title: t("failed_to_create_topic"),
        description: error instanceof Error ? error.message : t("unknown_error"),
      });
    }
  };

  if (authLoading || !user) {
     return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <Card>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle>{t("new_discussion_topic")}</CardTitle>
            <CardDescription>{t("new_discussion_topic_desc")}</CardDescription>
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
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("content")}</FormLabel>
                  <FormControl>
                    <Textarea placeholder={t("content_placeholder")} {...field} rows={10} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t("create_topic")}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}

    