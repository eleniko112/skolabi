"use client";

import { useState, useEffect } from 'react';
import { Bell, Clock, WifiOff } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

// Dummy data, will be replaced by Firestore
const schedule = [
  { time: '09:00', label: '1-ლი გაკვეთილი' },
  { time: '09:45', label: 'დასვენება' },
  { time: '10:00', label: 'მე-2 გაკვეთილი' },
  { time: '10:45', label: 'დასვენება' },
  { time: '11:00', label: 'მე-3 გაკვეთილი' },
  { time: '11:45', label: 'დიდი დასვენება' },
  { time: '12:30', label: 'მე-4 გაკვეთილი' },
  { time: '13:15', label: 'დასვენება' },
];

export function ScheduleTimer({ schoolId }: { schoolId: string }) {
  const [now, setNow] = useState(new Date());
  const [ntpWarning, setNtpWarning] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    // Simulate NTP sync check failure
    const ntpCheck = setTimeout(() => setNtpWarning(true), 15000); 
    
    return () => {
        clearInterval(timer);
        clearTimeout(ntpCheck);
    };
  }, []);

  const findNextBell = () => {
    const currentTime = now.getHours() * 60 + now.getMinutes();
    let nextBell = null;
    let nextBellTime = 24 * 60; // Minutes in a day

    for (const bell of schedule) {
      const [h, m] = bell.time.split(':').map(Number);
      const bellTime = h * 60 + m;
      if (bellTime > currentTime && bellTime < nextBellTime) {
        nextBellTime = bellTime;
        nextBell = bell;
      }
    }
    // If no more bells today, take the first one of the next day
    if (!nextBell && schedule.length > 0) {
        const [h, m] = schedule[0].time.split(':').map(Number);
        nextBellTime = (h*60 + m) + 24*60;
        nextBell = schedule[0];
    }
    
    return { nextBell, nextBellTime };
  };

  const { nextBell, nextBellTime } = findNextBell();
  const currentTimeInMinutes = now.getHours() * 60 + now.getMinutes();
  const diffSeconds = (nextBellTime * 60 - (currentTimeInMinutes * 60 + now.getSeconds()));
  const minutesLeft = Math.floor(diffSeconds / 60);
  const secondsLeft = diffSeconds % 60;
  
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
    return { prevBell, prevBellTime };
  }

  const { prevBell, prevBellTime } = findPreviousBell();
  const totalDuration = nextBell && prevBell ? (nextBellTime - prevBellTime) * 60 : 1;
  const elapsed = nextBell && prevBell ? diffSeconds : 0;
  const progress = totalDuration > 0 ? 100 - (elapsed / totalDuration) * 100 : 0;

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
                <p className="text-sm font-semibold">{nextBell?.label || 'დღე დასრულდა'}</p>
            </div>
            <p className="text-5xl font-bold text-primary tracking-tighter tabular-nums">
                {String(minutesLeft).padStart(2, '0')}:{String(secondsLeft).padStart(2, '0')}
            </p>
            <Progress value={progress} className="mt-4 h-2" />
        </div>

        <Separator />

        <div className="space-y-3 max-h-[45vh] overflow-y-auto pr-2">
          {schedule.map((item, index) => (
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
