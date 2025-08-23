"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Loader2 } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";

interface Politician {
  id: string;
  name: string;
  constituency: string;
  party: string;
  projects: number;
  fundsUtilized: number;
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
      <Card>
        <CardHeader>
          <CardTitle>{t("public_officials")}</CardTitle>
          <CardDescription>{t("public_officials_desc")}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {politicians.map((p) => (
            <Card key={p.id} className="p-4">
               <div className="flex items-start gap-4">
                <Avatar className="h-12 w-12 border">
                  <AvatarFallback>{p.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <CardTitle className="text-lg">{t(p.name)}</CardTitle>
                  <CardDescription>{t(p.party)} - {t(p.constituency)}</CardDescription>
                  <div className="mt-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t("projects")}</span>
                      <span className="font-medium">{p.projects}</span>
                    </div>
                     <div className="flex justify-between">
                      <span className="text-muted-foreground">{t("funds_utilized")}</span>
                      <span className="font-medium">{formatCurrency(p.fundsUtilized)}</span>
                    </div>
                  </div>
                </div>
               </div>
            </Card>
          ))}
           {politicians.length === 0 && (
              <p className="col-span-full text-center text-muted-foreground">{t('no_politicians_found')}</p>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
