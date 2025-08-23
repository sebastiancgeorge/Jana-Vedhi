"use client";

import { useEffect, useState } from "react";
import { getTopics, type Topic } from "./actions";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/use-translation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, PlusCircle, User, Calendar } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

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
        setTopics(fetchedTopics);
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
                <Link key={topic.id} href={`/forum/${topic.id}`} className="block hover:bg-muted/50 transition-colors">
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-primary mb-2">{topic.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                           <Avatar className="h-6 w-6">
                             <AvatarFallback>{topic.userName.charAt(0)}</AvatarFallback>
                           </Avatar>
                           <span>{t('by')} {topic.userName}</span>
                        </div>
                         <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(topic.createdAt.seconds * 1000).toLocaleDateString()}</span>
                        </div>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="p-12 text-center text-muted-foreground">
                <p>{t("no_topics_found")}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

    