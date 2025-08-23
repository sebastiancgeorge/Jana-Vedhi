
"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { useTranslation } from "@/hooks/use-translation";
import { useEffect, useState, useMemo } from "react";
import { getGrievanceLocations, type GrievanceLocation } from "./actions";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import dynamic from "next/dynamic";

const KeralaMap = dynamic(() => import("@/components/kerala-map").then(mod => mod.KeralaMap), {
  ssr: false,
  loading: () => (
    <div className="flex h-[500px] w-full items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  ),
});


export default function HeatmapPage() {
  const { t } = useTranslation();
  const [locations, setLocations] = useState<GrievanceLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchLocations() {
      try {
        const fetchedLocations = await getGrievanceLocations();
        setLocations(fetchedLocations);
      } catch (error) {
        console.error(error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not fetch grievance locations.",
        });
      } finally {
        setLoading(false);
      }
    }
    fetchLocations();
  }, [toast]);

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight text-primary">{t("grievance_heatmap")}</h1>
      <p className="text-muted-foreground mb-6">{t("grievance_heatmap_desc")}</p>
      <Card>
        <CardHeader>
          <CardTitle>{t("kerala_grievance_map")}</CardTitle>
          <CardDescription>{t("kerala_grievance_map_desc")}</CardDescription>
        </CardHeader>
        <CardContent className="h-[600px] w-full">
          {loading ? (
            <div className="flex h-full w-full items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
             <KeralaMap points={locations} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
