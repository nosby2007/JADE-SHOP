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

export interface NurseAdmissionEvaluation {
  id?: string;
  facilityId?: string;
  resident: {
    id: string;
    name: string;
    room: string;
    dob: string;            // ISO
    physician?: string;
    initialAdmissionDate?: string; // ISO
    admissionDate?: string;        // ISO
  };

  // A. Demographics / Orientation
  demographics: {
    admissionSource:
      | 'Community' | 'Another nursing home' | 'Acute hospital' | 'Psych hospital'
      | 'Inpatient rehab' | 'ID/DD facility' | 'Hospice' | 'LTCH' | 'Other';
    admissionReason?: string;
    vaccines?: {
      influenzaDate?: string; // ISO
      pneumovaxDate?: string; // ISO
      covid?: { lastDoseDate?: string; name?: string };
    };
    codeStatus?: string;
    codeStatusMatchesWishes?: 'yes' | 'needs_change' | 'unable_to_validate';
    tobaccoUse?: 'yes' | 'no' | 'unknown';
    allergies?: string[];
    comments?: string;
  };

  // B. Physical Function & Safety (ADLs)
  adl: {
    sitToStand: string;
    sitToLying: string;
    lyingToSitting: string;
    bedChairTransfer: string;
    toiletHygiene: string;
    eating: string;
    toiletTransfer: string;
    oralHygiene: string;
    walk10to50ft: string;
    adaptiveEquipment: string[];
    rom: 'Full' | 'Limited';
    contractures: boolean;
    transferAssistNeeded: boolean;
    hotLiquidsRisk: string[]; // flags checked
    notes?: string;
  };

  // C. Skin
  skin: {
    condition: 'Normal' | 'Pale' | 'Cyanotic' | 'Jaundiced' | 'Dusky';
    temperatureMoisture: 'Warm' | 'Cool' | 'Cold' | 'Dry' | 'Diaphoretic';
    turgor: 'Normal' | 'Tenting';
    integrity: {
      pressureUlcerStage1Plus: boolean;
      venousArterialUlcerCount?: number;
      footInfection?: boolean;
      diabeticFootUlcer?: boolean;
      otherFootLesions?: boolean;
      enhancedBarrierPrecautions?: boolean;
      otherOpenLesions?: boolean;
      surgicalWound?: boolean;
      burns?: boolean;
      skinTears?: boolean;
      masd?: boolean;
    };
    comments?: string;
  };

  // D. Oral / Nutrition
  oralNutrition: {
    ownTeeth?: boolean;
    denturesBroken?: boolean;
    abnormalTissue?: boolean;
    brokenTeeth?: boolean;
    gumIssues?: boolean;
    mouthPain?: boolean;
    unableToExamine?: boolean;
    swallowDifficulty?: boolean;
    coughChokeWithMeals?: boolean;
    feeding: {
      parenteralIV?: boolean;
      centralLineEBP?: boolean;
      npo?: boolean;
      tubeFeeding?: boolean;
      tubeEBP?: boolean;
      recentWeightLoss?: boolean;
      recentWeightGain?: boolean;
      adaptiveEquipment?: string[]; // e.g., built-up spoon, plate guard, clothing protector, other
      otherAdaptive?: string;
      mechanicallyAlteredDiet?: boolean;
      liquidConsistency?: 'Thin' | 'Nectar' | 'Honey' | 'Pudding';
    };
  };

  // E. Cognition / Mood / Behavior
  cognitionMoodBehavior: {
    loc: 'Alert & Oriented' | 'Lethargic' | 'Alert & Confused' | 'Coma';
    orientedTo?: Array<'Person'|'Place'|'Time'|'Date'>;
    speech: 'Verbally Appropriate'|'Verbally Inappropriate'|'Incomprehensible'|'Aphasic';
    memoryProblem?: 'yes'|'no'|'unknown';
    memoryComments?: string;
    disposition?: Array<'Pleasant'|'Content'|'Fearful'|'Angry'|'Sad'|'Withdrawn'|'History of Depression'|'Anxious'>;
    behaviorHistory?: {
      hasHistory: boolean;
      hallucinations?: boolean;
      delusions?: boolean;
      wanders?: 'yes'|'no'|'unknown';
      notes?: string;
    };
  };

