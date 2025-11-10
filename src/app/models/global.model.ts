export interface ProviderNote {
  id?: string;

  type: 'Progress Notes' | 'Consult' | 'Follow Up' | 'Discharge' | 'Other';
  effectiveAt: any;        // Firestore Timestamp
  dateOfService?: any;     // Firestore Timestamp
  visitType?: string;      // e.g., Follow Up, Initial, PRN
  details: string;         // full note text (can include sections)
  providerName?: string;   // display only
  providerUid?: string;    // who authored
  createdBy?: string;
  createdAt?: any;
  updatedAt?: any;

  // Optional status flags
  draft?: boolean;
}


export type LabFlag = 'Normal' | 'Abnormal' | 'Critical' | 'Unknown';
export type LabStatus = 'New' | 'In Progress' | 'Final' | 'Corrected' | 'Canceled';
export type SpecimenSource =
  | 'Blood' | 'Urine' | 'Stool' | 'Sputum' | 'Wound' | 'Saliva' | 'CSF' | 'Other' | 'Unknown';

export interface LabResultDetail {
  panel?: string;          // e.g., "CBC", "CMP"
  testName: string;        // e.g., "Hemoglobin"
  result: string;          // e.g., "13.5"
  units?: string;          // e.g., "g/dL"
  refRange?: string;       // e.g., "12.0–15.5"
  flag?: LabFlag;          // highlight in table
  status?: LabStatus;      // per-value (optional)
}

export interface LabReport {
 id?: string;
  patientId: string;
  reportName?: string;
  orderingProvider?: string;
  reportingLab?: string;
  flag?: string;
  status?: LabStatus;
  results?: LabResultDetail[];
  notes?: string;

  // Files

  fileName?: string;

  // Dates (Firestore Timestamp or JS Date)
  collectionDate?: any;
  receivedDate?: any;
  reportedDate?: any;
  url ?: string;

  // Header
  
  attendingProvider?: string;
  admittingProvider?: string;
  ccList?: string;
  performingLab?: string;
  orderNumber?: string;
  orderNotes?: string;

  // Status/flags
  category?: string;

  // Specimen details
  specimenNumber?: string;
  specimenSource?: SpecimenSource | string;
  specimenSiteModifier?: string;
  collectionVolume?: string;
  containersCount?: string;

  createdAt?: any;
 
  createdBy?: string;
  
  updatedAt?: any;
  testName?: string[];
  labName?: string;
  result?: string[];
  attachments?: string[];
  fileURL?: string;

}
