"use client";

import { useState, useEffect } from 'react';
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
  LayoutDashboard,
  ImageIcon,
  Calendar,
  Save,
  RefreshCcw,
  Palette,
  Layout,
  Edit,
  X,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { getSchools, addSchool, deleteSchool, updateSchool, reorderSchools } from '@/lib/schools';
import { addAnnouncement } from '@/lib/announcements';
import { setEmergencyState } from '@/lib/emergency';
import { setSchedule, defaultSchedule } from '@/lib/schedule';
import { setTheme, defaultTheme, hslToHex, hexToHsl, getTheme } from '@/lib/theme';
import { School } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { PlaceHolderImages } from '@/lib/placeholder-images';

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
  background: z.string(),
  primary: z.string(),
  accent: z.string(),
});

const globalAnnouncementSchema = z.object({
  title: z.string().min(3, "სათაური აუცილებელია"),
  content: z.string().min(10, "შინაარსი აუცილებელია"),
  imageUrl: z.string().url("გთხოვთ მიუთითოთ ვალიდური სურათის მისამართი.").or(z.literal('')),
  imageHint: z.string().optional(),
});

const globalEmergencySchema = z.object({
  message: z.string().min(10, "შეტყობინება აუცილებელია"),
});

const scheduleItemSchema = z.object({
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "HH:MM"),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, "HH:MM"),
  label: z.string().min(1, "სავალდებულო"),
});

const globalScheduleSchema = z.object({
  periods: z.array(scheduleItemSchema),
});

