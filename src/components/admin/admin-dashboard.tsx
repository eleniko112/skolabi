"use client";

import { useState } from 'react';
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
import { KeyRound, Loader2, ArrowLeft, ShieldCheck, Megaphone, Calendar, Palette, Settings, History, CloudLightning } from 'lucide-react';
import { AnnouncementEditor } from './announcement-editor';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';

interface AdminDashboardProps {
  schoolId: string;
  schoolName: string;
  adminPin: string;
}

const pinSchema = z.object({
  pin: z.string().length(4, 'PIN კოდი უნდა შედგებოდეს 4 ციფრისგან'),
});

export function AdminDashboard({ schoolId, schoolName, adminPin }: AdminDashboardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof pinSchema>>({
    resolver: zodResolver(pinSchema),
    defaultValues: { pin: '' },
  });

  const onPinSubmit = (values: z.infer<typeof pinSchema>) => {
    setIsLoading(true);
    setTimeout(() => {
      if (values.pin === adminPin) {
        setIsAuthenticated(true);
        toast({ title: 'ავტორიზაცია წარმატებულია', description: `მოგესალმებით, ${schoolName}-ის ადმინ პანელში.` });
      } else {
        toast({ variant: 'destructive', title: 'შეცდომა', description: 'არასწორი PIN კოდი.' });
        form.setError('pin', { message: 'არასწორი PIN კოდი' });
      }
      setIsLoading(false);
    }, 500);
  };

  if (!isAuthenticated) {
    return (
      <Dialog open={!isAuthenticated} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-[425px]" hideCloseButton>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-headline">
              <ShieldCheck /> ადმინის პანელი
            </DialogTitle>
            <DialogDescription>
              {schoolName}-ის სამართავად, გთხოვთ შეიყვანოთ ადმინისტრატორის PIN კოდი.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onPinSubmit)} className="space-y-4 py-4">
              <FormField
                control={form.control}
                name="pin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>PIN კოდი</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input type="password" placeholder="••••" maxLength={4} className="pl-10 tracking-[1em] text-center" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex gap-2">
                <Button asChild variant="outline" className="w-full">
                  <Link href={`/board/${schoolId}`}><ArrowLeft className="mr-2 h-4 w-4" /> უკან</Link>
                </Button>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  შესვლა
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <div className="space-y-6">
        <div className="flex justify-between items-start">
            <div>
                <h1 className="text-3xl font-bold font-headline text-primary">ადმინის პანელი</h1>
                <p className="text-muted-foreground">{schoolName}</p>
            </div>
            <Button asChild variant="outline">
                <Link href={`/board/${schoolId}`}><ArrowLeft className="mr-2 h-4 w-4" /> დაფაზე დაბრუნება</Link>
            </Button>
        </div>
      <Tabs defaultValue="announcements" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-6">
          <TabsTrigger value="announcements"><Megaphone className="mr-2 h-4 w-4" />განცხადებები</TabsTrigger>
          <TabsTrigger value="schedule"><Calendar className="mr-2 h-4 w-4" />განრიგი</TabsTrigger>
          <TabsTrigger value="emergency"><CloudLightning className="mr-2 h-4 w-4" />საგანგებო</TabsTrigger>
          <TabsTrigger value="appearance"><Palette className="mr-2 h-4 w-4" />გარეგნობა</TabsTrigger>
          <TabsTrigger value="history"><History className="mr-2 h-4 w-4" />ისტორია</TabsTrigger>
          <TabsTrigger value="settings"><Settings className="mr-2 h-4 w-4" />პარამეტრები</TabsTrigger>
        </TabsList>
        <TabsContent value="announcements" className="mt-6">
          <AnnouncementEditor schoolId={schoolId} />
        </TabsContent>
        <TabsContent value="schedule" className="mt-6">
          <Card><CardHeader><CardTitle>განრიგის რედაქტორი</CardTitle></CardHeader><CardContent><p>ეს სექცია მალე დაემატება.</p></CardContent></Card>
        </TabsContent>
        <TabsContent value="emergency" className="mt-6">
          <Card><CardHeader><CardTitle>საგანგებო განცხადების მართვა</CardTitle></CardHeader><CardContent><p>ეს სექცია მალე დაემატება.</p></CardContent></Card>
        </TabsContent>
        <TabsContent value="appearance" className="mt-6">
          <Card><CardHeader><CardTitle>დაფის გარეგნობის რედაქტორი</CardTitle></CardHeader><CardContent><p>ეს სექცია მალე დაემატება.</p></CardContent></Card>
        </TabsContent>
        <TabsContent value="history" className="mt-6">
          <Card><CardHeader><CardTitle>ცვლილებების ისტორია</CardTitle></CardHeader><CardContent><p>ეს სექცია მალე დაემატება.</p></CardContent></Card>
        </TabsContent>
        <TabsContent value="settings" className="mt-6">
          <Card><CardHeader><CardTitle>ზოგადი პარამეტრები</CardTitle></CardHeader><CardContent><p>ეს სექცია მალე დაემატება.</p></CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
