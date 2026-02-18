import { Firestore, writeBatch, doc, collection } from 'firebase/firestore';
import { School, Announcement, SchedulePeriod } from './types';
import { PlaceHolderImages } from './placeholder-images';

// Default Schools Data
const defaultSchools: Omit<School, 'id'>[] = [
  { 
    name: '1-ლი საჯარო სკოლა', 
    password: '1111', 
    adminPin: '1234',
    logoUrl: PlaceHolderImages.find(i => i.id === 'school-logo-1')?.imageUrl || '',
  },
  { 
    name: 'მე-7 საჯარო სკოლა', 
    password: '7777',
    adminPin: '1234',
    logoUrl: PlaceHolderImages.find(i => i.id === 'school-logo-7')?.imageUrl || '',
  },
  { 
    name: 'მე-3 საჯარო სკოლა', 
    password: '3333',
    adminPin: '1234',
    logoUrl: PlaceHolderImages.find(i => i.id === 'school-logo-3')?.imageUrl || '',
  },
];

// Default Announcements Data
const defaultAnnouncements: Omit<Announcement, 'createdAt' | 'isActive' | 'id'>[] = [
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
];

// Default Schedule Data
const defaultSchedule: SchedulePeriod[] = [
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

// Default Theme
const defaultTheme = {
    background: "220 20% 97%",
    primary: "221 39% 49%",
    accent: "347 77% 60%",
};

// Default Settings
const defaultSettings = {
  bellSound: 'default',
};

// Default Emergency State
const defaultEmergencyState = {
    active: false,
    message: 'ყურადღება! სასწავლო პროცესი შეწყვეტილია. გთხოვთ, შეინარჩუნოთ სიმშვიდე და მიჰყვეთ ინსტრუქციებს.',
};


export async function seedInitialData(db: Firestore): Promise<void> {
  const batch = writeBatch(db);

  // 1. Seed Schools
  for (const schoolData of defaultSchools) {
    const schoolRef = doc(db, 'schools', schoolData.name.toLowerCase().replace(/ /g, '-'));
    batch.set(schoolRef, schoolData);
    const schoolId = schoolRef.id;

    // 2. For each school, seed subcollections
    // Seed Announcements for each school
    defaultAnnouncements.forEach(announcementData => {
      const announcementRef = doc(collection(db, 'schools', schoolId, 'announcements'));
      const newAnnouncement = {
          ...announcementData,
          isActive: true,
          createdAt: new Date().toISOString()
      };
      batch.set(announcementRef, newAnnouncement);
    });

    // Seed Schedule for each school in a single document
    const scheduleRef = doc(db, 'schools', schoolId, 'config', 'schedule');
    batch.set(scheduleRef, { periods: defaultSchedule });

    // Seed Theme
    const themeRef = doc(db, 'schools', schoolId, 'config', 'theme');
    batch.set(themeRef, defaultTheme);
    
    // Seed Settings
    const settingsRef = doc(db, 'schools', schoolId, 'config', 'settings');
    batch.set(settingsRef, defaultSettings);

    // Seed Emergency State
    const emergencyRef = doc(db, 'schools', schoolId, 'config', 'emergency');
    batch.set(emergencyRef, defaultEmergencyState);
  }

  // 3. Commit the batch
  await batch.commit();
}
