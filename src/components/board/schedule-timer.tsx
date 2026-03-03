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
            <CardHeader className="p-3 md:p-4"><CardTitle className="text-xl font-headline"><Clock className="inline mr-2" />განრიგი</CardTitle></CardHeader>
            <CardContent className="flex items-center justify-center flex-grow p-4"><Loader2 className="animate-spin text-primary" /></CardContent>
        </Card>
    );
  }

  return (
    <Card className="shadow-xl rounded-xl flex flex-col h-full overflow-hidden border-2">
      <CardHeader className="bg-muted/30 p-3 md:p-4">
        <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-primary font-headline text-xl md:text-2xl">
            <Clock className="h-6 w-6 md:h-7 md:w-7" />
            ზარების განრიგი
            </CardTitle>
            <div className="text-lg md:text-xl font-bold font-mono text-muted-foreground tabular-nums">
                {now.toLocaleTimeString('ka-GE', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 flex-grow flex flex-col pt-3 md:pt-4 px-3 md:px-4 overflow-y-auto">
        {status && status.type !== 'ended' ? (
            <div className={cn(
                "text-center p-4 md:p-6 rounded-xl border-2 shadow-inner transition-colors",
                status.type === 'lesson' ? "bg-primary/5 border-primary/20" : "bg-accent/5 border-accent/20"
            )}>
                <div className="flex items-center justify-center gap-2 mb-1">
                    {status.type === 'lesson' ? <Bell className="h-4 w-4 text-primary animate-ring" /> : <Hourglass className="h-4 w-4 text-accent animate-spin-slow" />}
                    <p className={cn("text-base font-bold font-headline", status.type === 'lesson' ? "text-primary" : "text-accent")}>
                        {status.label}
                    </p>
                </div>
                
                <div className="flex flex-col items-center">
                    <p className="text-5xl md:text-6xl font-black text-foreground tracking-tighter tabular-nums leading-none mb-1">
                        {formatTime(status.remaining!)}
                    </p>
                    <Badge variant="outline" className="text-xs px-2 py-0.5 mb-4 bg-background">
                        მიზანი: {status.targetTime}
                    </Badge>
                </div>

                <div className="space-y-1">
                    <Progress value={status.progress} className={cn("h-2 shadow-sm", status.type === 'lesson' ? "bg-primary/20" : "bg-accent/20")} />
                    <div className="flex justify-between text-[10px] md:text-xs font-medium text-muted-foreground">
                        <span>{status.periodLabel}</span>
                        <span>{Math.round(status.progress!)}%</span>
                    </div>
                </div>
            </div>
        ) : status?.type === 'ended' ? (
            <div className="text-center p-4 bg-muted/20 rounded-lg border-2 border-dashed border-muted-foreground/30">
                <Clock className="h-5 w-5 mx-auto mb-1 text-muted-foreground opacity-50" />
                <h3 className="text-sm font-bold font-headline text-muted-foreground">{status.label}</h3>
                <p className="text-[10px] text-muted-foreground mt-0.5">ხვალამდე!</p>
            </div>
        ) : (
            <div className="text-center p-4 bg-muted/20 rounded-lg border-2 border-dashed border-muted-foreground/30">
                <p className="text-muted-foreground text-xs font-headline">განრიგი არ არის დამატებული</p>
            </div>
        )}

        <Separator className="my-2" />

        <div className="space-y-2 flex-1 pb-4">
          <h4 className="text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-wider px-1">დღევანდელი პერიოდები</h4>
          <div className="grid gap-1.5">
            {schedule?.map((item, index) => {
                const start = timeToSeconds(item.startTime);
                const end = timeToSeconds(item.endTime);
                const isCurrent = currentSeconds >= start && currentSeconds < end;
                const isPast = currentSeconds >= end;

                return (
                    <div 
                        key={item.id || index} 
                        className={cn(
                            "flex items-center justify-between p-2 md:p-3 rounded-lg border transition-all duration-300",
                            isCurrent ? "bg-primary text-primary-foreground shadow-md scale-[1.01] border-primary" : 
                            isPast ? "bg-muted/40 opacity-50 grayscale border-transparent" : "bg-card hover:border-primary/40"
                        )}
                    >
                        <div className="flex items-center gap-2 md:gap-3">
                            <span className={cn(
                                "h-6 w-6 md:h-7 md:w-7 flex items-center justify-center rounded-full text-[10px] md:text-xs font-bold",
                                isCurrent ? "bg-white text-primary" : "bg-muted text-muted-foreground"
                            )}>
                                {index + 1}
                            </span>
                            <span className="font-bold text-sm md:text-base">{item.label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge variant={isCurrent ? "secondary" : "outline"} className="tabular-nums text-[10px] md:text-xs py-0.5 px-2">
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