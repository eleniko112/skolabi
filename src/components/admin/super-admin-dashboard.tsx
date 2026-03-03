"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
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
  ExternalLink,
  Settings
} from 'lucide-react';
import { useCollection, useMemoFirebase, useFirestore } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { addSchool, deleteSchool, updateSchool } from '@/lib/schools';
import { hslToHex, hexToHsl } from '@/lib/theme';
import { School } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Separator } from '@/components/ui/separator';

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-headline">სკოლების სია</CardTitle>
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

                <Button type="submit" className="w-full mt-4">
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
    </div>
  );
}