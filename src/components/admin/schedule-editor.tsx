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
import { setSchedule } from '@/lib/schedule';
import { addHistoryLog } from '@/lib/history';
import { SchedulePeriod } from '@/lib/types';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';

interface ScheduleEditorProps {
    schoolId: string;
}

const scheduleItemSchema = z.object({
  id: z.string().optional(),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "დრო უნდა იყოს HH:MM ფორმატში"),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, "დრო უნდა იყოს HH:MM ფორმატში"),
  label: z.string().min(1, "სავალდებულო ველი"),
});

const scheduleSchema = z.object({
  periods: z.array(scheduleItemSchema),
});

type ScheduleFormValues = z.infer<typeof scheduleSchema>;

export function ScheduleEditor({ schoolId }: ScheduleEditorProps) {
  const firestore = useFirestore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const lessonsQuery = useMemoFirebase(() => {
    if (!firestore || !schoolId) return null;
    return query(
        collection(firestore, 'schools', schoolId, 'lessons'),
        orderBy('startTime')
    );
  }, [firestore, schoolId]);

  const { data: scheduleData, isLoading } = useCollection<SchedulePeriod>(lessonsQuery);

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
    if (scheduleData) {
      form.reset({ periods: scheduleData });
    }
  }, [scheduleData, form]);

  function onSubmit(values: ScheduleFormValues) {
    if (!firestore) return;
    setIsSubmitting(true);
    const sortedSchedule = [...values.periods].sort((a, b) => a.startTime.localeCompare(b.startTime));
    setSchedule(firestore, schoolId, sortedSchedule as SchedulePeriod[]);
    addHistoryLog(firestore, schoolId, {
        action: "განრიგის განახლება",
        details: `განრიგი განახლდა ${sortedSchedule.length} პერიოდით.`,
        adminIdentifier: "admin"
    });
    toast({
        title: "განრიგი შენახულია",
        description: "განახლებული ზარების განრიგი აისახა დაფაზე.",
    });
    setIsSubmitting(false);
  }

  if (isLoading) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>ზარების განრიგის რედაქტორი</CardTitle>
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
                    onClick={() => append({ startTime: '09:00', endTime: '09:45', label: 'ახალი გაკვეთილი' })}
                >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    დამატება
                </Button>
                <div className='flex items-center gap-2'>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
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
