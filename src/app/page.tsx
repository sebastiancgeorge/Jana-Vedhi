
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Banknote, FilePenLine, Gavel, Vote, Loader2, BarChart, PieChart } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "@/hooks/use-translation";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where, Timestamp } from "firebase/firestore";
import { Bar, CartesianGrid, XAxis, YAxis, BarChart as RechartsBarChart, Pie, Cell, PieChart as RechartsPieChart } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";

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
  fill: string;
}

interface BudgetChartData {
    name: string;
    value: number;
    fill: string;
}

const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];

export default function Home() {
  const { t } = useTranslation();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [grievanceData, setGrievanceData] = useState<GrievanceChartData[]>([]);
  const [budgetData, setBudgetData] = useState<BudgetChartData[]>([]);
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
            getDocs(allGrievancesSnapshot)
        ]);

        // Grievance chart data aggregation
        const grievancesByType: {[key: string]: number} = {};
        allGrievancesSnapshot.forEach(doc => {
            const type = doc.data().type || 'Other';
            grievancesByType[type] = (grievancesByType[type] || 0) + 1;
        });
        const grievanceChartData = Object.keys(grievancesByType).map((type, index) => ({
            type: t(type),
            count: grievancesByType[type],
            fill: COLORS[index % COLORS.length]
        }));
        setGrievanceData(grievanceChartData);


        // Funds
        const fundsSnapshot = await getDocs(fundsRef);
        const fundsData = fundsSnapshot.docs.map(doc => doc.data());
        const totalUtilized = fundsData.reduce((acc, fund) => acc + (fund.utilized || 0), 0);

        // Budgets
        const budgetsSnapshot = await getDocs(budgetsRef);
        const budgetStatusCounts = budgetsSnapshot.docs.reduce((acc, doc) => {
            const status = doc.data().status || 'closed';
            acc[status] = (acc[status] || 0) + 1;
            return acc;
        }, { open: 0, closed: 0 });

        const budgetChartData = Object.keys(budgetStatusCounts).map((status, index) => ({
            name: t(status),
            value: budgetStatusCounts[status as keyof typeof budgetStatusCounts],
            fill: COLORS[index % COLORS.length]
        }));
        setBudgetData(budgetChartData);


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

       <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>{t('quick_actions')}</CardTitle>
              <CardDescription>{t('quick_actions_desc')}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
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
          <Card className="lg:col-span-2">
             <CardHeader>
                <CardTitle>Grievances by Type</CardTitle>
                <CardDescription>Distribution of submitted grievances across categories.</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={{
                    count: {
                        label: "Count",
                    },
                }} className="h-[300px] w-full">
                    <RechartsBarChart data={grievanceData} layout="vertical" margin={{ top: 20, right: 20, bottom: 5, left: 0 }}>
                        <CartesianGrid horizontal={false} />
                        <YAxis dataKey="type" type="category" tickLine={false} tickMargin={10} axisLine={false} />
                        <XAxis type="number" />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="count" radius={4}>
                            {grievanceData.map((entry) => (
                                <Cell key={`cell-${entry.type}`} fill={entry.fill} />
                            ))}
                        </Bar>
                    </RechartsBarChart>
                </ChartContainer>
            </CardContent>
          </Card>
       </div>
       <div className="grid gap-6 md:grid-cols-2">
         <Card>
            <CardHeader>
                <CardTitle>Budget Status</CardTitle>
                <CardDescription>Breakdown of open and closed budget proposals.</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center">
                <ChartContainer config={{}} className="h-[250px] w-full">
                    <RechartsPieChart>
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Pie data={budgetData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} label>
                             {budgetData.map((entry) => (
                                <Cell key={`cell-${entry.name}`} fill={entry.fill} />
                            ))}
                        </Pie>
                         <ChartLegend content={<ChartLegendContent />} />
                    </RechartsPieChart>
                </ChartContainer>
            </CardContent>
         </Card>
         <Card>
            <CardHeader>
                <CardTitle>Coming Soon</CardTitle>
                <CardDescription>More visualizations will be added here.</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center h-[250px] text-muted-foreground">
                <PieChart className="h-16 w-16" />
            </CardContent>
         </Card>
       </div>
    </div>
  );
}

    