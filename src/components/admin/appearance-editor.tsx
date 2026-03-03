"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, RefreshCcw } from 'lucide-react';
import { getTheme, setTheme, defaultTheme, hslToHex, hexToHsl } from '@/lib/theme';
import { addHistoryLog } from '@/lib/history';
import { Theme } from '@/lib/types';

interface AppearanceEditorProps {
    schoolId: string;
}

const themeSchema = z.object({
  background: z.string().min(1, "Required"),
  primary: z.string().min(1, "Required"),
  accent: z.string().min(1, "Required"),
});

export function AppearanceEditor({ schoolId }: AppearanceEditorProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isDocLoading, setIsDocLoading] = useState(true);
  const { toast } = useToast();

  const form = useForm<Theme>({
    resolver: zodResolver(themeSchema),
    defaultValues: defaultTheme,
  });

  useEffect(() => {
    const currentTheme = getTheme(schoolId);
    form.reset(currentTheme);
    setIsDocLoading(false);
  }, [schoolId, form]);

  function onSubmit(values: Theme) {
    setIsLoading(true);
    setTheme(schoolId, values);
    addHistoryLog(schoolId, {
        action: "გარეგნობის განახლება", 
        details: "ძირითადი ფერები შეიცვალა.",
    });
    toast({
        title: "გარეგნობა შენახულია",
        description: "განახლებული თემა აისახა დაფაზე.",
    });
    setIsLoading(false);
    window.location.reload(); // Force a refresh to apply theme
  }
  
  const resetTheme = () => {
    setTheme(schoolId, defaultTheme);
    form.reset(defaultTheme);
    addHistoryLog(schoolId, {
        action: "გარეგნობის განახლება",
        details: "თემა დაუბრუნდა საწყის მდგომარეობას.",
    });
    toast({ title: "თემა საწყის მდგომარეობაში დაბრუნდა" });
    window.location.reload();
  }

  if(isDocLoading) {
      return (
          <Card>
              <CardHeader>
                <CardTitle>დაფის გარეგნობის რედაქტორი</CardTitle>
                <CardDescription>
                შეცვალეთ ძირითადი ფერები (ფონი, მთავარი, აქცენტი). გამოიყენეთ პალიტრა ან შეიყვანეთ ფერი HSL ფორმატში (მაგ: 211 32% 28%).
                </CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </CardContent>
          </Card>
      );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>დაფის გარეგნობის რედაქტორი</CardTitle>
        <CardDescription>
          შეცვალეთ ძირითადი ფერები (ფონი, მთავარი, აქცენტი). გამოიყენეთ პალიტრა ან შეიყვანეთ ფერი HSL ფორმატში (მაგ: 211 32% 28%).
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="background"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ფონის ფერი (Background)</FormLabel>
                  <div className="flex items-center gap-4">
                    <FormControl>
                      <Input placeholder="214 25% 95%" {...field} />
                    </FormControl>
                    <Input
                        type="color"
                        className="p-1 h-10 w-16 cursor-pointer"
                        value={hslToHex(field.value)}
                        onChange={(e) => field.onChange(hexToHsl(e.target.value))}
                    />
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="primary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>მთავარი ფერი (Primary)</FormLabel>
                  <div className="flex items-center gap-4">
                    <FormControl>
                      <Input placeholder="211 32% 28%" {...field} />
                    </FormControl>
                    <Input
                        type="color"
                        className="p-1 h-10 w-16 cursor-pointer"
                        value={hslToHex(field.value)}
                        onChange={(e) => field.onChange(hexToHsl(e.target.value))}
                    />
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="accent"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>აქცენტის ფერი (Accent)</FormLabel>
                   <div className="flex items-center gap-4">
                    <FormControl>
                      <Input placeholder="267 33% 44%" {...field} />
                    </FormControl>
                    <Input
                        type="color"
                        className="p-1 h-10 w-16 cursor-pointer"
                        value={hslToHex(field.value)}
                        onChange={(e) => field.onChange(hexToHsl(e.target.value))}
                    />
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-between items-center pt-4">
                <Button type="button" variant="ghost" onClick={resetTheme}>
                    <RefreshCcw className="mr-2 h-4 w-4" />
                    საწყისზე დაბრუნება
                </Button>
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    შენახვა
                </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
