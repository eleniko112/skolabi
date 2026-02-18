"use client";

import { useState, useEffect } from 'react';
import { Bell, Clock, WifiOff } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { defaultSchedule, SCHEDULE_KEY_PREFIX } from '@/lib/schedule';

type ScheduleItem = {
    time: string;
    label: string;
};

export function ScheduleTimer({ schoolId }: { schoolId: string }) {
  const [now, setNow] = useState<Date>();
  const [ntpWarning, setNtpWarning] = useState(false);
  const [schedule, setSchedule] = useState<ScheduleItem[]>(defaultSchedule);
  const storageKey = `${SCHEDULE_KEY_PREFIX}${schoolId}`;

  useEffect(() => {
    const updateSchedule = () => {
        try {
            const savedSchedule = localStorage.getItem(storageKey);
            setSchedule(savedSchedule ? JSON.parse(savedSchedule) : defaultSchedule);
        } catch (error) {
            console.error("Could not load schedule state:", error);
            setSchedule(defaultSchedule);
        }
    };
    
    updateSchedule(); // Initial load

    const timer = setInterval(() => setNow(new Date()), 1000);
    const ntpCheck = setTimeout(() => setNtpWarning(true), 15000);
    setNow(new Date());

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === storageKey) {
        updateSchedule();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      clearInterval(timer);
      clearTimeout(ntpCheck);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [storageKey]);

  if (!now) {
    return (
        <Card className="h-full shadow-lg">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary font-headline">
                    <Clock className="h-6 w-6" />
                    ზარების განრიგი
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="text-center p-4 bg-primary/5 rounded-lg">
                    <div className="flex items-center justify-center gap-2 text-accent">
                        <Bell className="h-5 w-5" />
                        <p className="text-sm font-semibold">იტვირთება...</p>
                    </div>
                    <p className="text-5xl font-bold text-primary tracking-tighter tabular-nums">
                        --:--:--
                    </p>
                    <Progress value={0} className="mt-4 h-2" />
                </div>
                <Separator />
                <div className="space-y-3 max-h-[45vh] overflow-y-auto pr-2">
                    {schedule.filter(item => !item.label.includes('დასვენება') && item.label !== 'გაკვეთილები დასრულდა').map((item, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">{item.label}</span>
                            <Badge variant="outline">{item.time}</Badge>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
  }

  const currentTimeInMinutes = now.getHours() * 60 + now.getMinutes();

  const findNextBell = () => {
    let nextBell = null;
    let nextBellTime = Infinity;

    for (const bell of schedule) {
      const [h, m] = bell.time.split(':').map(Number);
      const bellTime = h * 60 + m;
      if (bellTime > currentTimeInMinutes && bellTime < nextBellTime) {
        nextBellTime = bellTime;
        nextBell = bell;
      }
    }
    if (!nextBell && schedule.length > 0) {
        const [h, m] = schedule[0].time.split(':').map(Number);
        nextBellTime = (h * 60 + m) + 24 * 60;
        nextBell = schedule[0];
    }
    
    return { nextBell, nextBellTime };
  };

  const findPreviousBell = () => {
    let prevBell = null;
    let prevBellTime = -1;
     for (const bell of schedule) {
      const [h, m] = bell.time.split(':').map(Number);
      const bellTime = h * 60 + m;
      if (bellTime <= currentTimeInMinutes && bellTime > prevBellTime) {
        prevBellTime = bellTime;
        prevBell = bell;
      }
    }
    if (!prevBell && schedule.length > 0) {
        const lastBell = schedule[schedule.length - 1];
        const [h, m] = lastBell.time.split(':').map(Number);
        prevBellTime = (h * 60 + m) - 24 * 60;
        prevBell = lastBell;
    }
    return { prevBell, prevBellTime };
  }

  const { nextBell, nextBellTime } = findNextBell();
  const { prevBell, prevBellTime } = findPreviousBell();

  if(!nextBell || !prevBell || schedule.length === 0) {
    return (
        <Card className="h-full shadow-lg">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary font-headline">
                    <Clock className="h-6 w-6" />
                    ზარების განრიგი
                </CardTitle>
            </CardHeader>
            <CardContent className='pt-6'>
                <p>განრიგი არ არის დაყენებული ან ცარიელია.</p>
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

  return (
    <Card className="h-full shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary font-headline">
          <Clock className="h-6 w-6" />
          ზარების განრიგი
        </CardTitle>
        {ntpWarning && (
            <div className="flex items-center gap-2 text-orange-500 text-xs pt-2">
                <WifiOff className="h-4 w-4"/>
                <span>სერვერთან დროის სინქრონიზაცია ვერ ხერხდება</span>
            </div>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center p-4 bg-primary/5 rounded-lg">
            <div className="flex items-center justify-center gap-2 text-accent">
                <Bell className="h-5 w-5" />
                <p className="text-sm font-semibold">შემდეგი ზარი: {nextBell.label}</p>
            </div>
            <p className="text-5xl font-bold text-primary tracking-tighter tabular-nums">
                {String(minutesLeft).padStart(2, '0')}:{String(secondsLeft).padStart(2, '0')}
            </p>
            <Progress value={progress} className="mt-4 h-2" />
            <p className="text-xs text-muted-foreground mt-2">მიმდინარე: {currentPeriodLabel}</p>
        </div>

        <Separator />

        <div className="space-y-3 max-h-[45vh] overflow-y-auto pr-2">
          {schedule.filter(item => !item.label.includes('დასვენება') && item.label !== 'გაკვეთილები დასრულდა').map((item, index) => (
            <div key={index} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{item.label}</span>
                <Badge variant="outline">{item.time}</Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
