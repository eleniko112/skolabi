import { SchedulePeriod } from "./types";

export const SCHEDULE_KEY_PREFIX = 'school-board-schedule-';

export const defaultSchedule: SchedulePeriod[] = [
    { startTime: '09:00', endTime: '09:45', label: '1-ლი გაკვეთილი' },
    { startTime: '09:45', endTime: '10:00', label: 'დასვენება' },
    { startTime: '10:00', endTime: '10:45', label: 'მე-2 გაკვეთილი' },
    { startTime: '10:45', endTime: '11:00', label: 'დასვენება' },
    { startTime: '11:00', endTime: '11:45', label: 'მე-3 გაკვეთილი' },
    { startTime: '11:45', endTime: '12:00', label: 'დასვენება' },
    { startTime: '12:00', endTime: '12:45', label: 'მე-4 გაკვეთილი' },
    { startTime: '12:45', endTime: '13:30', label: 'დიდი დასვენება' },
    { startTime: '13:30', endTime: '14:15', label: 'მე-5 გაკვეთილი' },
    { startTime: '14:15', endTime: '14:30', label: 'დასვენება' },
    { startTime: '14:30', endTime: '15:15', label: 'მე-6 გაკვეთილი' },
    { startTime: '15:15', endTime: '15:30', label: 'დასვენება' },
    { startTime: '15:30', endTime: '16:15', label: 'მე-7 გაკვეთილი' },
    { startTime: '16:15', endTime: '16:15', label: 'გაკვეთილები დასრულდა' },
];

const getStorage = () => {
    if (typeof window === 'undefined') return undefined;
    return window.localStorage;
}

export const getSchedule = (schoolId: string): SchedulePeriod[] => {
    const storage = getStorage();
    if (!storage) return defaultSchedule;

    const key = `${SCHEDULE_KEY_PREFIX}${schoolId}`;
    let schedule = JSON.parse(storage.getItem(key) || 'null') as SchedulePeriod[] | null;

    if (!schedule || schedule.length === 0) {
        storage.setItem(key, JSON.stringify(defaultSchedule));
        return defaultSchedule;
    }

    return schedule;
};

export const setSchedule = (schoolId: string, schedule: SchedulePeriod[]) => {
    const storage = getStorage();
    if (!storage) return;

    storage.setItem(`${SCHEDULE_KEY_PREFIX}${schoolId}`, JSON.stringify(schedule));
};
