import { School } from './types';
import { PlaceHolderImages } from './placeholder-images';
import { initializeAnnouncements } from './announcements';
import { getSchedule } from './schedule';
import { getTheme } from './theme';
import { getSettings } from './settings';

const SCHOOLS_KEY = 'school-board-schools-v2';

const defaultSchools: School[] = [
  { 
    id: '1-sajaro-skola',
    name: '1-ლი საჯარო სკოლა', 
    password: '1111', 
    adminPin: '1234',
    logoUrl: PlaceHolderImages.find(i => i.id === 'school-logo-1')?.imageUrl || '',
    cardColor: "347 77% 60%", // Cherry Red
  },
  { 
    id: '7-sajaro-skola',
    name: 'მე-7 საჯარო სკოლა', 
    password: '7777',
    adminPin: '1234',
    logoUrl: PlaceHolderImages.find(i => i.id === 'school-logo-7')?.imageUrl || '',
    cardColor: "347 77% 60%", // Rose/Pink
  },
  { 
    id: '3-sajaro-skola',
    name: 'მე-3 საჯარო სკოლა', 
    password: '3333',
    adminPin: '1234',
    logoUrl: PlaceHolderImages.find(i => i.id === 'school-logo-3')?.imageUrl || '',
    cardColor: "24 95% 53%", // Orange
  },
];

const getStorage = () => {
    if (typeof window === 'undefined') return undefined;
    return window.localStorage;
}

export const getSchools = (initialize = false): School[] => {
    const storage = getStorage();
    if (!storage) return [];

    let schoolsString = storage.getItem(SCHOOLS_KEY);
    let schools = schoolsString ? (JSON.parse(schoolsString) as School[]) : null;

    if (initialize) {
        const existingSchools = schools || [];
        const missingDefaults = defaultSchools.filter(def => !existingSchools.some(ex => ex.id === def.id));
        
        if (missingDefaults.length > 0) {
            const updatedSchools = [...existingSchools, ...missingDefaults];
            storage.setItem(SCHOOLS_KEY, JSON.stringify(updatedSchools));
            
            // Initialize data for new defaults
            missingDefaults.forEach(school => {
                initializeAnnouncements(school.id);
                getSchedule(school.id);
                getTheme(school.id);
                getSettings(school.id);
            });
            return updatedSchools;
        }
    }
    
    return schools || [];
};

export const getSchoolById = (id: string): School | null => {
    const schools = getSchools(true);
    return schools.find(school => school.id === id) || null;
}

export const updateSchool = (updatedSchool: School) => {
    const storage = getStorage();
    if (!storage) return;

    let schools = getSchools();
    schools = schools.map(school => school.id === updatedSchool.id ? updatedSchool : school);
    storage.setItem(SCHOOLS_KEY, JSON.stringify(schools));
}

export const addSchool = (school: School) => {
    const storage = getStorage();
    if (!storage) return;

    const schools = getSchools();
    const updatedSchools = [...schools, school];
    storage.setItem(SCHOOLS_KEY, JSON.stringify(updatedSchools));
    
    // Initialize data for the new school
    initializeAnnouncements(school.id);
    getSchedule(school.id);
    getTheme(school.id);
    getSettings(school.id);
}

export const deleteSchool = (schoolId: string) => {
    const storage = getStorage();
    if (!storage) return;

    let schools = getSchools();
    schools = schools.filter(s => s.id !== schoolId);
    storage.setItem(SCHOOLS_KEY, JSON.stringify(schools));
}

export const reorderSchools = (schoolId: string, direction: 'up' | 'down') => {
    const storage = getStorage();
    if (!storage) return;

    let schools = getSchools();
    const index = schools.findIndex(s => s.id === schoolId);
    if (index === -1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= schools.length) return;

    const newSchools = [...schools];
    [newSchools[index], newSchools[targetIndex]] = [newSchools[targetIndex], newSchools[index]];
    
    storage.setItem(SCHOOLS_KEY, JSON.stringify(newSchools));
};