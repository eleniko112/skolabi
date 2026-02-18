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
import { Loader2, Save, Music, KeyRound, Image as ImageIcon, Building, Volume2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { School, SchoolSettings } from '@/lib/types';
import { Separator } from '../ui/separator';
import { useDoc, useFirestore, useMemoFirebase, updateDocumentNonBlocking, addDocumentNonBlocking } from '@/firebase';
import { doc, collection } from 'firebase/firestore';


interface SettingsEditorProps {
    schoolId: string;
}

const bellSoundOptions = [
  { value: 'default', label: 'სტანდარტული' },
  { value: 'digital', label: 'ციფრული' },
  { value: 'chime', label: 'წკარუნი' },
  { value: 'short-beep', label: 'მოკლე სიგნალი' },
];

const defaultSettings: SchoolSettings = {
  bellSound: 'default',
};

// Combined schema for all settings
const settingsSchema = z.object({
  bellSound: z.string().min(1, "სავალდებულო ველი"),
  schoolName: z.string().min(3, "სკოლის სახელი უნდა შედგებოდეს მინიმუმ 3 სიმბოლოსგან."),
  logoUrl: z.string().url("გთხოვთ მიუთითოთ ვალიდური სურათის მისამართი.").or(z.literal('')),
  adminPin: z.string().length(4, "PIN კოდი უნდა შედგებოდეს 4 ციფრისგან."),
  boardPassword: z.string().min(4, "დაფის პაროლი უნდა იყოს მინიმუმ 4 სიმბოლო."),
});

// Web Audio API function to play sounds
const playBellSound = (sound: string) => {
    if (typeof window === 'undefined') return;

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    if (!audioContext) {
        console.warn("Web Audio API is not supported in this browser.");
        return;
    }

    const playTone = (freq: number, duration: number, type: OscillatorType, startTime = 0) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.type = type;
        oscillator.frequency.setValueAtTime(freq, audioContext.currentTime + startTime);
        gainNode.gain.setValueAtTime(0.5, audioContext.currentTime + startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + startTime + duration);

        oscillator.start(audioContext.currentTime + startTime);
        oscillator.stop(audioContext.currentTime + startTime + duration);
    };

    switch (sound) {
        case 'digital':
            playTone(1200, 0.15, 'square');
            playTone(900, 0.2, 'square', 0.2);
            break;
        case 'chime':
            playTone(1500, 0.2, 'sine');
            playTone(1800, 0.3, 'sine', 0.2);
            playTone(2100, 0.4, 'sine', 0.5);
            break;
        case 'short-beep':
            playTone(880, 0.3, 'sine');
            break;
        case 'default':
        default:
            playTone(660, 0.4, 'triangle');
            playTone(880, 0.4, 'triangle', 0.2);
            break;
    }
};


export function SettingsEditor({ schoolId }: SettingsEditorProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const firestore = useFirestore();

  const settingsDocRef = useMemoFirebase(() => {
    if (!firestore || !schoolId) return null;
    return doc(firestore, 'schools', schoolId, 'config', 'settings');
  }, [firestore, schoolId]);

  const schoolDocRef = useMemoFirebase(() => {
    if (!firestore || !schoolId) return null;
    return doc(firestore, 'schools', schoolId);
  }, [firestore, schoolId]);

  const { data: settings, isLoading: isLoadingSettings } = useDoc<SchoolSettings>(settingsDocRef);
  const { data: school, isLoading: isLoadingSchool } = useDoc<School>(schoolDocRef);

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
    if (settings) {
        form.setValue('bellSound', settings.bellSound || defaultSettings.bellSound);
    }
    if (school) {
        form.setValue('schoolName', school.name);
        form.setValue('logoUrl', school.logoUrl || '');
        form.setValue('adminPin', school.adminPin || '');
        form.setValue('boardPassword', school.password || '');
    }
  }, [settings, school, form]);

  const historyCollectionRef = useMemoFirebase(() => {
    if (!firestore || !schoolId) return null;
    return collection(firestore, `schools/${schoolId}/history`);
  }, [firestore, schoolId]);

  function onSubmit(values: z.infer<typeof settingsSchema>) {
    if (!settingsDocRef || !schoolDocRef) return;

    setIsSubmitting(true);
    
    // Update general settings
    const generalSettings: SchoolSettings = { bellSound: values.bellSound };
    updateDocumentNonBlocking(settingsDocRef, generalSettings);

    // Update school-specific data
    const schoolData = {
        name: values.schoolName,
        logoUrl: values.logoUrl,
        adminPin: values.adminPin,
        password: values.boardPassword,
    };
    updateDocumentNonBlocking(schoolDocRef, schoolData);
    
    if (historyCollectionRef) {
        addDocumentNonBlocking(historyCollectionRef, {
            action: "პარამეტრების შენახვა",
            details: "ზოგადი და სკოლის პარამეტრები განახლდა.",
            timestamp: new Date().toISOString(),
        });
    }

    toast({
        title: "პარამეტრები შენახულია",
        description: "განახლებული პარამეტრები აისახა სისტემაში.",
    });

    setIsSubmitting(false);
  }

  const isLoading = isLoadingSettings || isLoadingSchool;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>ზოგადი პარამეტრები</CardTitle>
          <CardDescription>სკოლის დაფის ზოგადი და სკოლის სპეციფიკური პარამეტრების მართვა.</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center p-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
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
                      <Select 
                        onValueChange={(value) => {
                          field.onChange(value);
                          playBellSound(value);
                        }} 
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="აირჩიეთ ზარის ხმა..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {bellSoundOptions.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              <div className="flex items-center justify-between w-full">
                                <span>{option.label}</span>
                                <Volume2 className="h-4 w-4 ml-4 text-muted-foreground" />
                              </div>
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
