"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Building, KeyRound, Loader2 } from 'lucide-react';
import type { School } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { useToast } from '@/hooks/use-toast';

interface SchoolSelectorProps {
  schools: School[];
}

const passwordSchema = z.object({
  password: z.string().min(1, 'პაროლი აუცილებელია'),
});

export function SchoolSelector({ schools }: SchoolSelectorProps) {
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      password: '',
    },
  });

  const handleSchoolSelect = (school: School) => {
    setSelectedSchool(school);
    form.reset();
  };

  const onSubmit = (values: z.infer<typeof passwordSchema>) => {
    if (!selectedSchool) return;

    setIsLoading(true);
    // Simulate network delay
    setTimeout(() => {
      if (values.password === selectedSchool.password) {
        toast({
          title: 'წარმატება',
          description: `მოგესალმებით ${selectedSchool.name}-ის დაფაზე.`,
        });
        router.push(`/board/${selectedSchool.id}`);
      } else {
        toast({
          variant: 'destructive',
          title: 'შეცდომა',
          description: 'პაროლი არასწორია. გთხოვთ სცადოთ თავიდან.',
        });
        form.setError('password', { message: 'პაროლი არასწორია' });
        setIsLoading(false);
      }
    }, 500);
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {schools.map((school) => (
          <Card
            key={school.id}
            className="w-80 cursor-pointer transition-all duration-300 transform hover:scale-105 hover:shadow-2xl shadow-lg border-2 border-transparent hover:border-primary"
            onClick={() => handleSchoolSelect(school)}
          >
            <CardHeader className="items-center text-center p-8">
              <div className="p-5 bg-primary/10 rounded-full mb-4">
                <Building className="w-12 h-12 text-primary" />
              </div>
              <CardTitle className="font-headline text-2xl">{school.name}</CardTitle>
            </CardHeader>
            <CardContent></CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!selectedSchool} onOpenChange={() => setSelectedSchool(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="font-headline">{selectedSchool?.name}</DialogTitle>
            <DialogDescription>
              გთხოვთ შეიყვანოთ სკოლის პაროლი დაფის სანახავად.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>პაროლი</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="password"
                          placeholder="••••••••"
                          className="pl-10"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                შესვლა
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
