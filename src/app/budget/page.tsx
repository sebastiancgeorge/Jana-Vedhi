"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { getBudgets, toggleVote, type Budget } from "./actions";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ThumbsUp, ThumbsDown, MessageSquare } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/hooks/use-translation";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";

export default function BudgetPage() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [votingStatus, setVotingStatus] = useState<{[key: string]: boolean}>({});
  const { toast } = useToast();
  const { user } = useAuth();
  const { t } = useTranslation();

  useEffect(() => {
    const fetchBudgets = async () => {
      try {
        setLoading(true);
        const fetchedBudgets = await getBudgets();
        setBudgets(fetchedBudgets);
      } catch (error) {
        toast({
          variant: "destructive",
          title: t("error_fetching_budgets"),
          description: error instanceof Error ? error.message : t("unknown_error"),
        });
      } finally {
        setLoading(false);
      }
    };
    fetchBudgets();
  }, [toast, t]);

  const handleVote = async (budgetId: string, hasVoted: boolean) => {
    if (!user) {
      toast({
        variant: "destructive",
        title: t("login_required"),
        description: t("must_login_to_vote"),
      });
      return;
    }
    
    setVotingStatus(prev => ({...prev, [budgetId]: true}));

    try {
      const { newVotes } = await toggleVote(budgetId, user.uid, hasVoted);
      setBudgets(prevBudgets =>
        prevBudgets.map(b => 
          b.id === budgetId 
          ? { 
              ...b, 
              votes: newVotes,
              votedBy: hasVoted 
                ? (b.votedBy || []).filter(uid => uid !== user.uid) 
                : [...(b.votedBy || []), user.uid]
            } 
          : b
        )
      );
      toast({
        title: hasVoted ? t("vote_withdrawn") : t("vote_cast"),
        description: hasVoted ? t("vote_withdrawn_success") : t("vote_cast_success"),
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: t("vote_failed"),
        description: error instanceof Error ? error.message : t("unknown_error"),
      });
    } finally {
      setVotingStatus(prev => ({...prev, [budgetId]: false}));
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight text-primary">{t("budget_voting")}</h1>
      <p className="text-muted-foreground mb-6">{t("budget_voting_desc")}</p>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {budgets.map((budget) => {
           const hasVoted = user ? budget.votedBy?.includes(user.uid) : false;
           const isVoting = votingStatus[budget.id];
          return (
            <Card key={budget.id} className="flex flex-col">
              <CardHeader>
                <CardTitle>{t(budget.title)}</CardTitle>
                <CardDescription>{t(budget.description)}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow space-y-4">
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">{t("current_votes")}</span>
                    <span className="text-lg font-bold">{budget.votes}</span>
                </div>
                 <Badge variant={budget.status === 'open' ? 'secondary' : 'destructive'}>
                    {t(budget.status)}
                </Badge>
              </CardContent>
              <Separator />
              <CardFooter className="flex flex-col items-stretch gap-2 pt-4">
                <Button
                  onClick={() => handleVote(budget.id, hasVoted)}
                  disabled={!user || isVoting || budget.status === 'closed'}
                  className="w-full"
                >
                  {isVoting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {hasVoted ? (
                    <>
                      <ThumbsDown className="mr-2 h-4 w-4" /> {t("withdraw_vote")}
                    </>
                  ) : (
                    <>
                      <ThumbsUp className="mr-2 h-4 w-4" /> {t("cast_vote")}
                    </>
                  )}
                </Button>
                 <Button asChild variant="outline" className="w-full">
                    <Link href={`/forum`}>
                        <MessageSquare className="mr-2 h-4 w-4" />
                        {t('discuss')}
                    </Link>
                </Button>
              </CardFooter>
            </Card>
          )
        })}
      </div>
       {budgets.length === 0 && (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              {t('no_budgets_found')}
            </CardContent>
          </Card>
        )}
    </div>
  );
}

    