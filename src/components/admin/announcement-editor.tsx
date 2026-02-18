"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, PlusCircle, BookText, Trash2, CalendarIcon } from 'lucide-react';
import { getAnnouncements, addAnnouncement, deleteAnnouncement, updateAnnouncement } from '@/lib/announcements';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { summarizeAnnouncement } from '@/ai/flows/summarize-announcement';
import { Switch } from '@/components/ui/switch';
import { Announcement } from '@/lib/types';
import { addHistoryLog } from '@/lib/history';
import { format } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { cn } from '@/lib/utils';
import { Calendar } from '../ui/calendar';

interface AnnouncementEditorProps {
    schoolId: string;
}

const announcementSchema = z.object({
  title: z.string().min(3, "სათაური უნდა შეიცავდეს მინიმუმ 3 სიმბოლოს."),
  content: z.string().min(10, "შინაარსი უნდა შეიცავდეს მინიმუმ 10 სიმბოლოს."),
  imageUrl: z.string().url("გთხოვთ მიუთითოთ ვალიდური სურათის მისამართი.").or(z.literal('')),
  imageHint: z.string().optional(),
  startDate: z.date({ required_error: "აირჩიეთ დაწყების თარიღი" }),
  endDate: z.date({ required_error: "აირჩიეთ დასრულების თარიღი" }),
}).refine(data => data.endDate >= data.startDate, {
    message: "დასრულების თარიღი უნდა იყოს დაწყების თარიღზე გვიან.",
    path: ["endDate"],
});


