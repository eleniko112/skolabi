"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, PlusCircle, Wand2, BookText, Trash2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '../ui/badge';
import { generateAnnouncement } from '@/ai/flows/generate-announcement';
import { summarizeAnnouncement } from '@/ai/flows/summarize-announcement';


interface AnnouncementEditorProps {
    schoolId: string;
}

// Dummy data
const announcementsData = [
    { id: '1', title: 'ტრენინგი AI-ზე', isActive: true, startDate: '2024-05-20', endDate: '2024-05-28' },
    { id: '2', title: 'სასკოლო სპორტული დღე', isActive: true, startDate: '2024-05-22', endDate: '2024-06-01' },
    { id: '3', title: 'საგაზაფხულო კონცერტი', isActive: false, startDate: '2024-05-25', endDate: '2024-05-25' },
];

const announcementSchema = z.object({
  title: z.string().min(3, "სათაური უნდა შეიცავდეს მინიმუმ 3 სიმბოლოს."),
  content: z.string().min(10, "შინაარსი უნდა შეიცავდეს მინიმუმ 10 სიმბოლოს."),
  imageUrl: z.string().url("გთხოვთ მიუთითოთ ვალიდური სურათის მისამართი."),
});

export function AnnouncementEditor({ schoolId }: AnnouncementEditorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof announcementSchema>>({
    resolver: zodResolver(announcementSchema),
    defaultValues: {
      title: "",
      content: "",
      imageUrl: "https://picsum.photos/seed/placeholder/1200/800",
    }
  });

  const handleGenerate = async () => {
    const title = form.getValues("title");
    if (!title) {
        toast({ variant: 'destructive', title: 'სათაური ცარიელია', description: 'გთხოვთ, შეიყვანეთ იდეა სათაურის ველში გენერაციისთვის.' });
        return;
    }
    setIsGenerating(true);
    try {
        const result = await generateAnnouncement({ promptText: title });
        form.setValue("content", result.announcementText);
        toast({ title: 'შინაარსი დაგენერირდა', description: 'AI-მ შექმნა განცხადების ტექსტი თქვენი იდეის საფუძველზე.' });
    } catch(e) {
        toast({ variant: 'destructive', title: 'გენერაცია წარუმატებელია', description: 'დაფიქსირდა შეცდომა.' });
    } finally {
        setIsGenerating(false);
    }
  }

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
    console.log(values);
    toast({ title: "განცხადება შენახულია", description: "თქვენი ცვლილებები აისახა დაფაზე." });
    form.reset();
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
            <Card>
                <CardHeader>
                    <CardTitle>არსებული განცხადებები</CardTitle>
                    <CardDescription>აქ შეგიძლიათ ნახოთ, შეცვალოთ ან წაშალოთ არსებული განცხადებები.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>სათაური</TableHead>
                                <TableHead>სტატუსი</TableHead>
                                <TableHead>აქტიურია (დან)</TableHead>
                                <TableHead>აქტიურია (მდე)</TableHead>
                                <TableHead className="text-right">მოქმედებები</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {announcementsData.map(ann => (
                                <TableRow key={ann.id}>
                                    <TableCell className="font-medium">{ann.title}</TableCell>
                                    <TableCell><Badge variant={ann.isActive ? 'default' : 'secondary'}>{ann.isActive ? 'აქტიური' : 'არააქტიური'}</Badge></TableCell>
                                    <TableCell>{ann.startDate}</TableCell>
                                    <TableCell>{ann.endDate}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button>
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
                    <FormLabel>სათაური / იდეა გენერაციისთვის</FormLabel>
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
                      <Textarea placeholder="განცხადების სრული ტექსტი..." className="min-h-[150px]" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex gap-2">
                <Button type="button" variant="outline" size="sm" onClick={handleGenerate} disabled={isGenerating}>
                    {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Wand2 className="mr-2 h-4 w-4"/>}
                    გენერაცია
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={handleSummarize} disabled={isGenerating}>
                    {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <BookText className="mr-2 h-4 w-4"/>}
                    შეჯამება
                </Button>
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
