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
import { THEME_KEY_PREFIX, defaultTheme, type Theme } from '@/lib/theme';

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
  const { toast } = useToast();
  const storageKey = `${THEME_KEY_PREFIX}${schoolId}`;

  const form = useForm<Theme>({
    resolver: zodResolver(themeSchema),
    defaultValues: defaultTheme,
  });

  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem(storageKey);
      if (savedTheme) {
        form.reset(JSON.parse(savedTheme));
      }
    } catch (error) {
      console.error("Could not load theme:", error);
    }
  }, [form, storageKey]);

  function onSubmit(values: Theme) {
    setIsLoading(true);
    try {
        localStorage.setItem(storageKey, JSON.stringify(values));
        window.dispatchEvent(new StorageEvent('storage', { key: storageKey, newValue: JSON.stringify(values) }));

        toast({
            title: "გარეგნობა შენახულია",
            description: "განახლებული თემა აისახა დაფაზე.",
        });
    } catch (error) {
        toast({
            title: "შენახვა ვერ მოხერხდა",
            description: "დაფიქსირდა შეცდომა.",
            variant: 'destructive',
        });
    } finally {
        setIsLoading(false);
    }
  }
  
  const resetTheme = () => {
    localStorage.removeItem(storageKey);
    window.dispatchEvent(new StorageEvent('storage', { key: storageKey, newValue: null }));
    form.reset(defaultTheme);
    toast({ title: "თემა საწყის მდგომარეობაში დაბრუნდა" });
  }

  const ColorPreview = ({ hsl }: { hsl: string }) => {
    const [color, setColor] = useState(hsl);
    useEffect(() => setColor(hsl), [hsl]);
    
    return (
      <div className="w-8 h-8 rounded-md border" style={{ backgroundColor: `hsl(${color})` }} />
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>დაფის გარეგნობის რედაქტორი</CardTitle>
        <CardDescription>
          შეცვალეთ ძირითადი ფერები (ფონი, მთავარი, აქცენტი). ფერები უნდა მიუთითოთ HSL ფორმატში (მაგ: 211 32% 28%).
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
                  <div className="flex items-center gap-2">
                    <FormControl>
                      <Input placeholder="214 25% 95%" {...field} />
                    </FormControl>
                    <ColorPreview hsl={field.value} />
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
                  <div className="flex items-center gap-2">
                    <FormControl>
                      <Input placeholder="211 32% 28%" {...field} />
                    </FormControl>
                     <ColorPreview hsl={field.value} />
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
                   <div className="flex items-center gap-2">
                    <FormControl>
                      <Input placeholder="267 33% 44%" {...field} />
                    </FormControl>
                    <ColorPreview hsl={field.value} />
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
