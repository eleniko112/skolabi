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
import { useDoc, useFirestore, useMemoFirebase, updateDocumentNonBlocking, addDocumentNonBlocking } from '@/firebase';
import { doc, collection } from 'firebase/firestore';
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
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const firestore = useFirestore();

  const emergencyDocRef = useMemoFirebase(() => {
    if (!firestore || !schoolId) return null;
    return doc(firestore, 'schools', schoolId, 'config', 'emergency');
  }, [firestore, schoolId]);

  const { data: emergencyState, isLoading: isDocLoading } = useDoc<EmergencyState>(emergencyDocRef);

  const form = useForm<EmergencyFormState>({
    resolver: zodResolver(emergencySchema),
    defaultValues: {
        active: false,
        message: 'ყურადღება! სასწავლო პროცესი შეწყვეტილია. გთხოვთ, შეინარჩუნოთ სიმშვიდე და მიჰყვეთ ინსტრუქციებს.',
    },
  });

  useEffect(() => {
    if (emergencyState) {
        form.reset(emergencyState);
    }
  }, [emergencyState, form]);
  
  const historyCollectionRef = useMemoFirebase(() => {
      if (!firestore || !schoolId) return null;
      return collection(firestore, `schools/${schoolId}/history`);
  }, [firestore, schoolId]);


  const isActive = form.watch('active');

  function onSubmit(values: EmergencyFormState) {
    if (!emergencyDocRef) return;
    setIsLoading(true);

    updateDocumentNonBlocking(emergencyDocRef, values);
    
    if (historyCollectionRef) {
        addDocumentNonBlocking(historyCollectionRef, {
            action: "საგანგებო რეჟიმის განახლება",
            details: values.active ? `გააქტიურდა შეტყობინებით: "${values.message}"` : "რეჟიმი გამოირთო",
            timestamp: new Date().toISOString(),
        });
    }

    toast({
        title: "პარამეტრები შენახულია",
        description: "საგანგებო რეჟიმის სტატუსი განახლდა.",
        variant: values.active ? 'destructive' : 'default',
    });
    setIsLoading(false);
  }

  if (isDocLoading) {
      return (
          <Card>
              <CardHeader>
                  <CardTitle>საგანგებო განცხადების მართვა</CardTitle>
                  <CardDescription>
                  აქციეთ საგანგებო რეჟიმი, რათა დაფაზე გამოჩნდეს მნიშვნელოვანი შეტყობინება.
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
            
            <Button type="submit" className="w-full" disabled={isLoading || isDocLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              შენახვა
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
