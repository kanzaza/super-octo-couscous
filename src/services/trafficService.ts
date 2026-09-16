import { 
  collection, 
  getDocs, 
  writeBatch, 
  doc, 
  addDoc
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { TrafficFineRecord } from '../types/traffic';
import { INITIAL_TRAFFIC_FINES } from '../data/initialTrafficData';

const COLLECTION_NAME = 'traffic_fines';

export async function fetchTrafficFinesFromFirestore(): Promise<TrafficFineRecord[]> {
  try {
    const colRef = collection(db, COLLECTION_NAME);
    const snapshot = await getDocs(colRef);
    
    if (snapshot.empty) {
      // If Firestore is empty, seed it with the initial official records
      await seedInitialDataToFirestore();
      return INITIAL_TRAFFIC_FINES;
    }

    const records: TrafficFineRecord[] = [];
    snapshot.forEach((d) => {
      records.push({
        id: d.id,
        ...(d.data() as Omit<TrafficFineRecord, 'id'>)
      });
    });

    return records;
  } catch (error) {
    console.warn('Could not read from Firestore, falling back to local dataset:', error);
    return INITIAL_TRAFFIC_FINES;
  }
}

export async function seedInitialDataToFirestore(): Promise<void> {
  try {
    const batch = writeBatch(db);
    const colRef = collection(db, COLLECTION_NAME);
    
    // Write in batches of up to 400
    const records = INITIAL_TRAFFIC_FINES;
    for (const rec of records) {
      const docRef = doc(colRef, rec.id);
      batch.set(docRef, {
        paymentDate: rec.paymentDate,
        ticketDate: rec.ticketDate,
        ticketNumber: rec.ticketNumber,
        legalSection: rec.legalSection,
        offense: rec.offense,
        amount: rec.amount,
        paymentChannel: rec.paymentChannel,
        citizenId: rec.citizenId || '',
        payerName: rec.payerName || '',
        helmetCode: rec.helmetCode || '-',
        officerName: rec.officerName || '-',
        actType: rec.actType || 'พ.ร.บ.รถยนต์',
        updatedAt: new Date().toISOString()
      });
    }
    await batch.commit();
  } catch (err) {
    console.error('Error seeding initial records to Firestore:', err);
  }
}

export async function addTrafficFineToFirestore(record: Omit<TrafficFineRecord, 'id'>): Promise<TrafficFineRecord> {
  const colRef = collection(db, COLLECTION_NAME);
  const docRef = await addDoc(colRef, {
    ...record,
    createdAt: new Date().toISOString()
  });
  return {
    id: docRef.id,
    ...record
  };
}

export async function batchImportTrafficFines(records: TrafficFineRecord[]): Promise<number> {
  try {
    let count = 0;
    const colRef = collection(db, COLLECTION_NAME);
    
    // Chunk by 250
    const chunkSize = 250;
    for (let i = 0; i < records.length; i += chunkSize) {
      const chunk = records.slice(i, i + chunkSize);
      const batch = writeBatch(db);
      for (const rec of chunk) {
        const docRef = doc(colRef, rec.id || `rec-${Date.now()}-${Math.random()}`);
        batch.set(docRef, {
          paymentDate: rec.paymentDate,
          ticketDate: rec.ticketDate,
          ticketNumber: rec.ticketNumber,
          legalSection: rec.legalSection,
          offense: rec.offense,
          amount: rec.amount,
          paymentChannel: rec.paymentChannel,
          citizenId: rec.citizenId || '',
          payerName: rec.payerName || '',
          helmetCode: rec.helmetCode || '-',
          officerName: rec.officerName || '-',
          actType: rec.actType || 'พ.ร.บ.รถยนต์',
          updatedAt: new Date().toISOString()
        }, { merge: true });
        count++;
      }
      await batch.commit();
    }
    return count;
  } catch (error) {
    console.error('Error batch importing:', error);
    throw error;
  }
}
