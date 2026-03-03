"use client";

import { Siren, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDoc, useMemoFirebase, useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';
import { EmergencyState } from '@/lib/types';
import { setEmergencyState } from '@/lib/emergency';

export function EmergencyOverlay({ schoolId }: { schoolId: string }) {
  const firestore = useFirestore();
  const emergencyRef = useMemoFirebase(() => {
    if (!firestore || !schoolId) return null;
    return doc(firestore, 'schools', schoolId, 'emergencyAnnouncements', 'active');
  }, [firestore, schoolId]);

  const { data: emergencyState } = useDoc<EmergencyState>(emergencyRef);

  const handleClose = () => {
    if (emergencyState && firestore) {
        setEmergencyState(firestore, schoolId, { active: false, message: emergencyState.message });
    }
  }

  if (!emergencyState?.active) {
    return null;
  }
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-destructive/95 text-destructive-foreground p-8 animate-in fade-in duration-500">
      <Button 
        variant="ghost" 
        size="icon" 
        className="absolute top-4 right-4 text-destructive-foreground/70 hover:text-destructive-foreground hover:bg-white/10"
        onClick={handleClose}
        >
        <X className="h-8 w-8" />
        <span className="sr-only">დახურვა</span>
      </Button>
      <div className="text-center">
        <Siren className="h-24 w-24 mx-auto mb-6 animate-pulse" />
        <h1 className="text-5xl font-bold font-headline mb-4">ყურადღება!</h1>
        <p className="text-2xl max-w-4xl mx-auto">
          {emergencyState.message}
        </p>
      </div>
    </div>
  );
}
