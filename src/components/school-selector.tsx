"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Building, KeyRound, Loader2, ArrowRight, School as SchoolIcon } from 'lucide-react';
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
import { cn } from '@/lib/utils';

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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 px-4">
        {schools.map((school) => {
          const customColor = school.cardColor || "221 39% 49%"; // Fallback to blue
          
          return (
            <Card
              key={school.id}
              className={cn(
                  "group relative cursor-pointer transition-all duration-500 overflow-hidden",
                  "bg-white/70 backdrop-blur-md hover:bg-white hover:shadow-2xl hover:-translate-y-2",
                  "border-2 border-transparent"
              )}
              style={{ 
                borderTop: `4px solid hsl(${customColor})`,
              } as React.CSSProperties}
              onClick={() => handleSchoolSelect(school)}
            >
              {/* Custom background highlight */}
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none"
                style={{ background: `linear-gradient(to bottom right, hsl(${customColor}), transparent)` }}
              />
              
              {/* Decorative circle */}
              <div 
                className="absolute top-0 right-0 w-32 h-32 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-700 opacity-20"
                style={{ backgroundColor: `hsl(${customColor})` }}
              />
              
              <CardHeader className="items-center text-center p-10 relative z-10">
                <div 
                  className="p-6 rounded-2xl mb-6 transition-all duration-500 shadow-sm"
                  style={{ 
                    backgroundColor: `hsla(${customColor}, 0.1)`, 
                    color: `hsl(${customColor})` 
                  }}
                >
                  <SchoolIcon className="w-14 h-14" />
                </div>
                <CardTitle 
                  className="font-headline text-2xl mb-2 transition-colors"
                  style={{ color: `hsl(${customColor})` }}
                >
                  {school.name}
                </CardTitle>
                <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                  შესვლა <ArrowRight className="w-4 h-4" />
                </div>
              </CardHeader>
              <CardContent></CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={!!selectedSchool} onOpenChange={() => setSelectedSchool(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="font-headline text-2xl text-primary">{selectedSchool?.name}</DialogTitle>
            <DialogDescription className="text-lg">
              გთხოვთ შეიყვანოთ სკოლის პაროლი დაფის სანახავად.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-6">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base">პაროლი</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                          type="password"
                          placeholder="••••••••"
                          className="pl-12 h-12 text-lg tracking-widest"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full h-12 text-lg font-bold shadow-lg shadow-primary/20" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                შესვლა
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
