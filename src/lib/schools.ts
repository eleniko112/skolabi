"use client";

import { School } from './types';

export const SCHOOLS_DATA_KEY = 'schools-data';

// Default data that matches the previous hardcoded values
const defaultSchools: School[] = [
  { 
    id: '1', 
    name: '1-ლი საჯარო სკოლა', 
    password: '1111', 
    adminPin: '1234',
    logoUrl: 'https://images.unsplash.com/photo-1646334886592-cf7a9b692c75?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw0fHxzY2hvb2wlMjBsb2dvfGVufDB8fHx8MTc3MTI5NzE4MXww&ixlib=rb-4.1.0&q=80&w=1080'
  },
  { 
    id: '7', 
    name: 'მე-7 საჯარო სკოლა', 
    password: '7777',
    adminPin: '1234',
    logoUrl: 'https://images.unsplash.com/photo-1695556575317-9d49e3dccf75?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwyfHxzY2hvb2wlMjBsb2dvfGVufDB8fHx8MTc3MTI5NzE4MXww&ixlib=rb-4.1.0&q=80&w=1080'
  },
  { 
    id: '3', 
    name: 'მე-3 საჯარო სკოლა', 
    password: '3333',
    adminPin: '1234',
    logoUrl: 'https://images.unsplash.com/photo-1728206415817-edd426280277?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxMHx8c2Nob29sJTIwbG9nb3xlbnwwfHx8fDE3NzEyOTcxODF8MA&ixlib=rb-4.1.0&q=80&w=1080'
  },
];

// This function should only be called on the client side.
export const getSchools = (): School[] => {
  try {
    const savedData = localStorage.getItem(SCHOOLS_DATA_KEY);
    if (savedData) {
      return JSON.parse(savedData);
    }
  } catch (error) {
    console.error("Could not load schools data:", error);
  }
  // If nothing in localStorage, save and return default.
  try {
    localStorage.setItem(SCHOOLS_DATA_KEY, JSON.stringify(defaultSchools));
  } catch (error) {
     console.error("Could not save default schools data:", error);
  }
  return defaultSchools;
};

export const getSchoolById = (id: string): School | undefined => {
    const schools = getSchools();
    return schools.find(school => school.id === id);
}

export const updateSchool = (updatedSchool: School) => {
    try {
        const schools = getSchools();
        const schoolIndex = schools.findIndex(s => s.id === updatedSchool.id);
        if (schoolIndex > -1) {
            schools[schoolIndex] = updatedSchool;
            const updatedData = JSON.stringify(schools);
            localStorage.setItem(SCHOOLS_DATA_KEY, updatedData);
            window.dispatchEvent(new StorageEvent('storage', { key: SCHOOLS_DATA_KEY, newValue: updatedData }));
        } else {
            // Handle case where school not found? For now, we assume it's always found.
        }
    } catch (error) {
        console.error("Could not update school data:", error);
    }
}
