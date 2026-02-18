"use client";

import { HistoryLog } from './types';

export const HISTORY_KEY_PREFIX = 'history-';

const getStorageKey = (schoolId: string) => `${HISTORY_KEY_PREFIX}${schoolId}`;

export const getHistory = (schoolId: string): HistoryLog[] => {
  if (typeof window === 'undefined') return [];
  try {
    const storageKey = getStorageKey(schoolId);
    const savedData = localStorage.getItem(storageKey);
    if (savedData) {
      // Sort by most recent first
      return JSON.parse(savedData).sort((a: HistoryLog, b: HistoryLog) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }
    return [];
  } catch (error) {
    console.error("Could not load history data:", error);
    return [];
  }
};

const saveHistory = (schoolId: string, logs: HistoryLog[]) => {
    const storageKey = getStorageKey(schoolId);
    const dataToSave = JSON.stringify(logs);
    localStorage.setItem(storageKey, dataToSave);
    window.dispatchEvent(new StorageEvent('storage', { key: storageKey, newValue: dataToSave }));
}

export const addHistoryLog = (schoolId: string, action: string, details: string) => {
    const history = getHistory(schoolId);
    const newLog: HistoryLog = {
        id: `${Date.now()}`,
        timestamp: new Date().toISOString(),
        action,
        details,
    };
    const updatedHistory = [newLog, ...history];
    saveHistory(schoolId, updatedHistory);
};

export const clearHistory = (schoolId: string) => {
    saveHistory(schoolId, []);
};