export function AnnouncementEditor({ schoolId }: AnnouncementEditorProps) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    setAnnouncements(getAnnouncements(schoolId));
    setIsLoading(false);
  }, [schoolId]);

  const form = useForm<z.infer<typeof announcementSchema>>({
    resolver: zodResolver(announcementSchema),
    defaultValues: {
      title: "",
      content: "",
      imageUrl: "https://picsum.photos/seed/placeholder/1200/800",
      imageHint: "abstract placeholder",
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    }
  });

  const handleSummarize = async () => {
    const content = form.getValues("content");
    if (!content) {
        toast({ variant: 'destructive', title: 'შინაარსი ცარიელია', description: 'გთხოვთ, შეიყვანეთ ტექსტი შესაჯამებლად.' });
        return;
    }
    setIsGenerating(true);
    try {
        const result = await summarizeAnnouncement({ text: content });
        form.setValue("content", result.summary);
        toast({ title: 'ტექსტი შეჯამდა', description: 'AI-მ შეაჯამა თქვენი ტექსტი.' });
    } catch(e) {
        toast({ variant: 'destructive', title: 'შეჯამება წარუმატებელია', description: 'დაფიქსირდა შეცდომა.' });
    } finally {
        setIsGenerating(false);
    }
  }

  function onSubmit(values: z.infer<typeof announcementSchema>) {
    addAnnouncement(schoolId, { 
        ...values, 
        startDate: format(values.startDate, 'yyyy-MM-dd'),
        endDate: format(values.endDate, 'yyyy-MM-dd'),
    });
    setAnnouncements(getAnnouncements(schoolId));
    addHistoryLog(schoolId, { action: "განცხადების დამატება", details: `დაემატა ახალი განცხადება: "${values.title}"` });
    toast({ title: "განცხადება შენახულია", description: "თქვენი ცვლილებები აისახა დაფაზე." });
    form.reset();
  }

  const handleDelete = (announcementId: string) => {
    const ann = announcements.find(a => a.id === announcementId);
    if(ann) {
        addHistoryLog(schoolId, { action: "განცხადების წაშლა", details: `წაიშალა განცხადება: "${ann.title}"` });
    }
    deleteAnnouncement(schoolId, announcementId);
    setAnnouncements(getAnnouncements(schoolId));
    toast({ title: "განცხადება წაიშალა" });
  }

  const handleToggleActive = (announcementId: string, isActive: boolean) => {
    const ann = announcements.find(a => a.id === announcementId);
     if (ann) {
      const updatedAnnouncement = { ...ann, isActive };
      updateAnnouncement(schoolId, updatedAnnouncement);
      setAnnouncements(getAnnouncements(schoolId));
      addHistoryLog(schoolId, { action: "განცხადების სტატუსის ცვლილება", details: `განცხადების "${ann.title}" სტატუსი შეიცვალა: ${isActive ? 'აქტიური' : 'არააქტიური'}` });
      toast({ title: 'სტატუსი განახლდა' });
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
            <Card>
                <CardHeader>
                    <CardTitle>არსებული განცხადებები</CardTitle>
                    <CardDescription>აქ შეგიძლიათ ნახოთ, გაააქტიუროთ ან წაშალოთ არსებული განცხადებები.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>სტატუსი</TableHead>
                                <TableHead>სათაური</TableHead>
                                <TableHead>აქტიურია (დან)</TableHead>
                                <TableHead>აქტიურია (მდე)</TableHead>
                                <TableHead className="text-right">მოქმედებები</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center">
                                        <Loader2 className="h-6 w-6 animate-spin inline-block" />
                                    </TableCell>
                                </TableRow>
                            )}
                            {announcements.map(ann => (
                                <TableRow key={ann.id} className={!ann.isActive ? 'bg-muted/50' : ''}>
                                    <TableCell>
                                        <Switch
                                            checked={ann.isActive}
                                            onCheckedChange={(checked) => handleToggleActive(ann.id, checked)}
                                            aria-label="Toggle announcement"
                                        />
                                    </TableCell>
                                    <TableCell className="font-medium">{ann.title}</TableCell>
                                    <TableCell>{ann.startDate}</TableCell>
                                    <TableCell>{ann.endDate}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" onClick={() => handleDelete(ann.id)}>
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                            <span className="sr-only">წაშლა</span>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
      <Card>
        <CardHeader>
          <CardTitle>ახალი განცხადების დამატება</CardTitle>
          <CardDescription>
            შეავსეთ ფორმა ან გამოიყენეთ AI ასისტენტი ტექსტის შესაქმნელად.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>სათაური</FormLabel>
                    <FormControl>
                      <Input placeholder="მაგ: სპორტული შეჯიბრი ფეხბურთში" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>შინაარსი</FormLabel>
                    <FormControl>
                      <Textarea placeholder="განცხადების სრული ტექსტი..." className="min-h-[120px]" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex gap-2">
                <Button type="button" variant="outline" size="sm" onClick={handleSummarize} disabled={isGenerating}>
                    {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <BookText className="mr-2 h-4 w-4"/>}
                    შეჯამება
                </Button>
              </div>

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                        <FormLabel>დაწყების თარიღი</FormLabel>
                        <Popover>
                            <PopoverTrigger asChild>
                            <FormControl>
                                <Button
                                variant={"outline"}
                                className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                )}
                                >
                                {field.value ? (
                                    format(field.value, "PPP")
                                ) : (
                                    <span>აირჩიეთ თარიღი</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                            </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) => date < new Date(new Date().setDate(new Date().getDate()-1))}
                                initialFocus
                            />
                            </PopoverContent>
                        </Popover>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                        <FormLabel>დასრულების თარიღი</FormLabel>
                        <Popover>
                            <PopoverTrigger asChild>
                            <FormControl>
                                <Button
                                variant={"outline"}
                                className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                )}
                                >
                                {field.value ? (
                                    format(field.value, "PPP")
                                ) : (
                                    <span>აირჩიეთ თარიღი</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                            </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) => date < (form.getValues("startDate") || new Date())}
                                initialFocus
                            />
                            </PopoverContent>
                        </Popover>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                </div>

              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>სურათის მისამართი (URL)</FormLabel>
                    <FormControl>
                      <Input placeholder="https://..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="imageHint"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>სურათის აღწერა (AI-სთვის)</FormLabel>
                    <FormControl>
                      <Input placeholder="მაგ: students concert" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">
                <PlusCircle className="mr-2 h-4 w-4" />
                დამატება
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
