// src/app/nurse/models/assessment.model.ts
export type AssessmentType =
  | 'braden'
  | 'skinWeekly'
  | 'pressureInjuryWeekly'
  | 'progressNote'
  | 'carePlan'
  | 'vitals'; // ⬅️ NEW

export interface Esign {
  signerUid: string | null;
  signerEmail?: string | null;
  signerName?: string | null;
  signedAt?: any;           // serverTimestamp() FS; ISO in API
  role?: 'RN' | 'NP' | 'MD';
  method: 'password';
}

export interface AssessmentBase {
  id?: string;
  patientId: string;
  type: AssessmentType;
  createdBy?: string | null;
  createdAt?: any;
  updatedAt?: any;
  eSignature?: Esign;
  pdfUrl?: string | null;
}

export interface SkinWeekly extends AssessmentBase {
  type: 'skinWeekly';
  findings: string;            // brief narrative
  photos?: string[];           // storage URLs (optional)
}

export interface PressureInjuryWeekly extends AssessmentBase {
  type: 'pressureInjuryWeekly';
  stage: '1'|'2'|'3'|'4'|'DTI'|'Unstageable';
  location: string;
  size: { lengthCm?: number|null; widthCm?: number|null; depthCm?: number|null };
  exudate?: 'none'|'serous'|'sanguineous'|'purulent'|null;
  odor?: 'none'|'mild'|'moderate'|'strong'|null;
  dressing?: string|null;
  notes?: string|null;
}

export interface Braden extends AssessmentBase {
  type: 'braden';
  sensory: number; moisture: number; activity: number; mobility: number; nutrition: number; friction: number;
  score: number;                // auto sum (6–23)
  risk: 'none'|'mild'|'moderate'|'high'|'very high';
}

export interface ProgressNote extends AssessmentBase {
  type: 'progressNote';
  authorRole: 'RN'|'NP'|'MD';
  note: string;
  visitDate: any;               // Date in form → Timestamp/ISO on write
}

export interface CarePlan extends AssessmentBase {
  type: 'carePlan';
  diagnoses: string[];          // NANDA / free text
  goals: string[];
  interventions: string[];
  targetDate?: any;
}

/** ⬅️ NEW Vital Signs assessment */
export interface VitalSigns extends AssessmentBase {
  type: 'vitals';
  measuredAt?: any;        // Date/Timestamp/ISO
  systolic?: number;
  diastolic?: number;
  heartRate?: number;      // bpm
  respiratoryRate?: number;// /min
  temperatureC?: number;   // °C
  spo2?: number;           // %
  painScore?: number;      // 0-10
  position?: string;       // sitting/lying/etc
  device?: string;         // device/source
  note?: string;
}

export type Assessment = SkinWeekly | PressureInjuryWeekly | Braden | ProgressNote | CarePlan | VitalSigns;
