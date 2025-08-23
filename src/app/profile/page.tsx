
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { getUserGrievances, type Grievance } from "./actions";
import { useTranslation } from "@/hooks/use-translation";

export default function ProfilePage() {
  const { user, userRole, loading } = useAuth();
  const { toast } = useToast();
  const [grievances, setGrievances] = useState<Grievance[]>([]);
  const [loadingGrievances, setLoadingGrievances] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    const fetchGrievances = async () => {
      if (!user) return;
      try {
        setLoadingGrievances(true);
        const userGrievances = await getUserGrievances(user.uid);
        setGrievances(userGrievances);
      } catch (error) {
        toast({
          variant: "destructive",
          title: t("error_fetching_grievances"),
          description: error instanceof Error ? error.message : t("unknown_error"),
        });
      } finally {
        setLoadingGrievances(false);
      }
    };
    fetchGrievances();
  }, [user, toast, t]);

  if (loading) {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (!user) {
    // This should be handled by the auth provider, but as a fallback
    return <p>{t("please_log_in")}</p>;
  }

  const getStatusVariant = (status: Grievance['status']) => {
    switch (status) {
      case 'submitted': return 'secondary';
      case 'in_progress': return 'default';
      case 'resolved': return 'outline';
      default: return 'secondary';
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-primary">{t("user_profile")}</h1>
        <p className="text-muted-foreground">{t("user_profile_desc")}</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>{t("my_information")}</CardTitle>
          <CardDescription>{t("my_information_desc")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
           <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border">
              <AvatarImage src={user.photoURL ?? ''} />
              <AvatarFallback>{user.email?.[0].toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-lg font-semibold">{user.displayName ?? t("citizen")}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <Badge className="mt-2" variant={userRole === 'admin' ? 'destructive' : 'secondary'}>
                {t(userRole ?? 'citizen')}
              </Badge>
            </div>
           </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("my_grievances")}</CardTitle>
          <CardDescription>{t("my_grievances_desc")}</CardDescription>
        </CardHeader>
        <CardContent>
          {loadingGrievances ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : grievances.length > 0 ? (
            <Accordion type="single" collapsible className="w-full">
              {grievances.map((g) => (
                <AccordionItem value={g.id} key={g.id}>
                  <AccordionTrigger>
                    <div className="flex justify-between w-full pr-4">
                      <span>{t(g.title)}</span>
                       <Badge variant={getStatusVariant(g.status)}>{t(g.status)}</Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="text-muted-foreground">{t(g.description)}</p>
                    <p className="text-xs text-muted-foreground mt-2">{t("submitted_on")}: {new Date(g.createdAt).toLocaleDateString()}</p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <p className="text-center text-muted-foreground py-8">{t("no_grievances_found")}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
