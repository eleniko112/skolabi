import { Announcement } from './types';
import { doc, collection, query, where, Firestore } from 'firebase/firestore';
import { addDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';

export const getAnnouncementsCollection = (db: Firestore, schoolId: string) => 
  collection(db, 'schools', schoolId, 'announcements');

export const getAnnouncementDoc = (db: Firestore, schoolId: string, announcementId: string) => 
  doc(db, 'schools', schoolId, 'announcements', announcementId);

export const addAnnouncement = (db: Firestore, schoolId: string, announcementData: Omit<Announcement, 'id' | 'createdAt' | 'isActive' | 'schoolId'>) => {
    const colRef = getAnnouncementsCollection(db, schoolId);
    addDocumentNonBlocking(colRef, {
        ...announcementData,
        schoolId,
        createdAt: new Date().toISOString(),
        isActive: true,
    });
};

export const updateAnnouncement = (db: Firestore, schoolId: string, updatedAnnouncement: Announcement) => {
    const docRef = getAnnouncementDoc(db, schoolId, updatedAnnouncement.id);
    updateDocumentNonBlocking(docRef, { ...updatedAnnouncement });
};

export const deleteAnnouncement = (db: Firestore, schoolId: string, announcementId: string) => {
    const docRef = getAnnouncementDoc(db, schoolId, announcementId);
    deleteDocumentNonBlocking(docRef);
};
