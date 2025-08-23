
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Banknote, FilePenLine, Gavel, Vote, Loader2, BarChart } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "@/hooks/use-translation";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where, Timestamp } from "firebase/firestore";
import { Bar, CartesianGrid, XAxis, YAxis, BarChart as RechartsBarChart } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface DashboardStats {
  activeGrievances: number;
  grievanceChange: number;
  fundsUtilized: number;
  projectCount: number;
  ongoingVotes: number;
  legalQueries: number;
}

interface GrievanceChartData {
  type: string;
  count: number;
}

export default function Home() {
  const { t } = useTranslation();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [grievanceData, setGrievanceData] = useState<GrievanceChartData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const grievancesRef = collection(db, "grievances");
        const fundsRef = collection(db, "funds");
        const budgetsRef = collection(db, "budgets");

        // Grievances
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const thirtyDaysAgoTimestamp = Timestamp.fromDate(thirtyDaysAgo);

        const activeGrievancesQuery = query(grievancesRef, where("status", "!=", "resolved"));
        const allGrievancesQuery = query(grievancesRef);
        const lastMonthGrievancesQuery = query(grievancesRef, where("createdAt", ">=", thirtyDaysAgoTimestamp));
        
        const [activeSnapshot, lastMonthSnapshot, allGrievancesSnapshot] = await Promise.all([
            getDocs(activeGrievancesQuery), 
            getDocs(lastMonthGrievancesQuery),
            getDocs(allGrievancesQuery)
        ]);

        // Grievance chart data aggregation
        const grievancesByType: {[key: string]: number} = {};
        allGrievancesSnapshot.forEach(doc => {
            const type = doc.data().type || 'Other';
            grievancesByType[type] = (grievancesByType[type] || 0) + 1;
        });
        const chartData = Object.keys(grievancesByType).map(type => ({
            type: t(type),
            count: grievancesByType[type]
        }));
        setGrievanceData(chartData);


        // Funds
        const fundsSnapshot = await getDocs(fundsRef);
        const fundsData = fundsSnapshot.docs.map(doc => doc.data());
        const totalUtilized = fundsData.reduce((acc, fund) => acc + (fund.utilized || 0), 0);

        // Budgets
        const ongoingVotesQuery = query(budgetsRef, where("status", "==", "open"));
        const ongoingVotesSnapshot = await getDocs(ongoingVotesQuery);

        // Dummy data for legal queries
        const legalQueries = 231;

        setStats({
          activeGrievances: activeSnapshot.size,
          grievanceChange: lastMonthSnapshot.size,
          fundsUtilized: totalUtilized,
          projectCount: fundsSnapshot.size,
          ongoingVotes: ongoingVotesSnapshot.size,
          legalQueries,
        });

      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, [t]);

  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)} Cr`;
    }
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(2)} Lakh`;
    }
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
  };
  
  if (loading) {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-primary">{t('welcome_to_jana_vedhi')}</h1>
        <p className="text-muted-foreground">{t('platform_subtitle')}</p>
      </header>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('active_grievances')}</CardTitle>
            <FilePenLine className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeGrievances.toLocaleString() ?? '...'}</div>
            <p className="text-xs text-muted-foreground">+{stats?.grievanceChange ?? 0} {t('from_last_month')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('funds_utilized')}</CardTitle>
            <Banknote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats?.fundsUtilized ?? 0)}</div>
            <p className="text-xs text-muted-foreground">{t('across_projects', { count: stats?.projectCount ?? 0 })}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('ongoing_votes')}</CardTitle>
            <Vote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.ongoingVotes ?? '...'}</div>
            <p className="text-xs text-muted-foreground">{t('in_your_constituency')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('legal_queries')}</CardTitle>
            <Gavel className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.legalQueries.toLocaleString() ?? '...'}</div>
            <p className="text-xs text-muted-foreground">{t('answered_this_week')}</p>
          </CardContent>
        </Card>
      </div>

       <div className="grid gap-6 md:grid-cols-2">
           <Card>
            <CardHeader>
              <CardTitle>{t('quick_actions')}</CardTitle>
              <CardDescription>{t('quick_actions_desc')}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <Button asChild variant="outline">
                <Link href="/grievance">
                  <FilePenLine className="mr-2 h-4 w-4" />
                  {t('file_grievance_button')}
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/budget">
                  <Vote className="mr-2 h-4 w-4" />
                  {t('vote_budgets_button')}
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/funds">
                  <Banknote className="mr-2 h-4 w-4" />
                  {t('track_funds_button')}
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/legal-chatbot">
                  <Gavel className="mr-2 h-4 w-4" />
                  {t('ask_legal_button')}
                </Link>
              </Button>
            </CardContent>
          </Card>
          <Card>
             <CardHeader>
                <CardTitle>Grievances by Type</CardTitle>
                <CardDescription>Distribution of submitted grievances across categories.</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={{
                    count: {
                        label: "Count",
                        color: "hsl(var(--primary))",
                    },
                }} className="h-[250px] w-full">
                    <RechartsBarChart data={grievanceData} margin={{ top: 20, right: 20, bottom: 5, left: 0 }}>
                        <CartesianGrid vertical={false} />
                        <XAxis dataKey="type" tickLine={false} tickMargin={10} axisLine={false} />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="count" fill="var(--color-count)" radius={4} />
                    </RechartsBarChart>
                </ChartContainer>
            </CardContent>
          </Card>
       </div>
    </div>
  );
}