export function SuperAdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [schools, setSchools] = useState<School[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingSchoolId, setEditingSchoolId] = useState<string | null>(null);
  const { toast } = useToast();

  const adminLogo = PlaceHolderImages.find(img => img.id === 'super-admin-logo')?.imageUrl;

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
    defaultValues: { 
      id: '', 
      name: '', 
      password: '', 
      adminPin: '',
      cardColor: '221 39% 49%',
      background: defaultTheme.background,
      primary: defaultTheme.primary,
      accent: defaultTheme.accent,
    },
  });

  const announcementForm = useForm<z.infer<typeof globalAnnouncementSchema>>({
    resolver: zodResolver(globalAnnouncementSchema),
    defaultValues: { 
      title: '', 
      content: '',
      imageUrl: 'https://picsum.photos/seed/global/1200/800',
      imageHint: 'school news'
    },
  });

  const emergencyForm = useForm<z.infer<typeof globalEmergencySchema>>({
    resolver: zodResolver(globalEmergencySchema),
    defaultValues: { message: 'საგანგებო სიტუაცია! გთხოვთ დატოვოთ შენობა.' },
  });

  const scheduleForm = useForm<z.infer<typeof globalScheduleSchema>>({
    resolver: zodResolver(globalScheduleSchema),
    defaultValues: {
      periods: defaultSchedule,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: scheduleForm.control,
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
    const schoolData: School = {
      id: values.id,
      name: values.name,
      password: values.password,
      adminPin: values.adminPin,
      cardColor: values.cardColor
    };

    if (editingSchoolId) {
      updateSchool(schoolData);
      setTheme(values.id, {
        background: values.background,
        primary: values.primary,
        accent: values.accent,
      });
      toast({ title: 'სკოლა განახლდა', description: `${values.name} წარმატებით განახლდა.` });
      setEditingSchoolId(null);
    } else {
      addSchool(schoolData);
      setTheme(values.id, {
        background: values.background,
        primary: values.primary,
        accent: values.accent,
      });
      toast({ title: 'სკოლა დაემატა', description: `${values.name} წარმატებით დაემატა სიაში.` });
    }

    setSchools(getSchools());
    schoolForm.reset();
  };

  const onEditClick = (school: School) => {
    const theme = getTheme(school.id);
    setEditingSchoolId(school.id);
    schoolForm.reset({
      id: school.id,
      name: school.name,
      password: school.password || '',
      adminPin: school.adminPin || '',
      cardColor: school.cardColor || '221 39% 49%',
      background: theme.background,
      primary: theme.primary,
      accent: theme.accent,
    });
  };

  const cancelEdit = () => {
    setEditingSchoolId(null);
    schoolForm.reset();
  };

  const onDeleteSchool = (schoolId: string) => {
    deleteSchool(schoolId);
    setSchools(getSchools());
    toast({ title: 'სკოლა წაიშალა' });
  };

  const onMoveSchool = (schoolId: string, direction: 'up' | 'down') => {
    reorderSchools(schoolId, direction);
    setSchools(getSchools());
    toast({ 
      title: direction === 'up' ? 'გადაადგილდა ზემოთ' : 'გადაადგილდა ქვემოთ',
      duration: 1500 
    });
  };

  const onGlobalAnnouncement = (values: z.infer<typeof globalAnnouncementSchema>) => {
    const today = new Date().toISOString().split('T')[0];
    const farFuture = '2099-12-31';
    
    schools.forEach(school => {
      addAnnouncement(school.id, {
        title: values.title,
        content: values.content,
        imageUrl: values.imageUrl,
        imageHint: values.imageHint || "global news",
        startDate: today,
        endDate: farFuture,
      });
    });
    
    announcementForm.reset({
      title: '',
      content: '',
      imageUrl: 'https://picsum.photos/seed/global/1200/800',
      imageHint: 'school news'
    });
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

  const onGlobalSchedule = (values: z.infer<typeof globalScheduleSchema>) => {
    const sortedPeriods = [...values.periods].sort((a, b) => a.startTime.localeCompare(b.startTime));
    schools.forEach(school => {
      setSchedule(school.id, sortedPeriods);
    });
    toast({ 
      title: 'განრიგი განახლდა', 
      description: 'ახალი ზარების განრიგი დაყენდა ყველა სკოლაში.' 
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
        <div className="flex items-center gap-6">
          <div className="relative h-20 w-20 overflow-hidden rounded-2xl shadow-xl border-4 border-primary/20">
            {adminLogo ? (
              <Image 
                src={adminLogo} 
                alt="Super Admin Logo" 
                fill 
                className="object-cover"
                data-ai-hint="cyber security"
              />
            ) : (
              <div className="h-full w-full bg-primary flex items-center justify-center">
                <ShieldAlert className="h-10 w-10 text-primary-foreground" />
              </div>
            )}
          </div>
          <div>
            <h1 className="text-4xl font-bold font-headline text-primary tracking-tight">
              სუპერ ადმინისტრატორის პანელი
            </h1>
            <p className="text-muted-foreground mt-1 text-lg">მართეთ ყველა სკოლა და განახორციელეთ გლობალური ქმედებები.</p>
          </div>
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
                <CardDescription>სისტემაში რეგისტრირებული ყველა სკოლა. გამოიყენეთ ისრები პოზიციის შესაცვლელად.</CardDescription>
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
                    {schools.map((school, index) => (
                      <TableRow key={school.id}>
                        <TableCell className="font-bold">{school.name}</TableCell>
                        <TableCell>{school.id}</TableCell>
                        <TableCell className="font-mono">{school.password}</TableCell>
                        <TableCell className="font-mono">{school.adminPin}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-1 justify-end items-center">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8"
                              disabled={index === 0} 
                              onClick={() => onMoveSchool(school.id, 'up')}
                            >
                              <ChevronUp className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8"
                              disabled={index === schools.length - 1} 
                              onClick={() => onMoveSchool(school.id, 'down')}
                            >
                              <ChevronDown className="h-4 w-4" />
                            </Button>
                            <Separator orientation="vertical" className="h-6 mx-1" />
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEditClick(school)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onDeleteSchool(school.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{editingSchoolId ? 'სკოლის რედაქტირება' : 'სკოლის დამატება'}</CardTitle>
                <CardDescription>
                  {editingSchoolId ? 'შეცვალეთ არსებული სკოლის პარამეტრები.' : 'ახალი სკოლის რეგისტრაცია და თემის მორგება.'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...schoolForm}>
                  <form onSubmit={schoolForm.handleSubmit(onSubmitSchool)} className="space-y-6">
                    <div className="space-y-4">
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
                            <FormControl>
                              <Input 
                                placeholder="mag-5-sajaro-skola" 
                                {...field} 
                                disabled={!!editingSchoolId} 
                                className={editingSchoolId ? 'bg-muted' : ''}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={schoolForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>პაროლი</FormLabel>
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
                      </div>
                    </div>

                    <Separator />
                    
                    <div className="space-y-4">
                      <h4 className="text-sm font-semibold flex items-center gap-2 text-primary"><Layout className="h-4 w-4" /> მთავარი გვერდის ბარათი</h4>
                      <FormField
                        control={schoolForm.control}
                        name="cardColor"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">ბარათის ფერი</FormLabel>
                            <div className="flex gap-2">
                              <FormControl><Input className="h-8 text-xs" {...field} /></FormControl>
                              <Input 
                                type="color" 
                                className="w-10 h-8 p-1 cursor-pointer" 
                                value={hslToHex(field.value)} 
                                onChange={(e) => field.onChange(hexToHsl(e.target.value))} 
                              />
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h4 className="text-sm font-semibold flex items-center gap-2 text-primary"><Palette className="h-4 w-4" /> სკოლის დაფის თემა</h4>
                      
                      <FormField
                        control={schoolForm.control}
                        name="background"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">ფონის ფერი</FormLabel>
                            <div className="flex gap-2">
                              <FormControl><Input className="h-8 text-xs" {...field} /></FormControl>
                              <Input 
                                type="color" 
                                className="w-10 h-8 p-1 cursor-pointer" 
                                value={hslToHex(field.value)} 
                                onChange={(e) => field.onChange(hexToHsl(e.target.value))} 
                              />
                            </div>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={schoolForm.control}
                        name="primary"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">მთავარი ფერი</FormLabel>
                            <div className="flex gap-2">
                              <FormControl><Input className="h-8 text-xs" {...field} /></FormControl>
                              <Input 
                                type="color" 
                                className="w-10 h-8 p-1 cursor-pointer" 
                                value={hslToHex(field.value)} 
                                onChange={(e) => field.onChange(hexToHsl(e.target.value))} 
                              />
                            </div>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={schoolForm.control}
                        name="accent"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">აქცენტის ფერი</FormLabel>
                            <div className="flex gap-2">
                              <FormControl><Input className="h-8 text-xs" {...field} /></FormControl>
                              <Input 
                                type="color" 
                                className="w-10 h-8 p-1 cursor-pointer" 
                                value={hslToHex(field.value)} 
                                onChange={(e) => field.onChange(hexToHsl(e.target.value))} 
                              />
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex gap-2">
                      {editingSchoolId && (
                        <Button type="button" variant="outline" className="flex-1" onClick={cancelEdit}>
                          <X className="mr-2 h-4 w-4" /> გაუქმება
                        </Button>
                      )}
                      <Button type="submit" className="flex-1">
                        {editingSchoolId ? <Save className="mr-2 h-4 w-4" /> : <PlusCircle className="mr-2 h-4 w-4" />}
                        {editingSchoolId ? 'განახლება' : 'დამატება'}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="global" className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-8">
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
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={announcementForm.control}
                          name="imageUrl"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-2"><ImageIcon className="h-4 w-4" /> სურათის URL</FormLabel>
                              <FormControl><Input placeholder="https://..." {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={announcementForm.control}
                          name="imageHint"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>სურათის აღწერა (AI)</FormLabel>
                              <FormControl><Input placeholder="მაგ: school concert" {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <Button type="submit" className="w-full">
                        გაგზავნა ყველა სკოლაში
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <Calendar className="h-6 w-6" /> გლობალური ზარების განრიგი
                </CardTitle>
                <CardDescription>დააყენეთ ერთიანი განრიგი ყველა სკოლისთვის.</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...scheduleForm}>
                  <form onSubmit={scheduleForm.handleSubmit(onGlobalSchedule)} className="space-y-6">
                    <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
                      {fields.map((field, index) => (
                        <div key={field.id} className="flex items-end gap-2 p-3 border rounded-lg bg-muted/20">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 flex-grow">
                            <FormField
                              control={scheduleForm.control}
                              name={`periods.${index}.startTime`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-xs">დაწყება</FormLabel>
                                  <FormControl><Input type="time" className="h-8" {...field} /></FormControl>
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={scheduleForm.control}
                              name={`periods.${index}.endTime`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-xs">დასრულება</FormLabel>
                                  <FormControl><Input type="time" className="h-8" {...field} /></FormControl>
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={scheduleForm.control}
                              name={`periods.${index}.label`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-xs">აღწერა</FormLabel>
                                  <FormControl><Input placeholder="გაკვეთილი" className="h-8" {...field} /></FormControl>
                                </FormItem>
                              )}
                            />
                          </div>
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-destructive"
                            onClick={() => remove(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex flex-col gap-4">
                      <div className="flex justify-between items-center">
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm"
                          onClick={() => append({ startTime: '09:00', endTime: '09:45', label: 'ახალი პერიოდი' })}
                        >
                          <PlusCircle className="mr-2 h-4 w-4" /> დამატება
                        </Button>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm"
                          onClick={() => scheduleForm.reset({ periods: defaultSchedule })}
                        >
                          <RefreshCcw className="mr-2 h-4 w-4" /> საწყისზე დაბრუნება
                        </Button>
                      </div>
                      <Separator />
                      <Button type="submit" className="w-full">
                        <Save className="mr-2 h-4 w-4" /> ყველა სკოლის განახლება
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
