"use client";

import { useState, useEffect } from 'react';
import { Siren, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { addHistoryLog } from '@/lib/history';
import { getEmergencyKey, type EmergencyState } from '@/lib/emergency';

const defaultState: EmergencyState = {
    active: false,
    message: '',
};

export function EmergencyOverlay({ schoolId }: { schoolId: string }) {
  const [emergencyState, setEmergencyState] = useState<EmergencyState | null>(null);
  const storageKey = getEmergencyKey(schoolId);

  useEffect(() => {
    const updateState = () => {
        if(!schoolId) return;
        try {
            const savedState = localStorage.getItem(storageKey);
            setEmergencyState(savedState ? JSON.parse(savedState) : defaultState);
        } catch (error) {
            console.error("Could not load emergency state:", error);
            setEmergencyState(defaultState);
        }
    };

    updateState(); // Initial load

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === storageKey) {
        updateState();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [schoolId, storageKey]);
  
  const handleClose = () => {
    if(!schoolId || !emergencyState) return;
    const newState = { ...emergencyState, active: false };
    try {
        const dataToSave = JSON.stringify(newState);
        localStorage.setItem(storageKey, dataToSave);
        window.dispatchEvent(new StorageEvent('storage', { key: storageKey, newValue: dataToSave }));
        addHistoryLog(schoolId, "საგანგებო რეჟიმის გამორთვა", "რეჟიმი გამოირთო დაფიდან.");
        setEmergencyState(newState);
    } catch(error) {
        console.error("Failed to disable emergency mode:", error);
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
