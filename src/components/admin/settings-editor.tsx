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
import { Loader2, Save, Music, KeyRound, Image as ImageIcon, Building } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SETTINGS_KEY_PREFIX, defaultSettings, bellSoundOptions, type SchoolSettings } from '@/lib/settings';
import { getSchoolById, updateSchool } from '@/lib/schools';
import { School } from '@/lib/types';
import { Separator } from '../ui/separator';

interface SettingsEditorProps {
    schoolId: string;
}

// Combined schema for all settings
const settingsSchema = z.object({
  bellSound: z.string().min(1, "სავალდებულო ველი"),
  schoolName: z.string().min(3, "სკოლის სახელი უნდა შედგებოდეს მინიმუმ 3 სიმბოლოსგან."),
  logoUrl: z.string().url("გთხოვთ მიუთითოთ ვალიდური სურათის მისამართი.").or(z.literal('')),
  adminPin: z.string().length(4, "PIN კოდი უნდა შედგებოდეს 4 ციფრისგან."),
  boardPassword: z.string().min(4, "დაფის პაროლი უნდა იყოს მინიმუმ 4 სიმბოლო."),
});

export function SettingsEditor({ schoolId }: SettingsEditorProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const settingsStorageKey = `${SETTINGS_KEY_PREFIX}${schoolId}`;
  
  const [currentSchool, setCurrentSchool] = useState<School | null>(null);

  const form = useForm<z.infer<typeof settingsSchema>>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      bellSound: defaultSettings.bellSound,
      schoolName: '',
      logoUrl: '',
      adminPin: '',
      boardPassword: '',
    },
  });

  useEffect(() => {
    try {
      // Load general settings
      const savedSettings = localStorage.getItem(settingsStorageKey);
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        form.setValue('bellSound', parsed.bellSound || defaultSettings.bellSound);
      }

      // Load school-specific data
      const schoolData = getSchoolById(schoolId);
      if (schoolData) {
        setCurrentSchool(schoolData);
        form.setValue('schoolName', schoolData.name);
        form.setValue('logoUrl', schoolData.logoUrl || '');
        form.setValue('adminPin', schoolData.adminPin || '');
        form.setValue('boardPassword', schoolData.password || '');
      }
    } catch (error) {
      console.error("Could not load settings:", error);
    }
  }, [form, settingsStorageKey, schoolId]);

  function onSubmit(values: z.infer<typeof settingsSchema>) {
    setIsLoading(true);
    if (!currentSchool) {
        toast({ title: "შეცდომა", description: "სკოლის მონაცემები ვერ მოიძებნა.", variant: 'destructive'});
        setIsLoading(false);
        return;
    }
    try {
        // Save general settings
        const generalSettings: SchoolSettings = { bellSound: values.bellSound };
        localStorage.setItem(settingsStorageKey, JSON.stringify(generalSettings));
        window.dispatchEvent(new StorageEvent('storage', { key: settingsStorageKey, newValue: JSON.stringify(generalSettings) }));

        // Save school-specific data
        const updatedSchoolData: School = {
            ...currentSchool,
            name: values.schoolName,
            logoUrl: values.logoUrl,
            adminPin: values.adminPin,
            password: values.boardPassword,
        };
        updateSchool(updatedSchoolData);

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
          სკოლის დაფის ზოგადი და სკოლის სპეციფიკური პარამეტრების მართვა.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* General Settings */}
            <div>
              <h3 className="text-lg font-medium mb-4">დაფის პარამეტრები</h3>
              <div className='space-y-6'>
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
              </div>
            </div>

            <Separator />
            
            {/* School Specific Settings */}
            <div>
                <h3 className="text-lg font-medium mb-4">სკოლის პარამეტრები</h3>
                <div className="space-y-6">
                     <FormField
                        control={form.control}
                        name="schoolName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="flex items-center gap-2"><Building className="h-4 w-4" /> სკოლის სახელი</FormLabel>
                                <FormControl>
                                    <Input placeholder="სკოლის სრული სახელი" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="logoUrl"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="flex items-center gap-2"><ImageIcon className="h-4 w-4" /> ლოგოს მისამართი (URL)</FormLabel>
                                <FormControl>
                                    <Input placeholder="https://example.com/logo.png" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                            control={form.control}
                            name="boardPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex items-center gap-2"><KeyRound className="h-4 w-4" /> დაფის პაროლი</FormLabel>
                                    <FormControl>
                                        <Input type="text" placeholder="••••" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="adminPin"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex items-center gap-2"><KeyRound className="h-4 w-4" /> ადმინის PIN</FormLabel>
                                    <FormControl>
                                        <Input type="password" placeholder="••••" maxLength={4} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>
            </div>
            
            <div className="flex justify-end items-center pt-4">
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
