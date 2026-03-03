"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  ShieldAlert, 
  Loader2, 
  ArrowLeft, 
  Building, 
  Megaphone, 
  PlusCircle, 
  Trash2,
  KeyRound,
  LayoutDashboard
} from 'lucide-react';
import { getSchools, addSchool, deleteSchool } from '@/lib/schools';
import { addAnnouncement } from '@/lib/announcements';
import { setEmergencyState } from '@/lib/emergency';
import { School } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';

const SUPER_PIN = '9999';

const pinSchema = z.object({
  pin: z.string().length(4, 'PIN კოდი უნდა შედგებოდეს 4 ციფრისგან'),
});

const schoolSchema = z.object({
  id: z.string().min(3, "ID უნდა იყოს მინიმუმ 3 სიმბოლო"),
  name: z.string().min(3, "სახელი უნდა იყოს მინიმუმ 3 სიმბოლო"),
  password: z.string().min(4, "პაროლი უნდა იყოს მინიმუმ 4 სიმბოლო"),
  adminPin: z.string().length(4, "ადმინ PIN უნდა იყოს 4 სიმბოლო"),
});

const globalAnnouncementSchema = z.object({
  title: z.string().min(3, "სათაური აუცილებელია"),
  content: z.string().min(10, "შინაარსი აუცილებელია"),
});

const globalEmergencySchema = z.object({
  message: z.string().min(10, "შეტყობინება აუცილებელია"),
});

