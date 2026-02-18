"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Bell, Clock, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { SchedulePeriod } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';


type ProcessedLesson = {
    label:string;
    startTime: string;
    endTime: string;
    isCurrent: boolean;
};

const LoadingState = () => (
    <Card className="h-full shadow-xl rounded-xl">
        <CardHeader>
            <CardTitle className="flex items-center gap-3 text-primary font-headline text-2xl">
                <Clock className="h-6 w-6" />
                ზარების განრიგი
            </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 pt-6 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
    </Card>
);

export function ScheduleTimer({ schoolId }: { schoolId: string }) {
  const [now, setNow] = useState<Date | undefined>();
  const firestore = useFirestore();

  const scheduleDocRef = useMemoFirebase(() => {
    if (!firestore || !schoolId) return null;
    return doc(firestore, 'schools', schoolId, 'config', 'schedule');
  }, [firestore, schoolId]);
  
  const { data: scheduleData, isLoading: isScheduleLoading } = useDoc<{ periods: SchedulePeriod[] }>(scheduleDocRef);
  const schedule = scheduleData?.periods || [];

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    setNow(new Date());

    return () => {
      clearInterval(timer);
    };
  }, []);

  const currentTimeInMinutes = now ? now.getHours() * 60 + now.getMinutes() : 0;

  const timerSchedule = useMemo(() => {
      if (!schedule) return [];
      return schedule.map(period => ({
          time: period.startTime,
          label: period.label,
      })).sort((a,b) => a.time.localeCompare(b.time));
  }, [schedule]);


  const processedSchedule = useMemo((): ProcessedLesson[] => {
    if (!schedule || schedule.length === 0) return [];

    return schedule
        .filter(item => item.label.includes('გაკვეთილი') && !item.label.includes('დასრულდა'))
        .map(item => {
            const [startH, startM] = item.startTime.split(':').map(Number);
            const startTimeInMinutes = startH * 60 + startM;
            const [endH, endM] = item.endTime.split(':').map(Number);
            const endTimeInMinutes = endH * 60 + endM;

            const isCurrent = currentTimeInMinutes >= startTimeInMinutes && currentTimeInMinutes < endTimeInMinutes;

            return {
                label: item.label,
                startTime: item.startTime,
                endTime: item.endTime,
                isCurrent
            };
        });
  }, [schedule, currentTimeInMinutes]);


  if (!now || isScheduleLoading) {
    return <LoadingState />;
  }

  const findNextBell = () => {
    let nextBell = null;
    let nextBellTime = Infinity;

    for (const bell of timerSchedule) {
      const [h, m] = bell.time.split(':').map(Number);
      const bellTime = h * 60 + m;
      if (bellTime > currentTimeInMinutes && bellTime < nextBellTime) {
        nextBellTime = bellTime;
        nextBell = bell;
      }
    }
    if (!nextBell && timerSchedule.length > 0) {
        const [h, m] = timerSchedule[0].time.split(':').map(Number);
        nextBellTime = (h * 60 + m) + 24 * 60;
        nextBell = timerSchedule[0];
    }
    
    return { nextBell, nextBellTime };
  };

  const findPreviousBell = () => {
    let prevBell = null;
    let prevBellTime = -1;
     for (const bell of timerSchedule) {
      const [h, m] = bell.time.split(':').map(Number);
      const bellTime = h * 60 + m;
      if (bellTime <= currentTimeInMinutes && bellTime > prevBellTime) {
        prevBellTime = bellTime;
        prevBell = bell;
      }
    }
    if (!prevBell && timerSchedule.length > 0) {
        const lastBell = timerSchedule[timerSchedule.length - 1];
        const [h, m] = lastBell.time.split(':').map(Number);
        prevBellTime = (h * 60 + m) - 24 * 60;
        prevBell = lastBell;
    }
    return { prevBell, prevBellTime };
  }

  const { nextBell, nextBellTime } = findNextBell();
  const { prevBell, prevBellTime } = findPreviousBell();

  if(!nextBell || !prevBell || timerSchedule.length === 0) {
    return (
        <Card className="h-full shadow-xl rounded-xl">
            <CardHeader>
                <CardTitle className="flex items-center gap-3 text-primary font-headline text-2xl">
                    <Clock className="h-6 w-6" />
                    ზარების განრიგი
                </CardTitle>
            </CardHeader>
            <CardContent className='pt-6'>
                <p className="text-muted-foreground text-center">განრიგი ცარიელია ან არასწორად არის დაკონფიგურირებული.</p>
            </CardContent>
        </Card>
    );
  }

  const diffSeconds = (nextBellTime * 60 - (currentTimeInMinutes * 60 + now.getSeconds()));
  const minutesLeft = Math.floor(diffSeconds / 60);
  const secondsLeft = diffSeconds % 60;

  const totalDuration = (nextBellTime - prevBellTime) * 60;
  const elapsed = totalDuration > 0 ? totalDuration - diffSeconds : 0;
  const progress = totalDuration > 0 ? (elapsed / totalDuration) * 100 : 0;

  const currentPeriodLabel = prevBell.label;
  const nextPeriodLabel = nextBell?.label || 'დღე დასრულდა';

  return (
    <Card className="h-full shadow-xl rounded-xl flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-primary font-headline text-2xl">
          <Clock className="h-6 w-6" />
          ზარების განრიგი
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 flex-grow flex flex-col pt-6">
        <div className="text-center p-6 bg-primary/5 rounded-lg border">
            <div className="flex items-center justify-center gap-2 text-accent">
                <Bell className="h-5 w-5" />
                <p className="text-base font-semibold">შემდეგი: {nextPeriodLabel}</p>
            </div>
            <p className="text-6xl font-bold text-primary tracking-tighter tabular-nums">
                {String(minutesLeft).padStart(2, '0')}:{String(secondsLeft).padStart(2, '0')}
            </p>
            <Progress value={progress} className="mt-4 h-2" />
            <p className="text-sm text-muted-foreground mt-2">მიმდინარე: {currentPeriodLabel}</p>
        </div>

        <Separator />

        <div className="space-y-2 flex-1 overflow-y-auto pr-2">
          {processedSchedule.map((item, index) => (
            <div key={index} className={cn("flex items-center justify-between p-3 rounded-md transition-colors", item.isCurrent && "bg-primary/10")}>
                <span className={cn("font-medium", item.isCurrent ? "text-primary" : "text-muted-foreground")}>{item.label}</span>
                <Badge variant={item.isCurrent ? "default" : "outline"} className="tabular-nums">{item.startTime} - {item.endTime}</Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
