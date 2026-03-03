"use client";

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { useToast } from '@/hooks/use-toast';
import { 
  ShieldAlert, 
  Loader2, 
  ArrowLeft, 
  Trash2,
  Edit,
  ChevronUp,
  ChevronDown,
  Palette,
  Settings,
  Zap,
  Megaphone,
  Calendar,
  CloudLightning,
  PlusCircle,
  AlertTriangle,
  Image as ImageIcon,
  Clock
} from 'lucide-react';
import { useCollection, useMemoFirebase, useFirestore } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { addSchool, deleteSchool, updateSchool } from '@/lib/schools';
import { hslToHex, hexToHsl } from '@/lib/theme';
import { School, SchedulePeriod } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { addAnnouncement } from '@/lib/announcements';
import { setSchedule } from '@/lib/schedule';
import { setEmergencyState } from '@/lib/emergency';
import { format } from 'date-fns';

const SUPER_PIN = '9999';

const pinSchema = z.object({
  pin: z.string().length(4, 'PIN კოდი უნდა შედგებოდეს 4 ციფრისგან'),
});

const schoolSchema = z.object({
  id: z.string().min(3, "ID უნდა იყოს მინიმუმ 3 სიმბოლო"),
  name: z.string().min(3, "სახელი უნდა იყოს მინიმუმ 3 სიმბოლო"),
  password: z.string().min(4, "პაროლი უნდა იყოს მინიმუმ 4 სიმბოლო"),
  adminPin: z.string().length(4, "ადმინ PIN უნდა იყოს 4 სიმბოლო"),
  cardColor: z.string(),
  backgroundColor: z.string(),
  themeColor: z.string(),
  accentColor: z.string(),
});

const bulkAnnouncementSchema = z.object({
  title: z.string().min(3, "სათაური აუცილებელია"),
  content: z.string().min(10, "შინაარსი აუცილებელია"),
  imageUrl: z.string().url("გთხოვთ მიუთითოთ ვალიდური სურათის მისამართი.").or(z.literal('')),
});

const bulkScheduleSchema = z.object({
  periods: z.array(z.object({
    startTime: z.string().regex(/^\d{2}:\d{2}$/, "დრო უნდა იყოს HH:MM ფორმატში"),
    endTime: z.string().regex(/^\d{2}:\d{2}$/, "დრო უნდა იყოს HH:MM ფორმატში"),
    label: z.string().min(1, "სავალდებულო ველი"),
  })),
});

