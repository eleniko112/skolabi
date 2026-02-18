"use client";

import { useState, useEffect } from 'react';
import { Siren } from 'lucide-react';

const EMERGENCY_STATE_KEY = 'emergencyState';

interface EmergencyState {
  active: boolean;
  message: string;
}

const defaultState: EmergencyState = {
    active: false,
    message: '',
};

export function EmergencyOverlay() {
  const [emergencyState, setEmergencyState] = useState<EmergencyState | null>(null);
  
  useEffect(() => {
    const updateState = () => {
        try {
            const savedState = localStorage.getItem(EMERGENCY_STATE_KEY);
            setEmergencyState(savedState ? JSON.parse(savedState) : defaultState);
        } catch (error) {
            console.error("Could not load emergency state:", error);
            setEmergencyState(defaultState);
        }
    };

    updateState(); // Initial load

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === EMERGENCY_STATE_KEY) {
        updateState();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  if (!emergencyState?.active) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-destructive/95 text-destructive-foreground p-8 animate-in fade-in duration-500">
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
