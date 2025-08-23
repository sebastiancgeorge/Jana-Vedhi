"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Landmark, Package, MessageSquare } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import Link from "next/link";


interface Politician {
  id: string;
  name: string;
  constituency: string;
  party: string;
  projects: number;
  fundsUtilized: number;
  avatarUrl?: string;
}

export default function PoliticiansPage() {
  const [politicians, setPoliticians] = useState<Politician[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    const fetchPoliticians = async () => {
      try {
        const politiciansCollection = collection(db, "politicians");
        const snapshot = await getDocs(politiciansCollection);
        const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Politician[];
        setPoliticians(list);
      } catch (error) {
        console.error("Error fetching politicians:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPoliticians();
  }, []);

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
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight text-primary">{t("politician_tracker_title")}</h1>
      <p className="text-muted-foreground mb-6">{t("politician_tracker_desc")}</p>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {politicians.map((p) => (
          <Card key={p.id} className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
            <CardContent className="p-0 flex-grow">
               <div className="flex flex-col items-center p-6 bg-muted/30">
                <Avatar className="h-24 w-24 border-4 border-background shadow-md">
                  <AvatarImage src={p.avatarUrl} />
                  <AvatarFallback className="text-3xl">{p.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <CardTitle className="text-xl mt-4">{t(p.name)}</CardTitle>
                <CardDescription className="text-base">{t(p.party)} - {t(p.constituency)}</CardDescription>
               </div>
               <div className="p-6 space-y-4">
                <div className="flex items-center gap-4 text-sm">
                  <Package className="h-5 w-5 text-primary" />
                  <div className="flex-1 flex justify-between">
                    <span className="text-muted-foreground">{t("projects")}</span>
                    <span className="font-bold text-lg">{p.projects}</span>
                  </div>
                </div>
                <Separator />
                <div className="flex items-center gap-4 text-sm">
                  <Landmark className="h-5 w-5 text-primary" />
                  <div className="flex-1 flex justify-between">
                    <span className="text-muted-foreground">{t("funds_utilized")}</span>
                    <span className="font-bold text-lg">{formatCurrency(p.fundsUtilized)}</span>
                  </div>
                </div>
               </div>
            </CardContent>
            <CardFooter>
                 <Button asChild variant="outline" className="w-full">
                    <Link href={`/forum`}>
                        <MessageSquare className="mr-2 h-4 w-4" />
                        {t('discuss')}
                    </Link>
                </Button>
            </CardFooter>
          </Card>
        ))}
         {politicians.length === 0 && (
            <p className="col-span-full text-center text-muted-foreground">{t('no_politicians_found')}</p>
          )}
      </div>
    </div>
  );
}

    