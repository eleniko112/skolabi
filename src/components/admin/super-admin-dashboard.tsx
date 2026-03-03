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
  Calendar,
  Save,
  Palette,
  Layout,
  Edit,
  X,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { useCollection, useMemoFirebase, useFirestore } from '@/firebase';
import { collection } from 'firebase/firestore';
import { addSchool, deleteSchool, updateSchool } from '@/lib/schools';
import { addAnnouncement } from '@/lib/announcements';
import { setEmergencyState } from '@/lib/emergency';
import { setSchedule } from '@/lib/schedule';
import { hslToHex, hexToHsl } from '@/lib/theme';
import { School, SchedulePeriod } from '@/lib/types';
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
  backgroundColor: z.string(),
  themeColor: z.string(),
  accentColor: z.string(),
});

export function SuperAdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const firestore = useFirestore();
  const schoolsQuery = useMemoFirebase(() => firestore ? collection(firestore, 'schools') : null, [firestore]);
  const { data: schools, isLoading: schoolsLoading } = useCollection<School>(schoolsQuery);
  const [editingSchoolId, setEditingSchoolId] = useState<string | null>(null);
  const { toast } = useToast();

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
    const schoolData: School = { ...values };

    if (editingSchoolId) {
      updateSchool(firestore, schoolData);
      toast({ title: 'სკოლა განახლდა' });
      setEditingSchoolId(null);
    } else {
      addSchool(firestore, schoolData);
      toast({ title: 'სკოლა დაემატა' });
    }
    schoolForm.reset();
  };

  const onEditClick = (school: School) => {
    setEditingSchoolId(school.id);
    schoolForm.reset({ ...school });
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
                <Button asChild variant="outline" className="w-full"><Link href="/">გაუქმება</Link></Button>
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

      <Tabs defaultValue="schools">
        <TabsList className="mb-8"><TabsTrigger value="schools">სკოლები</TabsTrigger></TabsList>
        <TabsContent value="schools" className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-2">
                <CardHeader><CardTitle>სკოლების სია</CardTitle></CardHeader>
                <CardContent>
                    {schoolsLoading ? <Loader2 className="animate-spin" /> : (
                        <Table>
                            <TableHeader><TableRow><TableHead>სახელი</TableHead><TableHead className="text-right">მოქმედება</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {schools?.map(school => (
                                    <TableRow key={school.id}>
                                        <TableCell>{school.name}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" onClick={() => onEditClick(school)}><Edit className="h-4 w-4" /></Button>
                                            <Button variant="ghost" size="icon" onClick={() => deleteSchool(firestore!, school.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
            <Card>
                <CardHeader><CardTitle>{editingSchoolId ? 'რედაქტირება' : 'დამატება'}</CardTitle></CardHeader>
                <CardContent>
                    <Form {...schoolForm}>
                        <form onSubmit={schoolForm.handleSubmit(onSubmitSchool)} className="space-y-4">
                            <FormField control={schoolForm.control} name="name" render={({ field }) => <FormItem><FormLabel>სახელი</FormLabel><Input {...field} /></FormItem>} />
                            <FormField control={schoolForm.control} name="id" render={({ field }) => <FormItem><FormLabel>ID</FormLabel><Input {...field} disabled={!!editingSchoolId} /></FormItem>} />
                            <FormField control={schoolForm.control} name="password" render={({ field }) => <FormItem><FormLabel>პაროლი</FormLabel><Input {...field} /></FormItem>} />
                            <FormField control={schoolForm.control} name="adminPin" render={({ field }) => <FormItem><FormLabel>ადმინ PIN</FormLabel><Input {...field} maxLength={4} /></FormItem>} />
                            <Button type="submit" className="w-full">{editingSchoolId ? 'განახლება' : 'დამატება'}</Button>
                            {editingSchoolId && <Button type="button" variant="ghost" className="w-full" onClick={() => setEditingSchoolId(null)}>გაუქმება</Button>}
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