  // F. Respiratory
  respiratory: {
    appearance: Array<'Normal'|'Labored'|'Apneic'|'Irregular'|'Tachypneic'>;
    issues?: Array<'Nasal Flaring'|'Pursed Lips'|'Use of Accessory Muscles'|'SOB with exertion'|'SOB at rest'|'SOB lying flat'>;
    coughType?: 'None'|'Occasional'|'Persistent'|'Night Only'|'With Exertion';
    sputum?: 'None'|'Clear'|'Frothy White'|'Bloody Red'|'Blood Stained/Streaked'|'Yellow/Green'|'Green/Purulent'|'Black'|'Old Blood Speckled';
    breathSounds?: 'Normal'|'Adventitious';
    supplementalO2Prior?: boolean;
    tracheostomy?: boolean;
    treatments?: Array<'Nebulizer'|'CPAP'|'BiPAP'|'Suctioning'|'Chest Tube'|'Ventilator prior to admission'>;
    o2Sats?: number; // %
    o2Method?: string;
    o2DateTime?: string;
    comments?: string;
  };

  // G. Cardiovascular
  cardiovascular: {
    apicalPulse: 'Regular'|'Irregular';
    radialPulse: 'Palpable'|'Normal'|'Bounding'|'Weak/Thready'|'Irregular';
    pedalPulses: { left: 'Present'|'Absent'|'N/A'; right: 'Present'|'Absent'|'N/A' };
    pacemaker?: boolean;
    vadOrExternalDefib?: boolean;
    edema?: boolean;
    comments?: string;
  };

  // H. GI
  gi: {
    bowelSounds: 'Present'|'Absent'|'Unable to Assess';
    lastBM?: string;
    constipationPattern?: 'Normal formed'|'Occasional laxative/enema'|'Needs laxative/enema 2+ times/week';
    bowelContinence?: 'Always continent'|'Occasionally incontinent'|'Frequently incontinent'|'Always incontinent'|'Not rated'|'Not assessed';
    ostomy?: boolean;
  };

  // I. GU
  gu: {
    urinaryContinence?: 'Always continent'|'Occasionally incontinent'|'Frequently incontinent'|'Always incontinent'|'Not rated'|'Not assessed';
    indwellingCatheter?: boolean;
    intermittentCath?: boolean;
    externalCath?: boolean;
    assistive: Array<'Raised Toilet Seat'|'Urinal'|'Bedpan'|'Bedside Commode'|'Pads on Bed'|'Briefs'|'Pull Ups'|'None'>;
    recentUTI?: boolean;
    comments?: string;
  };

  // J. Communication
  communication: {
    visionLevel?: 'Adequate'|'Impaired'|'Moderately impaired'|'Highly impaired'|'Severely impaired'|'Not assessed';
    glasses?: boolean; magnifier?: boolean; contacts?: boolean; visionComments?: string;
    hearingLevel?: 'Adequate'|'Minimal difficulty'|'Moderate difficulty'|'Highly impaired'|'Not assessed';
    hearingAid?: 'Left'|'Right'|'Both'|'None';
    speech?: 'Clear'|'Unclear'|'Aphasic';
    primaryLanguage?: string;
    interpreterRequired?: boolean;
    utilizes?: Array<'Sign Language'|'Braille'|'Language Board'|'Language Line'|'None'>;
  };

  // K. Meds / Infections
  medicationGroups: Array<'Antipsychotic'|'Antianxiety'|'Antidepressant'|'Hypnotic'|'Antibiotic'>;
  offLabelPsychotropicSubstitute?: boolean;
  reglanOrder?: boolean;

  keyInfections: Array<
    'Pan-resistant organisms'|
    'CP-CRE'|'CP-Pseudomonas'|'CP-Acinetobacter baumannii'|'Candida auris'|
    'MRSA'|'ESBL'|'VRE'|'MDR Pseudomonas'|'DR Streptococcus pneumoniae'
  >;

  // L. Discharge & Narrative
  dischargePlan?: 'Short Term Rehab -> Home'|'Permanent Placement'|'TBD';
  narrative?: string;

  meta: {
    createdByUid: string;
    createdAt: number;
    updatedAt?: number;
    signedBy?: string;
    signedAt?: number;
    status: 'draft'|'final';
  };
}

