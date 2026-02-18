import { HistoryLog } from "./types";

export const HISTORY_KEY_PREFIX = 'school-board-history-';

const getStorage = () => {
    if (typeof window === 'undefined') return undefined;
    return window.localStorage;
}

export const getHistory = (schoolId: string): HistoryLog[] => {
    const storage = getStorage();
    if (!storage) return [];
    
    const key = `${HISTORY_KEY_PREFIX}${schoolId}`;
    const history = JSON.parse(storage.getItem(key) || '[]') as HistoryLog[];
    
    // Sort by timestamp descending
    return history.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

export const addHistoryLog = (schoolId: string, logData: Omit<HistoryLog, 'id' | 'timestamp'>) => {
    const storage = getStorage();
    if (!storage) return;

    const history = getHistory(schoolId);
    const newLog: HistoryLog = {
        ...logData,
        id: `${Date.now()}`,
        timestamp: new Date().toISOString(),
    };
    const updatedHistory = [newLog, ...history];
    storage.setItem(`${HISTORY_KEY_PREFIX}${schoolId}`, JSON.stringify(updatedHistory));
};

export const clearHistory = (schoolId: string) => {
    const storage = getStorage();
    if (!storage) return;

    storage.removeItem(`${HISTORY_KEY_PREFIX}${schoolId}`);
}
