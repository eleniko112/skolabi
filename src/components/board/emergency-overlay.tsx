"use client";

import { useState, useEffect } from 'react';
import { Siren, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getEmergencyKey, type EmergencyState, setEmergencyState as setGlobalEmergencyState, getEmergencyState } from '@/lib/emergency';
import { addHistoryLog } from '@/lib/history';


export function EmergencyOverlay({ schoolId }: { schoolId: string }) {
  const [emergencyState, setEmergencyState] = useState<EmergencyState | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Initialize state on mount
    const currentState = getEmergencyState(schoolId);
    setEmergencyState(currentState);

    // Listen for changes from other tabs/windows
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === getEmergencyKey(schoolId)) {
        const updatedState = getEmergencyState(schoolId);
        setEmergencyState(updatedState);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [schoolId]);

  const handleClose = () => {
    if(emergencyState) {
        // Update local state for immediate UI change
        setEmergencyState({ ...emergencyState, active: false });
        // Update localStorage and notify other tabs
        setGlobalEmergencyState(schoolId, { ...emergencyState, active: false });
        addHistoryLog(schoolId, {
            action: "საგანგებო რეჟიმის გამორთვა",
            details: "რეჟიმი გამოირთო დაფიდან.",
        });
    }
  }

  if (!isClient || !emergencyState?.active) {
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
