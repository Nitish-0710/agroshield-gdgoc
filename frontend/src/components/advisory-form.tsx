"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/hooks/use-translation";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Leaf, MapPin, Wind } from "lucide-react";

export function AdvisoryForm() {
  const router = useRouter();
  const { t } = useTranslation();

  const formSchema = z.object({
    location: z.string().min(1, t("formRequiredError")),
    crop: z.string().min(1, t("formRequiredError")),
    soilType: z.string().min(1, t("formRequiredError")),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      location: "",
      crop: "",
      soilType: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const params = new URLSearchParams(values);
    router.push(`/advisory/results?${params.toString()}`);
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-center text-2xl md:text-3xl font-headline">
            {t("getAdvisory")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-primary" />{" "}
                      {t("locationLabel")}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("locationPlaceholder")}
                        {...field}
                        className="text-lg p-6"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="crop"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg flex items-center gap-2">
                      <Leaf className="w-5 h-5 text-primary" />{" "}
                      {t("cropLabel")}
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="text-lg p-6">
                          <SelectValue placeholder={t("cropPlaceholder")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Wheat">{t("wheat")}</SelectItem>
                        <SelectItem value="Rice">{t("rice")}</SelectItem>
                        <SelectItem value="Maize">{t("maize")}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="soilType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg flex items-center gap-2">
                      <Wind className="w-5 h-5 text-primary" />{" "}
                      {t("soilLabel")}
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="text-lg p-6">
                          <SelectValue placeholder={t("soilPlaceholder")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Loamy">{t("loamy")}</SelectItem>
                        <SelectItem value="Sandy">{t("sandy")}</SelectItem>
                        <SelectItem value="Clay">{t("clay")}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                size="lg"
                className="w-full text-xl p-8 rounded-full shadow-md"
              >
                {t("generateAdvisory")}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
