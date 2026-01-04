"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { useTranslation } from "@/hooks/use-translation";
import { useLanguage } from "@/contexts/language-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Sun, CloudRain, Thermometer, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { getAgroShieldPrediction } from "@/lib/api";

type AdvisoryOutput = {
  advisory: string;
  alerts: string[];
};

export function AdvisoryResults() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation();
  const { language } = useLanguage();

  const location = searchParams.get("location");
  const crop = searchParams.get("crop");
  const soilType = searchParams.get("soilType");

  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<AdvisoryOutput | null>(null);
  const [risk, setRisk] = useState<"Low" | "Medium" | "High">("Medium");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
  if (!location || !crop || !soilType) return;

  startTransition(() => {
    setError(null);
    setResult(null);

    getAgroShieldPrediction({
      crop,
      soil_type: soilType,
      location,
    })
      .then((response) => {
        setRisk(response.crop_risk);

        setResult({
          advisory: response.advisory,
          alerts:
            response.crop_risk === "High"
              ? [t("highRiskAlert")]
              : [],
        });
      })
      .catch(() => {
        setError("Failed to generate advisory");
      });
  });
}, [location, crop, soilType, language, t]);


  if (isPending) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-10 h-64">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-xl text-foreground/80">
          {t("loadingAdvisory")}
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="max-w-2xl mx-auto">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{t("errorAdvisory")}</AlertDescription>
      </Alert>
    );
  }

  if (!result || !location) {
    return (
      <div className="text-center p-10">
        <p className="text-xl text-foreground/80 mb-6">
          {t("noAdvisory")}
        </p>
        <Button onClick={() => router.push("/advisory")} size="lg">
          {t("backToForm")}
        </Button>
      </div>
    );
  }

  const riskStyles = {
    Low: "bg-green-100 border-green-500 text-green-800 dark:bg-green-900/50 dark:border-green-700 dark:text-green-300",
    Medium: "bg-yellow-100 border-yellow-500 text-yellow-800 dark:bg-yellow-900/50 dark:border-yellow-600 dark:text-yellow-300",
    High: "bg-red-100 border-red-500 text-red-800 dark:bg-red-900/50 dark:border-red-600 dark:text-red-300",
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-3xl font-bold font-headline">
          {t("advisoryResultsTitle")}{" "}
          <span className="text-primary">{location}</span>
        </h2>
        <Button variant="outline" onClick={() => router.push("/advisory")}>
          {t("backToForm")}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Sun className="text-accent" /> {t("weatherSummaryTitle")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-lg">
            <div className="flex items-center gap-4">
              <Thermometer className="w-6 h-6 text-primary/70" />
              <span>{t("temperature")}: 25°C - 32°C</span>
            </div>
            <div className="flex items-center gap-4">
              <CloudRain className="w-6 h-6 text-primary/70" />
              <span>{t("rainfall")}: ~30%</span>
            </div>
          </CardContent>
        </Card>

        <Card className={cn("border-2", riskStyles[risk])}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              {t("climateRiskTitle")}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <Badge
              className={cn(
                "text-3xl font-bold px-6 py-2",
                riskStyles[risk]
              )}
            >
              {t(`risk${risk}`)}
            </Badge>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-primary/5 dark:bg-primary/10">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            {t("aiAdvisoryTitle")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-lg dark:prose-invert max-w-none text-foreground/90">
            {result.advisory}
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
