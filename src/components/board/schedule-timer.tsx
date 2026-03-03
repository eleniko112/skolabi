"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Bell, Clock, Loader2, Hourglass } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { SchedulePeriod } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useCollection, useMemoFirebase, useFirestore } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';

export function ScheduleTimer({ schoolId }: { schoolId: string }) {
  const [now, setNow] = useState<Date>(new Date());
  const firestore = useFirestore();

  const lessonsQuery = useMemoFirebase(() => {
    if (!firestore || !schoolId) return null;
    return query(
        collection(firestore, 'schools', schoolId, 'lessons'),
        orderBy('startTime')
    );
  }, [firestore, schoolId]);

  const { data: schedule, isLoading } = useCollection<SchedulePeriod>(lessonsQuery);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeToSeconds = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 3600 + m * 60;
  };

  const currentSeconds = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();

  const status = useMemo(() => {
    if (!schedule || schedule.length === 0) return null;

    // Find current period
    const current = schedule.find(p => {
      const start = timeToSeconds(p.startTime);
      const end = timeToSeconds(p.endTime);
      return currentSeconds >= start && currentSeconds < end;
    });

    if (current) {
      const start = timeToSeconds(current.startTime);
      const end = timeToSeconds(current.endTime);
      const remaining = end - currentSeconds;
      const progress = ((currentSeconds - start) / (end - start)) * 100;
      
      return {
        type: 'lesson',
        label: 'გაკვეთილი სრულდება',
        periodLabel: current.label,
        remaining,
        progress,
        targetTime: current.endTime
      };
    }

    // Find next period
    const next = schedule.find(p => timeToSeconds(p.startTime) > currentSeconds);

    if (next) {
      const nextStart = timeToSeconds(next.startTime);
      const remaining = nextStart - currentSeconds;
      
      // Calculate progress of the break (since last lesson ended)
      const prev = [...schedule].reverse().find(p => timeToSeconds(p.endTime) <= currentSeconds);
      let progress = 0;
      if (prev) {
        const prevEnd = timeToSeconds(prev.endTime);
        progress = ((currentSeconds - prevEnd) / (nextStart - prevEnd)) * 100;
      }

      return {
        type: 'break',
        label: 'გაკვეთილი იწყება',
        periodLabel: next.label,
        remaining,
        progress,
        targetTime: next.startTime
      };
    }

    return { type: 'ended', label: 'სასწავლო დღე დასრულდა' };
  }, [schedule, currentSeconds]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
        <Card className="shadow-xl rounded-xl flex flex-col h-full">
            <CardHeader><CardTitle className="text-2xl font-headline"><Clock className="inline mr-2" />განრიგი</CardTitle></CardHeader>
            <CardContent className="flex items-center justify-center flex-grow"><Loader2 className="animate-spin text-primary" /></CardContent>
        </Card>
    );
  }

  return (
    <Card className="shadow-xl rounded-xl flex flex-col h-full overflow-hidden border-2">
      <CardHeader className="bg-muted/30">
        <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3 text-primary font-headline text-2xl">
            <Clock className="h-7 w-7" />
            ზარების განრიგი
            </CardTitle>
            <div className="text-xl font-bold font-mono text-muted-foreground tabular-nums">
                {now.toLocaleTimeString('ka-GE', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 flex-grow flex flex-col pt-6 overflow-y-auto">
        {status && status.type !== 'ended' ? (
            <div className={cn(
                "text-center p-8 rounded-2xl border-2 shadow-inner transition-colors",
                status.type === 'lesson' ? "bg-primary/5 border-primary/20" : "bg-accent/5 border-accent/20"
            )}>
                <div className="flex items-center justify-center gap-2 mb-2">
                    {status.type === 'lesson' ? <Bell className="h-5 w-5 text-primary animate-ring" /> : <Hourglass className="h-5 w-5 text-accent animate-spin-slow" />}
                    <p className={cn("text-lg font-bold font-headline", status.type === 'lesson' ? "text-primary" : "text-accent")}>
                        {status.label}
                    </p>
                </div>
                
                <div className="flex flex-col items-center">
                    <p className="text-7xl font-black text-foreground tracking-tighter tabular-nums mb-1">
                        {formatTime(status.remaining!)}
                    </p>
                    <Badge variant="outline" className="text-sm px-4 py-1 mb-6 bg-background">
                        მიზანი: {status.targetTime}
                    </Badge>
                </div>

                <div className="space-y-2">
                    <Progress value={status.progress} className={cn("h-3 shadow-sm", status.type === 'lesson' ? "bg-primary/20" : "bg-accent/20")} />
                    <div className="flex justify-between text-xs font-medium text-muted-foreground">
                        <span>{status.periodLabel}</span>
                        <span>{Math.round(status.progress!)}%</span>
                    </div>
                </div>
            </div>
        ) : status?.type === 'ended' ? (
            <div className="text-center p-10 bg-muted/20 rounded-2xl border-2 border-dashed border-muted-foreground/30">
                <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-2xl font-bold font-headline text-muted-foreground">{status.label}</h3>
                <p className="text-sm text-muted-foreground mt-2">ხვალამდე!</p>
            </div>
        ) : (
            <div className="text-center p-10 bg-muted/20 rounded-2xl border-2 border-dashed border-muted-foreground/30">
                <p className="text-muted-foreground font-headline">განრიგი არ არის დამატებული</p>
            </div>
        )}

        <Separator />

        <div className="space-y-3 flex-1">
          <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider px-2">დღევანდელი პერიოდები</h4>
          <div className="grid gap-2">
            {schedule?.map((item, index) => {
                const start = timeToSeconds(item.startTime);
                const end = timeToSeconds(item.endTime);
                const isCurrent = currentSeconds >= start && currentSeconds < end;
                const isPast = currentSeconds >= end;

                return (
                    <div 
                        key={item.id || index} 
                        className={cn(
                            "flex items-center justify-between p-4 rounded-xl border transition-all duration-300",
                            isCurrent ? "bg-primary text-primary-foreground shadow-lg scale-[1.02] border-primary" : 
                            isPast ? "bg-muted/40 opacity-60 grayscale border-transparent" : "bg-card hover:border-primary/50"
                        )}
                    >
                        <div className="flex items-center gap-3">
                            <span className={cn(
                                "h-8 w-8 flex items-center justify-center rounded-full text-xs font-bold",
                                isCurrent ? "bg-white text-primary" : "bg-muted text-muted-foreground"
                            )}>
                                {index + 1}
                            </span>
                            <span className="font-bold text-base">{item.label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge variant={isCurrent ? "secondary" : "outline"} className="tabular-nums text-sm py-1">
                                {item.startTime} - {item.endTime}
                            </Badge>
                        </div>
                    </div>
                );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
