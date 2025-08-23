
"use client";

import { useEffect, useState } from "react";
import { getTopics, type Topic } from "./actions";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/use-translation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, PlusCircle, User, Calendar, MessageSquare, Reply } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatDistanceToNow } from 'date-fns';

function TimeAgo({ date }: { date: Date | undefined }) {
    if (!date) return null;
    try {
        return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
        return date.toLocaleDateString();
    }
}


export default function ForumPage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { t } = useTranslation();

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        setLoading(true);
        const fetchedTopics = await getTopics();
        // Sort topics client-side to ensure topics without replies are shown correctly.
        const sortedTopics = fetchedTopics.sort((a, b) => {
            const timeA = a.lastReply ? a.lastReply.createdAt.toMillis() : a.createdAt.toMillis();
            const timeB = b.lastReply ? b.lastReply.createdAt.toMillis() : b.createdAt.toMillis();
            return timeB - timeA;
        });
        setTopics(sortedTopics);
      } catch (error) {
        toast({
          variant: "destructive",
          title: t("unknown_error"),
          description: error instanceof Error ? error.message : t("unknown_error"),
        });
      } finally {
        setLoading(false);
      }
    };
    fetchTopics();
  }, [toast, t]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
       <div className="flex items-center justify-between">
        <div>
            <h1 className="text-3xl font-bold tracking-tight text-primary">{t("community_forum")}</h1>
            <p className="text-muted-foreground">{t("community_forum_desc")}</p>
        </div>
        <Button asChild>
            <Link href="/forum/new">
                <PlusCircle className="mr-2 h-4 w-4"/>
                {t("start_new_discussion")}
            </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {topics.length > 0 ? (
              topics.map((topic) => (
                <div key={topic.id} className="p-4 sm:p-6 hover:bg-muted/50 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex-grow">
                             <Link href={`/forum/${topic.id}`} className="block">
                                <h3 className="text-lg font-semibold text-primary mb-1">{topic.title}</h3>
                             </Link>
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                                {topic.content}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <div className="flex items-center gap-2">
                                   <Avatar className="h-5 w-5">
                                     <AvatarFallback>{topic.userName.charAt(0)}</AvatarFallback>
                                   </Avatar>
                                   <span>{t('by')} {topic.userName}</span>
                                </div>
                                 <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    <span><TimeAgo date={new Date(topic.createdAt.seconds * 1000)} /></span>
                                </div>
                            </div>
                        </div>
                        <div className="flex-shrink-0 mt-4 sm:mt-0 sm:ml-6 sm:w-48 text-left sm:text-right">
                           {topic.lastReply ? (
                                <div className="flex items-center justify-start sm:justify-end gap-2 text-xs text-muted-foreground">
                                    <Reply className="h-4 w-4"/>
                                    <div>
                                        <p className="font-semibold text-foreground truncate">{topic.lastReply.userName}</p>
                                        <p><TimeAgo date={new Date(topic.lastReply.createdAt.seconds * 1000)} /></p>
                                    </div>
                                </div>
                           ) : (
                                <div className="text-xs text-muted-foreground italic">No replies yet</div>
                           )}
                        </div>
                    </div>
                 </div>
              ))
            ) : (
              <div className="p-12 text-center text-muted-foreground">
                <MessageSquare className="mx-auto h-12 w-12 mb-4" />
                <p>{t("no_topics_found")}</p>
                <Button asChild size="sm" className="mt-4">
                    <Link href="/forum/new">
                        <PlusCircle className="mr-2 h-4 w-4"/>
                        {t("start_new_discussion")}
                    </Link>
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