export function SuperAdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [schools, setSchools] = useState<School[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isAuthenticated) {
      setSchools(getSchools(true));
    }
  }, [isAuthenticated]);

  const pinForm = useForm<z.infer<typeof pinSchema>>({
    resolver: zodResolver(pinSchema),
    defaultValues: { pin: '' },
  });

  const schoolForm = useForm<z.infer<typeof schoolSchema>>({
    resolver: zodResolver(schoolSchema),
    defaultValues: { id: '', name: '', password: '', adminPin: '' },
  });

  const announcementForm = useForm<z.infer<typeof globalAnnouncementSchema>>({
    resolver: zodResolver(globalAnnouncementSchema),
    defaultValues: { title: '', content: '' },
  });

  const emergencyForm = useForm<z.infer<typeof globalEmergencySchema>>({
    resolver: zodResolver(globalEmergencySchema),
    defaultValues: { message: 'საგანგებო სიტუაცია! გთხოვთ დატოვოთ შენობა.' },
  });

  const onPinSubmit = (values: z.infer<typeof pinSchema>) => {
    if (values.pin === SUPER_PIN) {
      setIsAuthenticated(true);
      toast({ title: 'წარმატება', description: 'კეთილი იყოს თქვენი მობრძანება სუპერ ადმინისტრატორის პანელში.' });
    } else {
      toast({ variant: 'destructive', title: 'შეცდომა', description: 'არასწორი PIN კოდი.' });
    }
  };

  const onAddSchool = (values: z.infer<typeof schoolSchema>) => {
    addSchool(values);
    setSchools(getSchools());
    schoolForm.reset();
    toast({ title: 'სკოლა დაემატა', description: `${values.name} წარმატებით დაემატა სიაში.` });
  };

  const onDeleteSchool = (schoolId: string) => {
    deleteSchool(schoolId);
    setSchools(getSchools());
    toast({ title: 'სკოლა წაიშალა' });
  };

  const onGlobalAnnouncement = (values: z.infer<typeof globalAnnouncementSchema>) => {
    const today = new Date().toISOString().split('T')[0];
    const farFuture = '2099-12-31';
    
    schools.forEach(school => {
      addAnnouncement(school.id, {
        title: values.title,
        content: values.content,
        imageUrl: "https://picsum.photos/seed/global/1200/800",
        imageHint: "school news",
        startDate: today,
        endDate: farFuture,
      });
    });
    
    announcementForm.reset();
    toast({ title: 'განცხადება გაიგზავნა', description: 'განცხადება დაემატა ყველა სკოლის დაფაზე.' });
  };

  const onGlobalEmergency = (values: z.infer<typeof globalEmergencySchema>, active: boolean) => {
    schools.forEach(school => {
      setEmergencyState(school.id, { active, message: values.message });
    });
    toast({ 
      title: active ? 'საგანგებო რეჟიმი გააქტიურდა' : 'საგანგებო რეჟიმი გამოირთო',
      variant: active ? 'destructive' : 'default'
    });
  };

  if (!isAuthenticated) {
    return (
      <Dialog open={!isAuthenticated} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-[425px]" hideCloseButton>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-headline text-2xl">
              <ShieldAlert className="text-destructive" /> სუპერ ადმინი
            </DialogTitle>
            <DialogDescription>
              შეიყვანეთ სუპერ ადმინისტრატორის PIN კოდი გასაგრძელებლად.
            </DialogDescription>
          </DialogHeader>
          <Form {...pinForm}>
            <form onSubmit={pinForm.handleSubmit(onPinSubmit)} className="space-y-4 py-4">
              <FormField
                control={pinForm.control}
                name="pin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>PIN კოდი</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••" maxLength={4} className="tracking-[1em] text-center text-2xl" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex gap-2">
                <Button asChild variant="outline" className="w-full">
                  <Link href="/">გაუქმება</Link>
                </Button>
                <Button type="submit" className="w-full">შესვლა</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold font-headline text-primary flex items-center gap-3">
            <LayoutDashboard className="h-10 w-10" />
            სუპერ ადმინისტრატორის პანელი
          </h1>
          <p className="text-muted-foreground mt-1">მართეთ ყველა სკოლა და განახორციელეთ გლობალური ქმედებები.</p>
        </div>
        <Button asChild variant="outline">
          <Link href="/"><ArrowLeft className="mr-2 h-4 w-4" /> მთავარზე დაბრუნება</Link>
        </Button>
      </div>

      <Tabs defaultValue="schools" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-8">
          <TabsTrigger value="schools"><Building className="mr-2 h-4 w-4" />სკოლების მართვა</TabsTrigger>
          <TabsTrigger value="global"><Megaphone className="mr-2 h-4 w-4" />გლობალური ქმედებები</TabsTrigger>
        </TabsList>

        <TabsContent value="schools" className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>სკოლების სია</CardTitle>
                <CardDescription>სისტემაში რეგისტრირებული ყველა სკოლა.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>სახელი</TableHead>
                      <TableHead>ID</TableHead>
                      <TableHead>პაროლი</TableHead>
                      <TableHead>ადმინ PIN</TableHead>
                      <TableHead className="text-right">მოქმედება</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {schools.map(school => (
                      <TableRow key={school.id}>
                        <TableCell className="font-bold">{school.name}</TableCell>
                        <TableCell>{school.id}</TableCell>
                        <TableCell className="font-mono">{school.password}</TableCell>
                        <TableCell className="font-mono">{school.adminPin}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => onDeleteSchool(school.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>სკოლის დამატება</CardTitle>
                <CardDescription>ახალი სკოლის რეგისტრაცია სისტემაში.</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...schoolForm}>
                  <form onSubmit={schoolForm.handleSubmit(onAddSchool)} className="space-y-4">
                    <FormField
                      control={schoolForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>სკოლის სახელი</FormLabel>
                          <FormControl><Input placeholder="მაგ: მე-5 საჯარო სკოლა" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={schoolForm.control}
                      name="id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>უნიკალური ID</FormLabel>
                          <FormControl><Input placeholder="mag-5-sajaro-skola" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={schoolForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>დაფის პაროლი</FormLabel>
                          <FormControl><Input placeholder="••••" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={schoolForm.control}
                      name="adminPin"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ადმინ PIN</FormLabel>
                          <FormControl><Input placeholder="••••" maxLength={4} {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full">
                      <PlusCircle className="mr-2 h-4 w-4" /> სკოლის დამატება
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="global" className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="border-destructive/20 bg-destructive/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <ShieldAlert className="h-6 w-6" /> გლობალური საგანგებო რეჟიმი
                </CardTitle>
                <CardDescription>ეს რეჟიმი გააქტიურდება ყველა სკოლის დაფაზე ერთდროულად.</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...emergencyForm}>
                  <form className="space-y-4">
                    <FormField
                      control={emergencyForm.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>საგანგებო შეტყობინება</FormLabel>
                          <FormControl><Textarea className="bg-background" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex gap-2">
                      <Button 
                        type="button" 
                        variant="destructive" 
                        className="flex-1"
                        onClick={() => onGlobalEmergency(emergencyForm.getValues(), true)}
                      >გააქტიურება ყველგან</Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => onGlobalEmergency(emergencyForm.getValues(), false)}
                      >გამორთვა ყველგან</Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <Megaphone className="h-6 w-6" /> გლობალური განცხადება
                </CardTitle>
                <CardDescription>ეს განცხადება გამოჩნდება ყველა სკოლის დაფაზე.</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...announcementForm}>
                  <form onSubmit={announcementForm.handleSubmit(onGlobalAnnouncement)} className="space-y-4">
                    <FormField
                      control={announcementForm.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>სათაური</FormLabel>
                          <FormControl><Input placeholder="გლობალური სიახლე" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={announcementForm.control}
                      name="content"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>შინაარსი</FormLabel>
                          <FormControl><Textarea className="min-h-[100px]" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full">
                      გაგზავნა ყველა სკოლაში
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
