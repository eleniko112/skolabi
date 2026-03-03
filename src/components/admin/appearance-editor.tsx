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
import { updateSchool } from '@/lib/schools';
import { addHistoryLog } from '@/lib/history';
import { School } from '@/lib/types';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { hslToHex, hexToHsl } from '@/lib/theme';

interface AppearanceEditorProps {
    schoolId: string;
}

const appearanceSchema = z.object({
  backgroundColor: z.string().min(1, "სავალდებულო ველი"),
  themeColor: z.string().min(1, "სავალდებულო ველი"),
  accentColor: z.string().min(1, "სავალდებულო ველი"),
});

export function AppearanceEditor({ schoolId }: AppearanceEditorProps) {
  const firestore = useFirestore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const schoolRef = useMemoFirebase(() => {
    if (!firestore || !schoolId) return null;
    return doc(firestore, 'schools', schoolId);
  }, [firestore, schoolId]);

  const { data: school, isLoading } = useDoc<School>(schoolRef);

  const form = useForm({
    resolver: zodResolver(appearanceSchema),
    defaultValues: {
      backgroundColor: "220 20% 97%",
      themeColor: "221 39% 49%",
      accentColor: "347 77% 60%",
    },
  });

  useEffect(() => {
    if (school) {
      form.reset({
        backgroundColor: school.backgroundColor || "220 20% 97%",
        themeColor: school.themeColor || "221 39% 49%",
        accentColor: school.accentColor || "347 77% 60%",
      });
    }
  }, [school, form]);

  function onSubmit(values: any) {
    if (!firestore || !school) return;
    setIsSubmitting(true);
    
    updateSchool(firestore, {
        ...school,
        ...values,
    });
    
    addHistoryLog(firestore, schoolId, {
        action: "გარეგნობის განახლება", 
        details: "სკოლის თემის ფერები შეიცვალა.",
        adminIdentifier: "admin"
    });

    toast({
        title: "გარეგნობა შენახულია",
        description: "განახლებული თემა აისახა დაფაზე.",
    });
    setIsSubmitting(false);
  }
  
  const resetTheme = () => {
    if (!firestore || !school) return;
    const defaultColors = {
        backgroundColor: "220 20% 97%",
        themeColor: "221 39% 49%",
        accentColor: "347 77% 60%",
    };
    
    updateSchool(firestore, {
        ...school,
        ...defaultColors,
    });
    
    form.reset(defaultColors);
    
    addHistoryLog(firestore, schoolId, {
        action: "გარეგნობის განახლება",
        details: "თემა დაუბრუნდა საწყის მდგომარეობას.",
        adminIdentifier: "admin"
    });
    toast({ title: "თემა საწყის მდგომარეობაში დაბრუნდა" });
  }

  if(isLoading) {
      return (
          <Card>
              <CardHeader>
                <CardTitle>დაფის გარეგნობის რედაქტორი</CardTitle>
                <CardDescription>იტვირთება...</CardDescription>
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
          შეცვალეთ ძირითადი ფერები (ფონი, მთავარი, აქცენტი). გამოიყენეთ პალიტრა ან შეიყვანეთ ფერი HSL ფორმატში (მაგ: 221 39% 49%).
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="backgroundColor"
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
              name="themeColor"
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
              name="accentColor"
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
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    შენახვა
                </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
