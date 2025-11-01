
import { Timestamp } from 'firebase/firestore';
export interface Patient {
    id?: string;
    name: string;
    preferredName?: string;
    gender?: string;
    dob?: string | Date;
    admissionDate?: string | Date;

    // Contact / address
    phone?: string;
    email?: string;
    address?: string;
    address1?: string;
    address2?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
    language?: string;
    maritalStatus?: string;

    // Identity (flat)
    ssn?: string;
    idType?: string;
    idNumber?: string;
    insuranceProvider?: string;
    insuranceId?: string;
    groupNumber?: string;
    payor?: string;
    policyHolder?: string;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    emergencyRelation?: string;

    // Clinical (flat)
    reasonForAdmission?: string;
    primaryCareProvider?: string;
    referringProvider?: string;
    codeStatus?: string;
    preferredPharmacy?: string;
    heightCm?: string | number;
    weightKg?: string | number;

    // Consent (flat)
    hipaaAck?: boolean;
    privacyNoticeAck?: boolean;
    financialAgreementAck?: boolean;

    // Legacy aliases for older consumers
    docteur?: string;
    raison?: string;
    paiement?: string;

    // Optional legacy nested emergencyContact object
    emergencyContact?: {
      name?: string;
      phone?: string;
      relation?: string;
    };

    createdAt?: any;
    updatedAt?: any;

    // retained from previous model
    allergies?: string[];
    diagnoses?: string[];
    payment?: string;
    reason?: string;
    occupation?: string;
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
  