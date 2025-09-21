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
    dose?: string;
    route?: string;           // PO, IV…
    frequency?: string;       // q8h, BID…
    startDate?: any;          // Date | Timestamp | ISO
    endDate?: any;
    notes?: string;
    createdAt?: any;
    createdBy?: string;
    updatedAt?: any;
  }
  export type TaskFreq = 'once' | 'daily' | 'weekly' | 'custom';
  
  export interface NurseTask {
    id?: string;
    type: 'med' | 'care' | 'assessment';
    title: string;
    details?: string;
    dueAt?: any;
    completed?: boolean;
    repeat?: { freq: TaskFreq; interval?: number }; // custom every N days
    link?: { rxId?: string; assessmentProgramId?: string };
    createdAt?: any;
    createdBy?: string;
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
  