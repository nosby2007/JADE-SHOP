
import { Timestamp } from 'firebase/firestore';
export interface Patient {
    id?: string;
    name: string;
    gender?: string;
    dob?: string | Date;
    phone?: string;
    email?: string;
    address?: string;
    createdAt?: any;
    updatedAt?: any;
  }
  
  export interface Rx {
    id?: string;
    name: string;
    dose?: string | null;
    route?: string | null;
    frequency?: string | null;
  
    medicationType?: string;  // NEW
    medicationForm?: string;  // NEW
    prescriber?: string;      // NEW
  
    startDate?: Timestamp | null; // now Timestamp
    endDate?: Timestamp | null;   // now Timestamp
    notes?: string | null;
  
    eSignature?: {
      signerUid: string;
      signerEmail: string | null;
      signerName?: string | null;
      signedAt: Timestamp | any;  // serverTimestamp() on write, becomes Timestamp on read
      method: 'password';
    };
  }
  export type TaskFreq = 'once' | 'daily' | 'weekly' | 'custom';
  
  export interface NurseTask {
    id?: string;
    type: 'med' | 'care' | 'assessment';
    title: string;
    details?: string;
    dueAt?: any;
    completed?: boolean;
    notes?: string;
    
    link?: { rxId?: string; assessmentProgramId?: string };
   
    createdBy?: string;
    
    // Récurrence (facultatif)
  repeat?: {
    enabled: boolean;         // true = tâche récurrente
    every: number;            // ex: 1, 2, 4
    unit: 'day'|'week'|'month';
    // bornes
    count?: number;           // ex: faire 12 occurrences
    until?: any;              // Firestore Timestamp (fin)
    byWeekday?: number[];     // 0..6 (optionnel, pour “chaque Lundi/Mercredi”)
  };

  // pour gestion des occurrences
  parentTaskId?: string;      // id de la tâche “mère” si occurrence
  occurrenceIndex?: number;   // 0,1,2,… (n° d’instance)
  createdAt?: any;
  updatedAt?: any;

  }
  
  export interface Assessment {
    id?: string;
    program: 'Braden' | 'FallRisk' | 'Nutrition' | 'Wound';
    answers?: any;
    score?: number;
    status?: 'open'|'submitted'|'closed';
    assessedAt?: any;
    assessedBy?: string;
    createdAt?: any;
    createdBy?: string;
    updatedAt?: any;
  }
  