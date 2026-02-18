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
import { addHistoryLog } from '@/lib/history';

interface AppearanceEditorProps {
    schoolId: string;
}

const themeSchema = z.object({
  background: z.string().min(1, "Required"),
  primary: z.string().min(1, "Required"),
  accent: z.string().min(1, "Required"),
});

// Helper functions for color conversion
const HSL_REGEX = /^\s*(\d+)\s+([\d.]+)%\s+([\d.]+)%\s*$/;

function hslToHex(hsl: string): string {
    if (!hsl) return '#000000';
    const match = hsl.match(HSL_REGEX);
    if (!match) {
        // Return a default color if HSL is invalid, maybe log a warning.
        // This prevents the color picker from crashing on bad manual input.
        return '#000000';
    }
    let h = parseInt(match[1]);
    let s = parseFloat(match[2]);
    let l = parseFloat(match[3]);

    l /= 100;
    const a = s * Math.min(l, 1 - l) / 100;
    const f = (n: number) => {
        const k = (n + h / 30) % 12;
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
}

function hexToHsl(hex: string): string {
    let r = 0, g = 0, b = 0;
    if (hex.length === 4) { // #RGB
        r = parseInt(hex[1] + hex[1], 16);
        g = parseInt(hex[2] + hex[2], 16);
        b = parseInt(hex[3] + hex[3], 16);
    } else if (hex.length === 7) { // #RRGGBB
        r = parseInt(hex.substring(1, 3), 16);
        g = parseInt(hex.substring(3, 5), 16);
        b = parseInt(hex.substring(5, 7), 16);
    }

    r /= 255;
    g /= 255;
    b /= 255;
    const cmin = Math.min(r, g, b);
    const cmax = Math.max(r, g, b);
    const delta = cmax - cmin;
    let h = 0, s = 0, l = 0;

    if (delta === 0) h = 0;
    else if (cmax === r) h = ((g - b) / delta) % 6;
    else if (cmax === g) h = (b - r) / delta + 2;
    else h = (r - g) / delta + 4;

    h = Math.round(h * 60);
    if (h < 0) h += 360;

    l = (cmax + cmin) / 2;
    s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
    s = +(s * 100).toFixed(1);
    l = +(l * 100).toFixed(1);

    return `${h} ${s}% ${l}%`;
}


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

        addHistoryLog(schoolId, "გარეგნობის განახლება", "ძირითადი ფერები შეიცვალა.");

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
    addHistoryLog(schoolId, "გარეგნობის განახლება", "თემა დაუბრუნდა საწყის მდგომარეობას.");
    toast({ title: "თემა საწყის მდგომარეობაში დაბრუნდა" });
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
