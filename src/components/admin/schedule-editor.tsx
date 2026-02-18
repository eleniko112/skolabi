"use client";

import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, PlusCircle, Trash2 } from 'lucide-react';
import { SchedulePeriod } from '@/lib/types';
import { useDoc, useFirestore, useMemoFirebase, updateDocumentNonBlocking, addDocumentNonBlocking } from '@/firebase';
import { doc, collection } from 'firebase/firestore';


interface ScheduleEditorProps {
    schoolId: string;
}

const scheduleItemSchema = z.object({
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "დრო უნდა იყოს HH:MM ფორმატში"),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, "დრო უნდა იყოს HH:MM ფორმატში"),
  label: z.string().min(1, "სავალდებულო ველი"),
});

const scheduleSchema = z.object({
  periods: z.array(scheduleItemSchema),
});

type ScheduleFormValues = z.infer<typeof scheduleSchema>;

const defaultSchedule: SchedulePeriod[] = [
    { startTime: '09:00', endTime: '09:45', label: '1-ლი გაკვეთილი' },
    { startTime: '09:45', endTime: '10:00', label: 'დასვენება' },
    { startTime: '10:00', endTime: '10:45', label: 'მე-2 გაკვეთილი' },
    { startTime: '10:45', endTime: '11:00', label: 'დასვენება' },
    { startTime: '11:00', endTime: '11:45', label: 'მე-3 გაკვეთილი' },
    { startTime: '11:45', endTime: '12:00', label: 'დასვენება' },
    { startTime: '12:00', endTime: '12:45', label: 'მე-4 გაკვეთილი' },
    { startTime: '12:45', endTime: '13:30', label: 'დიდი დასვენება' },
    { startTime: '13:30', endTime: '14:15', label: 'მე-5 გაკვეთილი' },
    { startTime: '14:15', endTime: '14:30', label: 'დასვენება' },
    { startTime: '14:30', endTime: '15:15', label: 'მე-6 გაკვეთილი' },
    { startTime: '15:15', endTime: '15:30', label: 'დასვენება' },
    { startTime: '15:30', endTime: '16:15', label: 'მე-7 გაკვეთილი' },
    { startTime: '16:15', endTime: '16:15', label: 'გაკვეთილები დასრულდა' },
];

export function ScheduleEditor({ schoolId }: ScheduleEditorProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const firestore = useFirestore();

  const scheduleDocRef = useMemoFirebase(() => {
    if (!firestore || !schoolId) return null;
    return doc(firestore, 'schools', schoolId, 'config', 'schedule');
  }, [firestore, schoolId]);

  const { data: scheduleData, isLoading: isDocLoading } = useDoc<{ periods: SchedulePeriod[] }>(scheduleDocRef);

  const form = useForm<ScheduleFormValues>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
      periods: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "periods",
  });

  useEffect(() => {
    const schedule = scheduleData?.periods;
    if (schedule) {
        form.reset({ periods: schedule });
    } else {
        form.reset({ periods: defaultSchedule });
    }
  }, [scheduleData, form]);

  const historyCollectionRef = useMemoFirebase(() => {
      if (!firestore || !schoolId) return null;
      return collection(firestore, `schools/${schoolId}/history`);
  }, [firestore, schoolId]);

  function onSubmit(values: ScheduleFormValues) {
    if (!scheduleDocRef) return;
    setIsLoading(true);

    const sortedSchedule = [...values.periods].sort((a, b) => a.startTime.localeCompare(b.startTime));
    const finalValues = { periods: sortedSchedule };
    
    updateDocumentNonBlocking(scheduleDocRef, finalValues);

    form.reset(finalValues);
    
    if (historyCollectionRef) {
        addDocumentNonBlocking(historyCollectionRef, {
            action: "განრიგის განახლება",
            details: `განრიგი განახლდა ${finalValues.periods.length} პერიოდით.`,
            timestamp: new Date().toISOString(),
        });
    }

    toast({
        title: "განრიგი შენახულია",
        description: "განახლებული ზარების განრიგი აისახა დაფაზე.",
    });

    setIsLoading(false);
  }

  if (isDocLoading) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>ზარების განრიგის რედაქტორი</CardTitle>
                <CardDescription>დაამატეთ, შეცვალეთ ან წაშალეთ გაკვეთილების და დასვენებების პერიოდები. ცვლილებები ავტომატურად აისახება მთავარ დაფაზე.</CardDescription>
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
        <CardTitle>ზარების განრიგის რედაქტორი</CardTitle>
        <CardDescription>
          დაამატეთ, შეცვალეთ ან წაშალეთ გაკვეთილების და დასვენებების პერიოდები. ცვლილებები ავტომატურად აისახება მთავარ დაფაზე.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
              {fields.map((field, index) => (
                <div key={field.id} className="flex items-end gap-2 p-3 border rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-grow">
                        <FormField
                            control={form.control}
                            name={`periods.${index}.startTime`}
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>დაწყება</FormLabel>
                                <FormControl>
                                    <Input type="time" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name={`periods.${index}.endTime`}
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>დასრულება</FormLabel>
                                <FormControl>
                                    <Input type="time" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name={`periods.${index}.label`}
                            render={({ field }) => (
                                <FormItem className="md:col-span-1">
                                <FormLabel>აღწერა</FormLabel>
                                <FormControl>
                                    <Input placeholder="მაგ: 1-ლი გაკვეთილი" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">წაშლა</span>
                  </Button>
                </div>
              ))}
            </div>
            <div className='flex items-center justify-between'>
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => append({ startTime: '16:30', endTime: '17:15', label: 'ახალი პერიოდი' })}
                >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    დამატება
                </Button>
                <div className='flex items-center gap-2'>
                    <Button type="button" variant='ghost' onClick={() => form.reset({ periods: defaultSchedule })}>
                        გადატვირთვა
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        შენახვა
                    </Button>
                </div>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
