import { EmergencyState } from "./types";
import { doc, Firestore } from 'firebase/firestore';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';

export const getEmergencyDoc = (db: Firestore, schoolId: string) => 
  doc(db, 'schools', schoolId, 'emergencyAnnouncements', 'active');

export const setEmergencyState = (db: Firestore, schoolId: string, state: Omit<EmergencyState, 'id' | 'schoolId' | 'activatedAt'>) => {
    const docRef = getEmergencyDoc(db, schoolId);
    setDocumentNonBlocking(docRef, {
        ...state,
        schoolId,
        activatedAt: new Date().toISOString(),
    }, { merge: true });
};
