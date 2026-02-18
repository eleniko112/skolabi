"use client";

import { Siren, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { EmergencyState } from '@/lib/types';
import { addDocumentNonBlocking } from '@/firebase';
import { collection } from 'firebase/firestore';

export function EmergencyOverlay({ schoolId }: { schoolId: string }) {
  const firestore = useFirestore();
  
  const emergencyDocRef = useMemoFirebase(() => {
    if (!firestore || !schoolId) return null;
    return doc(firestore, 'schools', schoolId, 'config', 'emergency');
  }, [firestore, schoolId]);

  const { data: emergencyState } = useDoc<EmergencyState>(emergencyDocRef);

  const historyCollectionRef = useMemoFirebase(() => {
      if (!firestore || !schoolId) return null;
      return collection(firestore, 'schools', schoolId, 'history');
  }, [firestore, schoolId]);
  
  const handleClose = () => {
    if(!emergencyDocRef || !emergencyState) return;

    updateDoc(emergencyDocRef, { active: false });

    if (historyCollectionRef) {
        addDocumentNonBlocking(historyCollectionRef, {
            action: "საგანგებო რეჟიმის გამორთვა",
            details: "რეჟიმი გამოირთო დაფიდან.",
            timestamp: new Date().toISOString(),
        });
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
