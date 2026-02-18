import { School } from './types';
import { PlaceHolderImages } from './placeholder-images';
import { getAnnouncements } from './announcements';
import { getSchedule } from './schedule';
import { getTheme } from './theme';
import { getSettings } from './settings';

const SCHOOLS_KEY = 'school-board-schools';

const defaultSchools: School[] = [
  { 
    id: '1-sajaro-skola',
    name: '1-ლი საჯარო სკოლა', 
    password: '1111', 
    adminPin: '1234',
    logoUrl: PlaceHolderImages.find(i => i.id === 'school-logo-1')?.imageUrl || '',
  },
  { 
    id: '7-sajaro-skola',
    name: 'მე-7 საჯარო სკოლა', 
    password: '7777',
    adminPin: '1234',
    logoUrl: PlaceHolderImages.find(i => i.id === 'school-logo-7')?.imageUrl || '',
  },
  { 
    id: '3-sajaro-skola',
    name: 'მე-3 საჯარო სკოლა', 
    password: '3333',
    adminPin: '1234',
    logoUrl: PlaceHolderImages.find(i => i.id === 'school-logo-3')?.imageUrl || '',
  },
];

const getStorage = () => {
    if (typeof window === 'undefined') return undefined;
    return window.localStorage;
}

export const getSchools = (initialize = false): School[] => {
    const storage = getStorage();
    if (!storage) return [];

    let schools = JSON.parse(storage.getItem(SCHOOLS_KEY) || 'null') as School[] | null;

    if ((!schools || schools.length === 0) && initialize) {
        schools = defaultSchools;
        storage.setItem(SCHOOLS_KEY, JSON.stringify(schools));
        
        // Initialize data for each default school
        schools.forEach(school => {
            getAnnouncements(school.id, true);
            getSchedule(school.id);
            getTheme(school.id);
            getSettings(school.id);
        })
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
