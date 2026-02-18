
"use client";

import { Announcement } from './types';
import { PlaceHolderImages } from './placeholder-images';
import { addHistoryLog } from './history';

export const ANNOUNCEMENTS_KEY_PREFIX = 'announcements-';

const defaultAnnouncements: Omit<Announcement, 'id' | 'createdAt' | 'isActive'>[] = [
  {
    title: 'ტრენინგი AI-ზე და ჩვენს მიდგომაზე',
    content: 'დღეს, 15:00 საათზე, სააქტო დარბაზში გაიმართება საინტერესო ტრენინგი ხელოვნურ ინტელექტზე. განვიხილავთ თანამედროვე ტექნოლოგიებს და მათ გამოყენებას განათლებაში. დასწრება თავისუფალია.',
    imageUrl: PlaceHolderImages.find(i => i.id === 'ai-training')?.imageUrl || '',
    imageHint: 'ai technology',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString().split('T')[0],
  },
  {
    title: 'სასკოლო სპორტული დღე',
    content: 'მომავალ შაბათს, სკოლის სტადიონზე ჩატარდება ყოველწლიური სპორტული დღე. გელოდებით ყველას, მონაწილეობის მისაღებად და თქვენი კლასელების გასამხნევებლად!',
    imageUrl: PlaceHolderImages.find(i => i.id === 'sports-day')?.imageUrl || '',
    imageHint: 'students sports',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(new Date().setDate(new Date().getDate() + 10)).toISOString().split('T')[0],
  },
  {
    title: 'საგაზაფხულო კონცერტი',
    content: 'მოემზადეთ! საგაზაფხულო კონცერტი გაიმართება 25 მაისს. ჩვენი ნიჭიერი მოსწავლეები წარმოგიდგენენ მუსიკალურ და თეატრალურ ნომრებს. ბილეთები მალე გაიყიდება.',
    imageUrl: PlaceHolderImages.find(i => i.id === 'school-concert')?.imageUrl || '',
    imageHint: 'school concert',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(new Date().setDate(new Date().getDate() + 15)).toISOString().split('T')[0],
  }
];

const getStorageKey = (schoolId: string) => `${ANNOUNCEMENTS_KEY_PREFIX}${schoolId}`;

export const getAnnouncements = (schoolId: string): Announcement[] => {
  if (typeof window === 'undefined') return [];
  try {
    const storageKey = getStorageKey(schoolId);
    const savedData = localStorage.getItem(storageKey);
    if (savedData) {
      return JSON.parse(savedData);
    } else {
        // If no data, create default announcements
        const announcementsWithIds: Announcement[] = defaultAnnouncements.map((ann, index) => ({
            ...ann,
            id: `${Date.now()}-${index}`,
            createdAt: new Date().toISOString(),
            isActive: true,
        }));
        localStorage.setItem(storageKey, JSON.stringify(announcementsWithIds));
        return announcementsWithIds;
    }
  } catch (error) {
    console.error("Could not load announcements data:", error);
    return [];
  }
};

const saveAnnouncements = (schoolId: string, announcements: Announcement[]) => {
    const storageKey = getStorageKey(schoolId);
    const dataToSave = JSON.stringify(announcements);
    localStorage.setItem(storageKey, dataToSave);
    // Dispatch event for other tabs
    window.dispatchEvent(new StorageEvent('storage', { key: storageKey, newValue: dataToSave }));
}

export const addAnnouncement = (schoolId: string, announcementData: Omit<Announcement, 'id' | 'createdAt'>) => {
    const announcements = getAnnouncements(schoolId);
    const newAnnouncement: Announcement = {
        ...announcementData,
        id: `${Date.now()}`,
        createdAt: new Date().toISOString(),
    };
    const updatedAnnouncements = [...announcements, newAnnouncement];
    saveAnnouncements(schoolId, updatedAnnouncements);
    addHistoryLog(schoolId, 'განცხადების დამატება', newAnnouncement.title);
};

export const updateAnnouncement = (schoolId: string, updatedAnnouncement: Announcement) => {
    let announcements = getAnnouncements(schoolId);
    const index = announcements.findIndex(a => a.id === updatedAnnouncement.id);
    if (index !== -1) {
        announcements[index] = updatedAnnouncement;
        saveAnnouncements(schoolId, announcements);
        addHistoryLog(schoolId, 'განცხადების განახლება', updatedAnnouncement.title);
    }
}

export const deleteAnnouncement = (schoolId: string, announcementId: string) => {
    const announcements = getAnnouncements(schoolId);
    const announcementToDelete = announcements.find(a => a.id === announcementId);
    const updatedAnnouncements = announcements.filter(a => a.id !== announcementId);
    saveAnnouncements(schoolId, updatedAnnouncements);
    if (announcementToDelete) {
        addHistoryLog(schoolId, 'განცხადების წაშლა', announcementToDelete.title);
    }
};