export function SuperAdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);
  const firestore = useFirestore();
  const { toast } = useToast();

  const schoolsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'schools'), orderBy('displayOrder', 'asc'));
  }, [firestore]);

  const { data: schools, isLoading: schoolsLoading } = useCollection<School>(schoolsQuery);
  const [editingSchoolId, setEditingSchoolId] = useState<string | null>(null);

  const adminLogo = PlaceHolderImages.find(img => img.id === 'super-admin-logo')?.imageUrl;

  const pinForm = useForm<z.infer<typeof pinSchema>>({
    resolver: zodResolver(pinSchema),
    defaultValues: { pin: '' },
  });

  const schoolForm = useForm<z.infer<typeof schoolSchema>>({
    resolver: zodResolver(schoolSchema),
    defaultValues: { 
      id: '', 
      name: '', 
      password: '', 
      adminPin: '',
      cardColor: '221 39% 49%',
      backgroundColor: "220 20% 97%",
      themeColor: "221 39% 49%",
      accentColor: "347 77% 60%",
    },
  });

  const bulkAnnounceForm = useForm<z.infer<typeof bulkAnnouncementSchema>>({
    resolver: zodResolver(bulkAnnouncementSchema),
    defaultValues: { 
      title: '', 
      content: '',
      imageUrl: 'https://picsum.photos/seed/bulk/1200/800'
    },
  });

  const bulkScheduleForm = useForm<z.infer<typeof bulkScheduleSchema>>({
    resolver: zodResolver(bulkScheduleSchema),
    defaultValues: {
      periods: [
        { startTime: '09:00', endTime: '09:45', label: '1-ლი გაკვეთილი' },
        { startTime: '09:55', endTime: '10:40', label: '2-რე გაკვეთილი' },
        { startTime: '10:50', endTime: '11:35', label: '3-მე გაკვეთილი' },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: bulkScheduleForm.control,
    name: "periods",
  });

  const onPinSubmit = (values: z.infer<typeof pinSchema>) => {
    if (values.pin === SUPER_PIN) {
      setIsAuthenticated(true);
      toast({ title: 'წარმატება', description: 'კეთილი იყოს თქვენი მობრძანება სუპერ ადმინისტრატორის პანელში.' });
    } else {
      toast({ variant: 'destructive', title: 'შეცდომა', description: 'არასწორი PIN კოდი.' });
    }
  };

  const onSubmitSchool = (values: z.infer<typeof schoolSchema>) => {
    if (!firestore) return;
    
    if (editingSchoolId) {
      const existing = schools?.find(s => s.id === editingSchoolId);
      updateSchool(firestore, { 
        ...values, 
        displayOrder: existing?.displayOrder ?? 0 
      });
      toast({ title: 'სკოლა განახლდა' });
      setEditingSchoolId(null);
    } else {
      const maxOrder = schools?.reduce((max, s) => Math.max(max, s.displayOrder ?? 0), -1) ?? -1;
      addSchool(firestore, { 
        ...values, 
        displayOrder: maxOrder + 1 
      });
      toast({ title: 'სკოლა დაემატა' });
    }
    schoolForm.reset();
  };

  const handleBulkAnnouncement = async (values: z.infer<typeof bulkAnnouncementSchema>) => {
    if (!firestore || !schools) return;
    setIsBulkProcessing(true);
    
    schools.forEach(school => {
      addAnnouncement(firestore, school.id, {
        title: values.title,
        content: values.content,
        imageUrl: values.imageUrl || "https://picsum.photos/seed/bulk/1200/800",
        startDate: format(new Date(), 'yyyy-MM-dd'),
        endDate: format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
      });
    });

    toast({ title: "ჯგუფური განცხადება დაგზავნილია", description: `${schools.length} სკოლა განახლდა.` });
    bulkAnnounceForm.reset();
    setIsBulkProcessing(false);
  };

  const handleBulkEmergency = (active: boolean) => {
    if (!firestore || !schools) return;
    setIsBulkProcessing(true);
    
    schools.forEach(school => {
      setEmergencyState(firestore, school.id, {
        active,
        message: active ? "ყურადღება! ყველა სკოლაში გამოცხადებულია საგანგებო მდგომარეობა." : "",
      });
    });

    toast({ 
      title: active ? "საგანგებო რეჟიმი ჩაირთო ყველასთვის" : "საგანგებო რეჟიმი გამოირთო ყველასთვის",
      variant: active ? "destructive" : "default"
    });
    setIsBulkProcessing(false);
  };

  const handleBulkSchedule = (values: z.infer<typeof bulkScheduleSchema>) => {
    if (!firestore || !schools) return;
    setIsBulkProcessing(true);

    const scheduleData: SchedulePeriod[] = values.periods.map((p, i) => ({
      id: `bulk-${i}`,
      schoolId: '',
      startTime: p.startTime,
      endTime: p.endTime,
      label: p.label,
      lessonNumber: i + 1,
    }));

    schools.forEach(school => {
      setSchedule(firestore, school.id, scheduleData);
    });

    toast({ title: "ზარების განრიგი განახლდა ყველა სკოლაში", description: `${schools.length} სკოლა განახლდა.` });
    setIsBulkProcessing(false);
  };

  const onEditClick = (school: School) => {
    setEditingSchoolId(school.id);
    schoolForm.reset({
      id: school.id,
      name: school.name,
      password: school.password || '',
      adminPin: school.adminPin || '',
      cardColor: school.cardColor || '221 39% 49%',
      backgroundColor: school.backgroundColor || '220 20% 97%',
      themeColor: school.themeColor || '221 39% 49%',
      accentColor: school.accentColor || '347 77% 60%',
    });
  };

  const moveSchool = (schoolId: string, direction: 'up' | 'down') => {
    if (!firestore || !schools) return;
    const index = schools.findIndex(s => s.id === schoolId);
    if (index === -1) return;
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === schools.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const currentSchool = schools[index];
    const targetSchool = schools[targetIndex];

    const currentOrder = currentSchool.displayOrder ?? index;
    const targetOrder = targetSchool.displayOrder ?? targetIndex;

    updateSchool(firestore, { ...currentSchool, displayOrder: targetOrder });
    updateSchool(firestore, { ...targetSchool, displayOrder: currentOrder });
  };

  if (!isAuthenticated) {
    return (
      <Dialog open={!isAuthenticated} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-[425px]" hideCloseButton>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-headline text-2xl">
              <ShieldAlert className="text-destructive" /> სუპერ ადმინი
            </DialogTitle>
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
        <div className="flex items-center gap-6">
          <div className="relative h-20 w-20 overflow-hidden rounded-2xl shadow-xl border-4 border-primary/20">
            {adminLogo && <Image src={adminLogo} alt="Super Admin" fill className="object-cover" />}
          </div>
          <div><h1 className="text-4xl font-bold font-headline text-primary">სუპერ ადმინისტრატორის პანელი</h1></div>
        </div>
        <Button asChild variant="outline"><Link href="/"><ArrowLeft className="mr-2 h-4 w-4" /> მთავარზე</Link></Button>
      </div>

      <Tabs defaultValue="schools" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="schools" className="text-lg py-3"><Settings className="mr-2 h-5 w-5" />სკოლების მართვა</TabsTrigger>
          <TabsTrigger value="bulk" className="text-lg py-3"><Zap className="mr-2 h-5 w-5" />ჯგუფური მოქმედებები</TabsTrigger>
        </TabsList>

        <TabsContent value="schools">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="font-headline">სკოლების სია</CardTitle>
                <CardDescription>მართეთ არსებული სკოლები და მათი წვდომა.</CardDescription>
              </CardHeader>
              <CardContent>
                {schoolsLoading ? <div className="flex justify-center p-8"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div> : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>რიგი</TableHead>
                        <TableHead>სახელი</TableHead>
                        <TableHead className="text-right">მართვა</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {schools?.map((school, index) => (
                        <TableRow key={school.id}>
                          <TableCell className="w-20">
                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => moveSchool(school.id, 'up')} disabled={index === 0}><ChevronUp className="h-4 w-4" /></Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => moveSchool(school.id, 'down')} disabled={index === (schools?.length || 0) - 1}><ChevronDown className="h-4 w-4" /></Button>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">{school.name}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button asChild variant="outline" size="sm" className="bg-primary/5 hover:bg-primary/10 border-primary/20">
                                <Link href={`/board/${school.id}/admin`}>
                                  <Settings className="mr-2 h-4 w-4 text-primary" /> მართვა
                                </Link>
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => onEditClick(school)} title="რედაქტირება">
                                <Edit className="h-4 w-4 text-blue-500" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => deleteSchool(firestore!, school.id)} title="წაშლა">
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {schools?.length === 0 && (
                        <TableRow><TableCell colSpan={3} className="text-center py-8 text-muted-foreground">სკოლები არ მოიძებნა.</TableCell></TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-headline">{editingSchoolId ? 'სკოლის რედაქტირება' : 'ახალი სკოლის დამატება'}</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...schoolForm}>
                  <form onSubmit={schoolForm.handleSubmit(onSubmitSchool)} className="space-y-4">
                    <FormField control={schoolForm.control} name="name" render={({ field }) => <FormItem><FormLabel>სკოლის სახელი</FormLabel><Input {...field} /></FormItem>} />
                    <FormField control={schoolForm.control} name="id" render={({ field }) => <FormItem><FormLabel>უნიკალური ID</FormLabel><Input {...field} disabled={!!editingSchoolId} /></FormItem>} />
                    <FormField control={schoolForm.control} name="password" render={({ field }) => <FormItem><FormLabel>დაფის პაროლი</FormLabel><Input {...field} /></FormItem>} />
                    <FormField control={schoolForm.control} name="adminPin" render={({ field }) => <FormItem><FormLabel>ადმინ PIN</FormLabel><Input {...field} maxLength={4} /></FormItem>} />
                    
                    <Separator className="my-4" />
                    <div className="space-y-4">
                      <h4 className="text-sm font-semibold flex items-center gap-2"><Palette className="h-4 w-4" /> ფერების პარამეტრები</h4>
                      <FormField control={schoolForm.control} name="cardColor" render={({ field }) => (
                        <FormItem>
                          <FormLabel>მთავარი ბარათის ფერი</FormLabel>
                          <div className="flex gap-2">
                            <Input {...field} placeholder="HSL: 221 39% 49%" />
                            <Input type="color" className="w-12 p-1" value={hslToHex(field.value)} onChange={(e) => field.onChange(hexToHsl(e.target.value))} />
                          </div>
                        </FormItem>
                      )} />
                      <div className="grid grid-cols-2 gap-4">
                        <FormField control={schoolForm.control} name="themeColor" render={({ field }) => (
                          <FormItem>
                            <FormLabel>თემის ფერი</FormLabel>
                            <Input type="color" className="w-full p-1" value={hslToHex(field.value)} onChange={(e) => field.onChange(hexToHsl(e.target.value))} />
                          </FormItem>
                        )} />
                        <FormField control={schoolForm.control} name="backgroundColor" render={({ field }) => (
                          <FormItem>
                            <FormLabel>ფონის ფერი</FormLabel>
                            <Input type="color" className="w-full p-1" value={hslToHex(field.value)} onChange={(e) => field.onChange(hexToHsl(e.target.value))} />
                          </FormItem>
                        )} />
                      </div>
                    </div>

                    <Button type="submit" className="w-full mt-4" disabled={schoolsLoading}>
                      {editingSchoolId ? 'ცვლილებების შენახვა' : 'სკოლის შექმნა'}
                    </Button>
                    {editingSchoolId && (
                      <Button type="button" variant="ghost" className="w-full" onClick={() => {
                        setEditingSchoolId(null);
                        schoolForm.reset();
                      }}>გაუქმება</Button>
                    )}
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="bulk">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="border-primary/20 shadow-md h-fit">
              <CardHeader className="bg-primary/5">
                <CardTitle className="flex items-center gap-2 text-primary font-headline">
                  <Megaphone className="h-6 w-6" /> ჯგუფური განცხადება
                </CardTitle>
                <CardDescription>დაამატეთ ეს განცხადება ყველა სკოლის დაფაზე ერთდროულად.</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <Form {...bulkAnnounceForm}>
                  <form onSubmit={bulkAnnounceForm.handleSubmit(handleBulkAnnouncement)} className="space-y-4">
                    <FormField control={bulkAnnounceForm.control} name="title" render={({ field }) => (
                      <FormItem><FormLabel>სათაური</FormLabel><Input placeholder="მაგ: საგაზაფხულო არდადეგები" {...field} /></FormItem>
                    )} />
                    <FormField control={bulkAnnounceForm.control} name="content" render={({ field }) => (
                      <FormItem><FormLabel>შინაარსი</FormLabel><Input placeholder="განცხადების ტექსტი..." {...field} /></FormItem>
                    )} />
                    <FormField control={bulkAnnounceForm.control} name="imageUrl" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2"><ImageIcon className="h-4 w-4" /> სურათის მისამართი (URL)</FormLabel>
                        <Input placeholder="https://..." {...field} />
                      </FormItem>
                    )} />
                    <Button type="submit" className="w-full" disabled={isBulkProcessing || !schools}>
                      {isBulkProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      <PlusCircle className="mr-2 h-4 w-4" /> დაგზავნა ყველასთან
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>

            <Card className="border-destructive/20 shadow-md h-fit">
              <CardHeader className="bg-destructive/5">
                <CardTitle className="flex items-center gap-2 text-destructive font-headline">
                  <CloudLightning className="h-6 w-6" /> საგანგებო რეჟიმი ყველასთვის
                </CardTitle>
                <CardDescription>გააქტიურეთ ან გამორთეთ საგანგებო რეჟიმი მთელ ქსელში.</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center gap-4 p-4 bg-destructive/10 rounded-lg border border-destructive/20 text-destructive">
                  <AlertTriangle className="h-8 w-8 shrink-0" />
                  <p className="text-sm font-medium">ეს ქმედება დაუყოვნებლივ გადაფარავს ყველა სკოლის დაფის კონტენტს საგანგებო შეტყობინებით.</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Button variant="destructive" className="h-16 text-lg" onClick={() => handleBulkEmergency(true)} disabled={isBulkProcessing}>
                    <CloudLightning className="mr-2 h-6 w-6" /> ჩართვა
                  </Button>
                  <Button variant="outline" className="h-16 text-lg" onClick={() => handleBulkEmergency(false)} disabled={isBulkProcessing}>
                    გამორთვა
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2 border-accent/20 shadow-md">
              <CardHeader className="bg-accent/5">
                <CardTitle className="flex items-center gap-2 text-accent font-headline">
                  <Clock className="h-6 w-6" /> ერთიანი ზარების განრიგი
                </CardTitle>
                <CardDescription>დააყენეთ სტანდარტული განრიგი ყველა სკოლისთვის ერთდროულად.</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <Form {...bulkScheduleForm}>
                  <form onSubmit={bulkScheduleForm.handleSubmit(handleBulkSchedule)} className="space-y-6">
                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                      {fields.map((field, index) => (
                        <div key={field.id} className="flex items-end gap-3 p-4 border rounded-xl bg-muted/30">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-grow">
                            <FormField
                              control={bulkScheduleForm.control}
                              name={`periods.${index}.startTime`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>დაწყება</FormLabel>
                                  <FormControl><Input type="time" {...field} /></FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={bulkScheduleForm.control}
                              name={`periods.${index}.endTime`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>დასრულება</FormLabel>
                                  <FormControl><Input type="time" {...field} /></FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={bulkScheduleForm.control}
                              name={`periods.${index}.label`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>აღწერა</FormLabel>
                                  <FormControl><Input placeholder="მაგ: 1-ლი გაკვეთილი" {...field} /></FormControl>
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
                          </Button>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between items-center border-t pt-6">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => append({ startTime: '09:00', endTime: '09:45', label: 'ახალი პერიოდი' })}
                      >
                        <PlusCircle className="mr-2 h-4 w-4" /> პერიოდის დამატება
                      </Button>
                      <Button type="submit" variant="accent" className="px-8" disabled={isBulkProcessing || !schools}>
                        {isBulkProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        <Zap className="mr-2 h-4 w-4" /> განრიგის დაყენება ყველასთან
                      </Button>
                    </div>
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
