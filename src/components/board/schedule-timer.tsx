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

    const next = schedule.find(p => timeToSeconds(p.startTime) > currentSeconds);

    if (next) {
      const nextStart = timeToSeconds(next.startTime);
      const remaining = nextStart - currentSeconds;
      
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
        <Card className="shadow-lg rounded-xl flex flex-col h-full">
            <CardHeader className="p-2">
                <CardTitle className="text-sm font-headline">
                    <Clock className="inline mr-2 h-4 w-4" />განრიგი
                </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center flex-grow p-2">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </CardContent>
        </Card>
    );
  }

  return (
    <Card className="shadow-xl rounded-xl flex flex-col h-full overflow-hidden border">
      <CardHeader className="bg-muted/30 p-2 md:p-3 flex-shrink-0">
        <div className="flex items-center justify-between gap-2">
            <CardTitle className="flex items-center gap-1.5 text-primary font-headline text-sm md:text-base lg:text-xl">
                <Clock className="h-4 w-4 md:h-5 md:w-5" />
                განრიგი
            </CardTitle>
            <div className="text-base md:text-lg lg:text-2xl font-bold font-mono text-muted-foreground tabular-nums">
                {now.toLocaleTimeString('ka-GE', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-0 flex-grow flex flex-col pt-1.5 px-2 md:px-3 overflow-hidden min-h-0">
        {status && status.type !== 'ended' ? (
            <div className={cn(
                "text-center p-2 rounded-xl border shadow-inner transition-colors mb-1.5 shrink-0",
                status.type === 'lesson' ? "bg-primary/5 border-primary/10" : "bg-accent/5 border-accent/10"
            )}>
                <div className="flex items-center justify-center gap-1.5 mb-1">
                    {status.type === 'lesson' ? <Bell className="h-4 w-4 text-primary animate-ring" /> : <Hourglass className="h-4 w-4 text-accent animate-spin-slow" />}
                    <p className={cn("text-[10px] md:text-xs font-bold font-headline uppercase tracking-wide", status.type === 'lesson' ? "text-primary" : "text-accent")}>
                        {status.label}
                    </p>
                </div>
                
                <div className="flex flex-col items-center">
                    <p className="text-3xl md:text-4xl lg:text-6xl font-black text-foreground tracking-tighter tabular-nums leading-none mb-1">
                        {formatTime(status.remaining!)}
                    </p>
                    <Badge variant="outline" className="text-[10px] md:text-xs px-1.5 py-0 mb-1.5 bg-background h-5 md:h-6">
                        მიზანი: {status.targetTime}
                    </Badge>
                </div>

                <div className="space-y-1">
                    <Progress value={status.progress} className={cn("h-1.5 shadow-sm", status.type === 'lesson' ? "bg-primary/20" : "bg-accent/20")} />
                    <div className="flex justify-between text-[10px] md:text-xs font-medium text-muted-foreground">
                        <span>{status.periodLabel}</span>
                        <span>{Math.round(status.progress!)}%</span>
                    </div>
                </div>
            </div>
        ) : status?.type === 'ended' ? (
            <div className="text-center p-3 bg-muted/20 rounded-lg border-2 border-dashed border-muted-foreground/30 mb-2 shrink-0">
                <Clock className="h-4 w-4 mx-auto mb-1 text-muted-foreground opacity-50" />
                <h3 className="text-sm md:text-base font-bold font-headline text-muted-foreground leading-tight">
                    სასწავლო დღე დასრულდა
                </h3>
                <p className="text-[10px] md:text-xs text-muted-foreground">ხვალამდე!</p>
            </div>
        ) : (
            <div className="text-center p-2 bg-muted/20 rounded-lg border-2 border-dashed border-muted-foreground/30 mb-2 shrink-0">
                <p className="text-muted-foreground text-xs font-headline">განრიგი არ არის დამატებული</p>
            </div>
        )}

        <Separator className="mb-2 shrink-0" />

        <div className="flex-1 overflow-y-auto pr-1 pb-2 custom-scrollbar min-h-0">
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
                            isCurrent ? "bg-primary text-primary-foreground shadow-lg scale-[1.01] border-primary z-10" : 
                            isPast ? "bg-muted/40 opacity-50 grayscale border-transparent" : "bg-card hover:border-primary/30"
                        )}
                    >
                        <div className="flex items-center gap-2 md:gap-3">
                            <span className={cn(
                                "h-6 w-6 md:h-8 md:w-8 flex items-center justify-center rounded-full text-[10px] md:text-sm font-bold shrink-0",
                                isCurrent ? "bg-white text-primary" : "bg-muted text-muted-foreground"
                            )}>
                                {index + 1}
                            </span>
                            <span className="font-bold text-xs md:text-sm lg:text-base line-clamp-1">
                                {item.label}
                            </span>
                        </div>
                        <Badge variant={isCurrent ? "secondary" : "outline"} className="tabular-nums text-xs md:text-sm lg:text-base py-0 px-1.5 md:px-3 h-6 md:h-8 shrink-0">
                            {item.startTime} - {item.endTime}
                        </Badge>
                    </div>
                );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
