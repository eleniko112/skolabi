import { SchedulePeriod } from "./types";
import { doc, collection, Firestore } from 'firebase/firestore';
import { setDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';

export const getLessonsCollection = (db: Firestore, schoolId: string) => 
  collection(db, 'schools', schoolId, 'lessons');

export const getLessonDoc = (db: Firestore, schoolId: string, lessonId: string) => 
  doc(db, 'schools', schoolId, 'lessons', lessonId);

export const setSchedule = (db: Firestore, schoolId: string, schedule: SchedulePeriod[]) => {
    schedule.forEach((period, index) => {
        const docRef = getLessonDoc(db, schoolId, period.id || `period-${index}`);
        setDocumentNonBlocking(docRef, {
            ...period,
            schoolId,
            lessonNumber: index + 1,
        }, { merge: true });
    });
};

export const deleteLesson = (db: Firestore, schoolId: string, lessonId: string) => {
    const docRef = getLessonDoc(db, schoolId, lessonId);
    deleteDocumentNonBlocking(docRef);
};
