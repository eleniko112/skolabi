"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, Siren } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { setEmergencyState } from '@/lib/emergency';
import { addHistoryLog } from '@/lib/history';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { EmergencyState } from '@/lib/types';

interface EmergencyEditorProps {
    schoolId: string;
}

const emergencySchema = z.object({
  active: z.boolean(),
  message: z.string().min(10, "შეტყობინება უნდა შეიცავდეს მინიმუმ 10 სიმბოლოს.").max(200, "შეტყობინება არ უნდა აღემატებოდეს 200 სიმბოლოს."),
});

type EmergencyFormState = z.infer<typeof emergencySchema>;

export function EmergencyEditor({ schoolId }: EmergencyEditorProps) {
  const firestore = useFirestore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const emergencyRef = useMemoFirebase(() => {
    if (!firestore || !schoolId) return null;
    return doc(firestore, 'schools', schoolId, 'emergencyAnnouncements', 'active');
  }, [firestore, schoolId]);

  const { data: emergencyData, isLoading } = useDoc<EmergencyState>(emergencyRef);

  const form = useForm<EmergencyFormState>({
    resolver: zodResolver(emergencySchema),
    defaultValues: {
      active: false,
      message: "ყურადღება! სკოლაში გამოცხადებულია საგანგებო მდგომარეობა. გთხოვთ, მიჰყვეთ ინსტრუქციებს.",
    },
  });

  useEffect(() => {
    if (emergencyData) {
      form.reset({
        active: emergencyData.active,
        message: emergencyData.message,
      });
    }
  }, [emergencyData, form]);

  const isActive = form.watch('active');

  function onSubmit(values: EmergencyFormState) {
    if (!firestore) return;
    setIsSubmitting(true);
    setEmergencyState(firestore, schoolId, values);
    addHistoryLog(firestore, schoolId, {
        action: "საგანგებო რეჟიმის განახლება",
        details: values.active ? `გააქტიურდა შეტყობინებით: "${values.message}"` : "რეჟიმი გამოირთო",
        adminIdentifier: "admin"
    });
    toast({
        title: "პარამეტრები შენახულია",
        description: "საგანგებო რეჟიმის სტატუსი განახლდა.",
        variant: values.active ? 'destructive' : 'default',
    });
    setIsSubmitting(false);
  }

  if (isLoading) {
      return (
          <Card>
              <CardHeader>
                  <CardTitle>საგანგებო განცხადების მართვა</CardTitle>
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
        <CardTitle>საგანგებო განცხადების მართვა</CardTitle>
        <CardDescription>
          აქციეთ საგანგებო რეჟიმი, რათა დაფაზე გამოჩნდეს მნიშვნელოვანი შეტყობინება.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">საგანგებო რეჟიმის გააქტიურება</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      {field.value ? 'რეჟიმი გააქტიურებულია' : 'რეჟიმი გამორთულია'}
                    </p>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            {isActive && (
              <Alert variant="destructive">
                <Siren className="h-4 w-4" />
                <AlertTitle>ყურადღება!</AlertTitle>
                <AlertDescription>
                  საგანგებო რეჟიმის გააქტიურებისას, დაფაზე გამოჩნდება მხოლოდ ეს შეტყობინება.
                </AlertDescription>
              </Alert>
            )}

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>საგანგებო შეტყობინება</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="შეიყვანეთ საგანგებო შეტყობინების ტექსტი..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              შენახვა
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
