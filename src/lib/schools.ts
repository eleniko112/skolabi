import { School } from './types';
import { doc, collection, getDocs, setDoc, updateDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import { updateDocumentNonBlocking, deleteDocumentNonBlocking, setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Firestore } from 'firebase/firestore';

export const getSchoolsCollection = (db: Firestore) => collection(db, 'schools');
export const getSchoolDoc = (db: Firestore, schoolId: string) => doc(db, 'schools', schoolId);

export const updateSchool = (db: Firestore, updatedSchool: School) => {
  const schoolRef = getSchoolDoc(db, updatedSchool.id);
  updateDocumentNonBlocking(schoolRef, {
    name: updatedSchool.name,
    password: updatedSchool.password,
    adminPin: updatedSchool.adminPin,
    logoUrl: updatedSchool.logoUrl,
    cardColor: updatedSchool.cardColor,
  });
};

export const addSchool = (db: Firestore, school: School) => {
  const schoolRef = getSchoolDoc(db, school.id);
  setDocumentNonBlocking(schoolRef, {
    ...school,
    backgroundColor: "220 20% 97%",
    themeColor: "221 39% 49%",
    accentColor: "347 77% 60%",
    bellSoundUrlDefault: "default",
  }, { merge: true });
};

export const deleteSchool = (db: Firestore, schoolId: string) => {
  const schoolRef = getSchoolDoc(db, schoolId);
  deleteDocumentNonBlocking(schoolRef);
};

export const reorderSchools = async (db: Firestore, schools: School[]) => {
    // Reordering in Firestore typically requires an order field
    // For simplicity in this prototype, we just update the cardColor or similar 
    // but usually we'd add a 'displayOrder' field.
};
