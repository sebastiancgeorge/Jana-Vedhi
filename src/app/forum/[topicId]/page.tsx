"use client";

import { useEffect, useState } from "react";
import { getTopic, getReplies, addReply, type Topic, type Reply } from "../actions";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/use-translation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, User, Calendar, Send } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";

const ReplySchema = z.object({
  content: z.string().min(1, "Reply cannot be empty."),
});

export default function TopicPage({ params }: { params: { topicId: string } }) {
  const { topicId } = params;
  const [topic, setTopic] = useState<Topic | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, userDetails } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();

  const form = useForm<z.infer<typeof ReplySchema>>({
    resolver: zodResolver(ReplySchema),
    defaultValues: { content: "" },
  });

  const fetchTopicAndReplies = async () => {
      try {
        setLoading(true);
        const [topicData, repliesData] = await Promise.all([
          getTopic(topicId),
          getReplies(topicId),
        ]);
        setTopic(topicData);
        setReplies(repliesData);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not fetch the discussion topic.",
        });
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    fetchTopicAndReplies();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topicId, toast]);

  const onSubmit = async (data: z.infer<typeof ReplySchema>) => {
    if (!user) return;
    try {
      await addReply(topicId, { 
          ...data, 
          userId: user.uid, 
          userName: userDetails?.name ?? user.email ?? "Anonymous"
      });
      toast({ title: t("reply_posted_successfully") });
      form.reset();
      // Refetch replies and topic (to update last reply)
      fetchTopicAndReplies();
    } catch (error) {
      toast({
        variant: "destructive",
        title: t("failed_to_post_reply"),
        description: error instanceof Error ? error.message : t("unknown_error"),
      });
    }
  };


  if (loading) {
    return <div className="flex h-[calc(100vh-10rem)] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (!topic) {
    return <div className="text-center">{t('topic_not_found')}</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">{topic.title}</CardTitle>
          <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2">
            <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6"><AvatarFallback>{topic.userName?.charAt(0) ?? 'A'}</AvatarFallback></Avatar>
                <span>{t('by')} {topic.userName}</span>
            </div>
            <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{new Date(topic.createdAt.seconds * 1000).toLocaleDateString()}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap">{topic.content}</p>
        </CardContent>
      </Card>
      
      <Separator />

      <h2 className="text-2xl font-semibold">{t("replies")} ({replies.length})</h2>
      <div className="space-y-4">
        {replies.length > 0 ? (
          replies.map(reply => (
            <Card key={reply.id}>
              <CardContent className="p-4">
                 <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                    <div className="flex items-center gap-2 font-semibold text-foreground">
                        <Avatar className="h-6 w-6"><AvatarFallback>{reply.userName?.charAt(0) ?? 'A'}</AvatarFallback></Avatar>
                        <span>{reply.userName}</span>
                    </div>
                    <span>{new Date(reply.createdAt.seconds * 1000).toLocaleString()}</span>
                </div>
                <p className="whitespace-pre-wrap">{reply.content}</p>
              </CardContent>
            </Card>
          ))
        ) : (
            <p className="text-center text-muted-foreground py-8">{t("no_replies_yet")}</p>
        )}
      </div>
      
      {user && (
        <Card>
            <CardHeader><CardTitle>{t("your_reply")}</CardTitle></CardHeader>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <CardContent>
                        <FormField
                            control={form.control}
                            name="content"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Textarea placeholder={t("your_reply_placeholder")} {...field} rows={4} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" disabled={form.formState.isSubmitting}>
                            {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            <Send className="mr-2 h-4 w-4"/> {t("post_reply")}
                        </Button>
                    </CardFooter>
                </form>
            </Form>
        </Card>
      )}

    </div>
  );
}
