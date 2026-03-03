import { School } from './types';
import { doc, collection, Firestore } from 'firebase/firestore';
import { updateDocumentNonBlocking, deleteDocumentNonBlocking, setDocumentNonBlocking } from '@/firebase/non-blocking-updates';

export const getSchoolsCollection = (db: Firestore) => collection(db, 'schools');
export const getSchoolDoc = (db: Firestore, schoolId: string) => doc(db, 'schools', schoolId);

export const updateSchool = (db: Firestore, updatedSchool: School) => {
  const schoolRef = getSchoolDoc(db, updatedSchool.id);
  updateDocumentNonBlocking(schoolRef, {
    name: updatedSchool.name,
    password: updatedSchool.password,
    adminPin: updatedSchool.adminPin,
    logoUrl: updatedSchool.logoUrl || '',
    cardColor: updatedSchool.cardColor || '221 39% 49%',
    themeColor: updatedSchool.themeColor || '221 39% 49%',
    backgroundColor: updatedSchool.backgroundColor || '220 20% 97%',
    accentColor: updatedSchool.accentColor || '347 77% 60%',
    displayOrder: updatedSchool.displayOrder ?? 0,
  });
};

export const addSchool = (db: Firestore, school: School) => {
  const schoolRef = getSchoolDoc(db, school.id);
  setDocumentNonBlocking(schoolRef, {
    ...school,
    backgroundColor: school.backgroundColor || "220 20% 97%",
    themeColor: school.themeColor || "221 39% 49%",
    accentColor: school.accentColor || "347 77% 60%",
    cardColor: school.cardColor || "221 39% 49%",
    bellSoundUrlDefault: "default",
    displayOrder: school.displayOrder ?? 0,
  }, { merge: true });
};

export const deleteSchool = (db: Firestore, schoolId: string) => {
  const schoolRef = getSchoolDoc(db, schoolId);
  deleteDocumentNonBlocking(schoolRef);
};
