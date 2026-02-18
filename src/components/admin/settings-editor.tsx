"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, Music } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SETTINGS_KEY_PREFIX, defaultSettings, bellSoundOptions, type SchoolSettings } from '@/lib/settings';

interface SettingsEditorProps {
    schoolId: string;
}

const settingsSchema = z.object({
  bellSound: z.string().min(1, "სავალდებულო ველი"),
});

export function SettingsEditor({ schoolId }: SettingsEditorProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const storageKey = `${SETTINGS_KEY_PREFIX}${schoolId}`;

  const form = useForm<SchoolSettings>({
    resolver: zodResolver(settingsSchema),
    defaultValues: defaultSettings,
  });

  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem(storageKey);
      if (savedSettings) {
        form.reset(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error("Could not load settings:", error);
    }
  }, [form, storageKey]);

  function onSubmit(values: SchoolSettings) {
    setIsLoading(true);
    try {
        localStorage.setItem(storageKey, JSON.stringify(values));
        window.dispatchEvent(new StorageEvent('storage', { key: storageKey, newValue: JSON.stringify(values) }));

        toast({
            title: "პარამეტრები შენახულია",
            description: "განახლებული პარამეტრები აისახა სისტემაში.",
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>ზოგადი პარამეტრები</CardTitle>
        <CardDescription>
          სკოლის დაფის ზოგადი პარამეტრების მართვა.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="bellSound"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2"><Music className="h-4 w-4" /> ზარის ხმა</FormLabel>
                   <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="აირჩიეთ ზარის ხმა..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {bellSoundOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end items-center pt-4">
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    შენახვა
                </Button>
            </div>
          </form>
        </Form>
        <div className="mt-6 border-t pt-6">
            <h3 className="text-lg font-medium">დამატებითი პარამეტრები</h3>
            <p className="text-sm text-muted-foreground mt-2">სკოლის სახელის, ლოგოსა და პაროლის ცვლილების ფუნქციონალი მალე დაემატება.</p>
        </div>
      </CardContent>
    </Card>
  );
}
