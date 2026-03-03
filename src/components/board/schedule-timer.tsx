"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Bell, Clock, Loader2 } from 'lucide-react';
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

  const currentTimeInMinutes = now.getHours() * 60 + now.getMinutes();

  const processedSchedule = useMemo(() => {
    if (!schedule) return [];
    return schedule.map(item => {
        const [startH, startM] = item.startTime.split(':').map(Number);
        const startTimeInMinutes = startH * 60 + startM;
        const [endH, endM] = item.endTime.split(':').map(Number);
        const endTimeInMinutes = endH * 60 + endM;

        const isCurrent = currentTimeInMinutes >= startTimeInMinutes && currentTimeInMinutes < endTimeInMinutes;
        return { ...item, isCurrent };
    });
  }, [schedule, currentTimeInMinutes]);

  const { nextBell, nextBellTime, prevBell, prevBellTime } = useMemo(() => {
    if (!schedule || schedule.length === 0) return { nextBell: null, nextBellTime: Infinity, prevBell: null, prevBellTime: -1 };

    let next = null;
    let nextTime = Infinity;
    let prev = null;
    let prevTime = -1;

    schedule.forEach(bell => {
        const [h, m] = bell.startTime.split(':').map(Number);
        const bellTime = h * 60 + m;
        
        if (bellTime > currentTimeInMinutes && bellTime < nextTime) {
            nextTime = bellTime;
            next = bell;
        }
        if (bellTime <= currentTimeInMinutes && bellTime > prevTime) {
            prevTime = bellTime;
            prev = bell;
        }
    });

    return { nextBell: next, nextBellTime: nextTime, prevBell: prev, prevBellTime: prevTime };
  }, [schedule, currentTimeInMinutes]);

  if (isLoading) {
    return (
        <Card className="shadow-xl rounded-xl flex flex-col h-full">
            <CardHeader><CardTitle className="text-2xl font-headline"><Clock className="inline mr-2" />განრიგი</CardTitle></CardHeader>
            <CardContent className="flex items-center justify-center flex-grow"><Loader2 className="animate-spin" /></CardContent>
        </Card>
    );
  }

  if (!schedule || schedule.length === 0) {
      return (
          <Card className="shadow-xl rounded-xl flex flex-col">
              <CardHeader><CardTitle className="text-2xl font-headline"><Clock className="inline mr-2" />განრიგი</CardTitle></CardHeader>
              <CardContent className="p-6 text-center text-muted-foreground">განრიგი არ არის დამატებული.</CardContent>
          </Card>
      );
  }

  const diffSeconds = nextBell ? (nextBellTime * 60 - (currentTimeInMinutes * 60 + now.getSeconds())) : 0;
  const minutesLeft = Math.floor(diffSeconds / 60);
  const secondsLeft = diffSeconds % 60;
  const progress = prevBell && nextBell ? ((currentTimeInMinutes * 60 + now.getSeconds() - prevBellTime * 60) / (nextBellTime * 60 - prevBellTime * 60)) * 100 : 0;

  return (
    <Card className="shadow-xl rounded-xl flex flex-col h-full overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-primary font-headline text-2xl">
          <Clock className="h-6 w-6" />
          ზარების განრიგი
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 flex-grow flex flex-col pt-6 overflow-y-auto">
        {nextBell && (
            <div className="text-center p-6 bg-primary/5 rounded-lg border">
                <div className="flex items-center justify-center gap-2 text-accent">
                    <Bell className="h-5 w-5" />
                    <p className="text-base font-semibold">შემდეგი: {nextBell.label}</p>
                </div>
                <p className="text-6xl font-bold text-primary tracking-tighter tabular-nums">
                    {String(minutesLeft).padStart(2, '0')}:{String(secondsLeft).padStart(2, '0')}
                </p>
                <Progress value={progress} className="mt-4 h-2" />
                {prevBell && <p className="text-sm text-muted-foreground mt-2">მიმდინარე: {prevBell.label}</p>}
            </div>
        )}

        <Separator />

        <div className="space-y-2 flex-1">
          {processedSchedule.map((item, index) => (
            <div key={item.id || index} className={cn("flex items-center justify-between p-3 rounded-md transition-colors", item.isCurrent && "bg-primary/10")}>
                <span className={cn("font-medium", item.isCurrent ? "text-primary" : "text-muted-foreground")}>{item.label}</span>
                <Badge variant={item.isCurrent ? "default" : "outline"} className="tabular-nums text-base">{item.startTime} - {item.endTime}</Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
