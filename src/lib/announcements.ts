import { Announcement } from './types';
import { PlaceHolderImages } from './placeholder-images';

export const ANNOUNCEMENTS_KEY_PREFIX = 'school-board-announcements-v3-';

function getLocalIsoDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

const getDefaultAnnouncements = (): Omit<Announcement, 'id' | 'createdAt' | 'isActive'>[] => {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setFullYear(endDate.getFullYear() + 1);

    const startDateString = getLocalIsoDate(startDate);
    const endDateString = getLocalIsoDate(endDate);
    
    return [
    {
      title: 'ტრენინგი AI-ზე და ჩვენს მიდგომაზე',
      content: 'დღეს, 15:00 საათზე, სააქტო დარბაზში გაიმართება საინტერესო ტრენინგი ხელოვნურ ინტელექტზე. განვიხილავთ თანამედროვე ტექნოლოგიებს და მათ გამოყენებას განათლებაში. დასწრება თავისუფალია.',
      imageUrl: PlaceHolderImages.find(i => i.id === 'ai-training')?.imageUrl || '',
      imageHint: 'ai technology',
      startDate: startDateString,
      endDate: endDateString,
    },
    {
      title: 'სასკოლო სპორტული დღე',
      content: 'მომავალ შაბათს, სკოლის სტადიონზე ჩატარდება ყოველწლიური სპორტული დღე. გელოდებით ყველას, მონაწილეობის მისაღებად და თქვენი კლასელების გასამხნევებლად!',
      imageUrl: PlaceHolderImages.find(i => i.id === 'sports-day')?.imageUrl || '',
      imageHint: 'students sports',
      startDate: startDateString,
      endDate: endDateString,
    },
]};


const getStorage = () => {
    if (typeof window === 'undefined') return undefined;
    return window.localStorage;
}

export const getAnnouncements = (schoolId: string, initialize = false): Announcement[] => {
    const storage = getStorage();
    if (!storage) return [];
    
    const key = `${ANNOUNCEMENTS_KEY_PREFIX}${schoolId}`;
    let announcements = JSON.parse(storage.getItem(key) || 'null') as Announcement[] | null;

    if ((!announcements || announcements.length === 0) && initialize) {
        const defaultData = getDefaultAnnouncements();
        announcements = defaultData.map((ann, index) => ({
            ...ann,
            id: `${Date.now()}-${index}`,
            createdAt: new Date().toISOString(),
            isActive: true,
        }));
        storage.setItem(key, JSON.stringify(announcements));
    }
    
    return announcements || [];
};

export const addAnnouncement = (schoolId: string, announcementData: Omit<Announcement, 'id' | 'createdAt' | 'isActive'>) => {
    const storage = getStorage();
    if (!storage) return;

    const announcements = getAnnouncements(schoolId);
    const newAnnouncement: Announcement = {
        ...announcementData,
        id: `${Date.now()}`,
        createdAt: new Date().toISOString(),
        isActive: true,
    };
    const updatedAnnouncements = [...announcements, newAnnouncement];
    storage.setItem(`${ANNOUNCEMENTS_KEY_PREFIX}${schoolId}`, JSON.stringify(updatedAnnouncements));
};

export const updateAnnouncement = (schoolId: string, updatedAnnouncement: Announcement) => {
    const storage = getStorage();
    if (!storage) return;

    let announcements = getAnnouncements(schoolId);
    announcements = announcements.map(ann => ann.id === updatedAnnouncement.id ? updatedAnnouncement : ann);
    storage.setItem(`${ANNOUNCEMENTS_KEY_PREFIX}${schoolId}`, JSON.stringify(announcements));
};

export const deleteAnnouncement = (schoolId: string, announcementId: string) => {
    const storage = getStorage();
    if (!storage) return;

    let announcements = getAnnouncements(schoolId);
    announcements = announcements.filter(ann => ann.id !== announcementId);
    storage.setItem(`${ANNOUNCEMENTS_KEY_PREFIX}${schoolId}`, JSON.stringify(announcements));
};
