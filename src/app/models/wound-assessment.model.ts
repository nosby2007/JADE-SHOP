export type WoundType =
  | 'Abrasion'|'Abscess'|'Arterial'|'Blister'|'Bruise'|'Burn'|'Cancer Lesion'
  | 'Diabetic'|'Hematoma'|'Hidradenitis Suppurativa'|'Laceration'
  | 'Moisture Associated Skin Damage (MASD)'|'Mole'|'Open Lesion'
  | 'Pressure'|'Pressure - Kennedy Terminal Ulcer'|'Pressure - Medical Device Related Pressure Injury'
  | 'Rash'|'Skin Tear'|'Surgical'|'Venous'|'Other'|'MASD';

export interface WoundAssessment {
  id?: string;
  createdAt: any; // Firebase Timestamp
  createdByUid?: string;
  createdByName?: string;
  describe: {
    type: WoundType;
    stage?: 'Stage 1'|'Stage 2'|'Stage 3'|'Stage 4'|'Deep Tissue Injury'|'Mucosal Membrane'|'Unstageable';
    location: string;
    acquired: 'In-House Acquired'|'Present on Admission';
    ageCategory: string;
    exactDate?: any;
    stagedBy?: 'N/A'|'In-house nursing'|'Home Health'|'Hospice'|'Health Care Provider'|'Wound Care Clinic'|'Other';
  };
  measurements: { area: number; length: number; width: number; depth: number; undermining?: string; tunneling?: string };
  woundBed: {
    epithelial: boolean;
    granulation: { present: boolean; percent?: number };
    slough: { present: boolean; percent?: number };
    eschar: boolean;
    infection: string[];
    other: string[];
    otherNote?: string;
  };
  exudate: { amount: 'None'|'Light'|'Moderate'|'Heavy'; type: 'None'|'Serous'|'Sanguineous/Bloody'|'Serosanguineous'|'Purulent'|'Seropurulent'; odor: 'None'|'Faint'|'Moderate'|'Strong' };
  periwound: {
    edges: 'Attached'|'Non-Attached'|'Rolled Edge (Epibole)'|'Epithelialization';
    surrounding: string[];
    induration: 'None present'|'<2cm'|'2-4 cm <50%'|'2-4 cm >50%'|'>4 cm';
    edema: 'No swelling or edema'|'Non-pitting < 4cm'|'Non-pitting > 4cm'|'Pitting < 4 cm'|'Pitting > 4 cm';
    temperature: 'Cool'|'Normal'|'Warm'|'Hot';
  };
  pain: { cognitivelyImpaired: boolean; score?: number; frequency?: 'None'|'Intermittent'|'At Dressing'|'Continuous'; notes?: string };
  orders: { goalOfCare: 'Healable'|'Slow to Heal'|'Monitor/Manage' };
  treatment: {
    dressingAppearance: 'Intact'|'Missing'|'Dry'|'Saturated'|'Leaking'|'None';
    cleansing: string;
    debridement: string;
    primary: string;
    primaryOther?: string;
    secondary: string;
    secondaryOther?: string;
    modalities: string;
    additionalCare: string[];
  };
  progress: { status: 'New'|'Improving'|'Stable'|'Stalled'|'Deteriorating'|'Monitoring'|'Resolved'; infection: 'None'|'Suspected'|'MD/Provider diagnosed infection'; notes?: string; education?: string };
  notifications?: { practitioner?: string; residentOrRP?: string; dietician?: boolean; therapy?: boolean };
}
