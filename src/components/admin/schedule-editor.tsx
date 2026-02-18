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
import { defaultSchedule, SCHEDULE_KEY_PREFIX, SchedulePeriod } from '@/lib/schedule';
import { addHistoryLog } from '@/lib/history';

interface ScheduleEditorProps {
    schoolId: string;
}

const scheduleItemSchema = z.object({
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "დრო უნდა იყოს HH:MM ფორმატში"),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, "დრო უნდა იყოს HH:MM ფორმატში"),
  label: z.string().min(1, "სავალდებულო ველი"),
});

const scheduleSchema = z.object({
  schedule: z.array(scheduleItemSchema),
});

type ScheduleFormValues = z.infer<typeof scheduleSchema>;

export function ScheduleEditor({ schoolId }: ScheduleEditorProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const storageKey = `${SCHEDULE_KEY_PREFIX}${schoolId}`;

  const form = useForm<ScheduleFormValues>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
      schedule: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "schedule",
  });

  useEffect(() => {
    try {
      const savedSchedule = localStorage.getItem(storageKey);
      if (savedSchedule) {
        form.reset({ schedule: JSON.parse(savedSchedule) });
      } else {
        form.reset({ schedule: defaultSchedule });
      }
    } catch (error) {
      console.error("Could not load schedule state:", error);
      form.reset({ schedule: defaultSchedule });
    }
  }, [form, storageKey]);

  function onSubmit(values: ScheduleFormValues) {
    setIsLoading(true);
    try {
        // Sort schedule by time before saving
        const sortedSchedule = [...values.schedule].sort((a, b) => a.startTime.localeCompare(b.startTime));
        const finalValues = { schedule: sortedSchedule };
        
        localStorage.setItem(storageKey, JSON.stringify(finalValues.schedule));
        window.dispatchEvent(new StorageEvent('storage', { key: storageKey, newValue: JSON.stringify(finalValues.schedule) }));

        form.reset(finalValues); // Update form with sorted values
        
        addHistoryLog(schoolId, "განრიგის განახლება", `განრიგი განახლდა ${finalValues.schedule.length} პერიოდით.`);

        toast({
            title: "განრიგი შენახულია",
            description: "განახლებული ზარების განრიგი აისახა დაფაზე.",
        });
    } catch (error) {
        toast({
            title: "შენახვა ვერ მოხერხდა",
            description: "დაფიქსირდა შეცდომა localStorage-ში შენახვისას.",
            variant: 'destructive',
        });
    } finally {
        setIsLoading(false);
    }
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
                            name={`schedule.${index}.startTime`}
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
                            name={`schedule.${index}.endTime`}
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
                            name={`schedule.${index}.label`}
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
                    <Button type="button" variant='ghost' onClick={() => form.reset({ schedule: defaultSchedule })}>
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
