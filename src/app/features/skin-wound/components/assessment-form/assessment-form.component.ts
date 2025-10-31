
import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { WoundAssessment, WoundType } from 'src/app/models/wound-assessment.model';
import firebase from 'firebase/compat/app';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { FilePreviewPipe } from 'src/app/file-preview.pipe';
import { WoundAssessmentService } from 'src/app/service/wound-assessment.service';

const STAGES = ['Stage 1','Stage 2','Stage 3','Stage 4','Deep Tissue Injury','Mucosal Membrane','Unstageable'] as const;
type Stage = typeof STAGES[number];

const STAGED_BY = ['N/A','In-house nursing','Home Health','Hospice','Health Care Provider','Wound Care Clinic','Other'] as const;
type StagedBy = typeof STAGED_BY[number];

@Component({
  selector: 'app-assessment-form',
  templateUrl: './assessment-form.component.html',
  styleUrls: ['./assessment-form.component.scss']
})
export class AssessmentFormComponent implements OnInit {
  stages = STAGES;                 // utilisé par le template
  stagedBy = STAGED_BY; 
  infectionSigns = [
    'Fever','Increased drainage','Increased pain','Malaise',
    'Redness/inflammation','Streaking','Warmth','None'
  ];
  @Input() patientId!: string;

  uploading = false;
  file?: File;

  woundOther = [
    'Bleeding','Bone','Fibrin','Gangrene','Hematoma','Hypergranulated',
    'Intact blister','Islands of epithelium','Pink or red',
    'Ruptured blister','Scab','Sutured','None','Other'
  ];

  surroundingOpts = [
    'Boggy','Callus','Cavern','Cyanosis','Dry/Scaly','Denuded','Dermatitis',
    'Erythema','Erosion','Excoriation','Edema','Fluctuance','Fragile',
    'Fluctuant','Hemosiderin staining','Induration','Maceration','Moist',
    'Non-blanchable erythema','Pain','Peeling/Desquamation','Petechiae',
    'Purple discoloration','Rash','Rubor','Scar','Skin tear','Undermining',
    'Warmth','Dry crust','None'
  ];

  cleansingOpts = [
    'Acetic Acid','Cetrimide','Chlorhexidine','Hydrogen peroxide',
    'Normal Saline','Povidone iodine','Soap & Water','Sodium hypochlorite',
    'Sterile Water','Water','Generic wound cleanser','Other','None'
  ];

  debridementOpts = [
    'Autolytic','Biologic','Enzymatic','Mechanical','Polyacrylate',
    'Sharp','Surgical-outpatient','None'
  ];

  primaryDressings = [
    'Antimicrobial','Antifungal','Biologic','Calcium Alginate','Charcoal',
    'Clear Acrylic','Composite','Film/Membrane','Foam','Hydrocolloid',
    'Hydrogel','Hydrophilic Fiber','Hypertonic','NPWT','Non-Adherent',
    'Pain controlling','Other','No dressing'
  ];

  secondaryDressings = [
    'Composite','Compression wrap','Dry','Film/Membrane','Foam',
    'Hydrocolloid','Silicone','Other','No secondary dressing'
  ];

  modalities = ['Electrical stimulation','Electromagnetic therapy','Ultrasound mist','Other','None'];

  additionalCareOpts = [
    'Offloading/Pressure redistribution','Repositioning schedule',
    'Float heels','Compression therapy','Nutritional support',
    'Glucose control','Incontinence management','Stop smoking',
    'Moisture management','Protect periwound','Limit shear/friction',
    'Pain management','Education done'
  ];
  
  assessmentId?: string;
  types: WoundType[] = ['Pressure','Skin Tear','Diabetic','Venous','Arterial','Surgical','MASD','Rash','Blister','Laceration','Open Lesion','Hematoma','Burn','Abscess','Other'];
 
  amounts = ['None','Light','Moderate','Heavy'];
  exuTypes = ['None','Serous','Sanguineous/Bloody','Serosanguineous','Purulent','Seropurulent'];
  odors = ['None','Faint','Moderate','Strong'];
  edges = ['Attached','Non-Attached','Rolled Edge (Epibole)','Epithelialization'];
  progress = ['New','Improving','Stable','Stalled','Deteriorating','Monitoring','Resolved'];
  goals = ['Healable','Slow to Heal','Monitor/Manage'];
  acquired = ['In-House Acquired','Present on Admission'] as const;
  temperature = ['Cool','Normal','Warm','Hot'] as const;
  edema = ['No swelling or edema','Non-pitting < 4cm','Non-pitting > 4cm','Pitting < 4 cm','Pitting > 4 cm'] as const;
  induration = ['None present','<2cm','2-4 cm <50%','2-4 cm >50%','>4 cm'] as const;
  tunneling = ['None','Mild','Moderate','Severe'] as const;
  undermining = ['None','Mild','Moderate','Severe'] as const;
  dressingAppearance = ['Intact','Missing','Dry','Saturated','Leaking','None'] as const;
  status = ['New','Improving','Stable','Stalled','Deteriorating','Monitoring','Resolved'] as const;
  infection = ['None','Suspected','MD/Provider diagnosed infection'] as const;

  

 form = this.fb.group({
  describe: this.fb.group({
    type: ['Pressure'],              // ← WoundType valide
    stage: [''],                     // string vide ok (transformé en undefined dans payload)
    location: ['', Validators.required],
    acquired: ['In-House Acquired'],
    ageCategory: ['New'],
    exactDate: [null],
    stagedBy: ['In-house nursing']
  }),
  measurements: this.fb.group({
    length: [0],
    width: [0],
    depth: [0],
    area: [{value: 0, disabled: true}],
    undermining: [''],
    tunneling: ['']
  }),
  woundBed: this.fb.group({
    epithelial: [false],
    granulation: this.fb.group({ present: [false], percent: [0] }),
    slough: this.fb.group({ present: [false], percent: [0] }),
    eschar: [false],
    infection: this.fb.control<string[]>([]),   // ← [] pas null
    other: this.fb.control<string[]>([]),
    otherNote: ['']
  }),
  exudate: this.fb.group({
    amount: ['None'],                            // ← literal
    type: ['None'],                              // ← literal
    odor: ['None']                               // ← literal
  }),
  periwound: this.fb.group({
    edges: ['Attached'],                         // ← literal
    surrounding: this.fb.control<string[]>([]),
    induration: ['None present'],
    edema: ['No swelling or edema'],
    temperature: ['Normal']
  }),
  pain: this.fb.group({
    cognitivelyImpaired: [false],
    score: [0],
    frequency: ['None'],
    notes: ['']
  }),
  orders: this.fb.group({ goalOfCare: ['Healable'] }), // ← literal
  treatment: this.fb.group({
    dressingAppearance: ['Intact'],              // ← literal
    cleansing: ['Normal Saline'],
    debridement: ['None'],
    primary: ['Foam'],
    primaryOther: [''],
    secondary: ['Film/Membrane'],
    secondaryOther: [''],
    modalities: ['None'],
    additionalCare: this.fb.control<string[]>([])
  }),
  progress: this.fb.group({
    status: ['New'],                              // ← literal
    infection: ['None'],                          // ← literal
    notes: [''],
    education: ['']
  }),
  notifications: this.fb.group({
    practitioner: [''],
    residentOrRP: [''],
    dietician: [false],
    therapy: [false]
  }),
  photoURL: [''] 
});


  constructor(private fb: FormBuilder, private ar: ActivatedRoute, private svc: WoundAssessmentService, private router: Router) {}

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.file = input.files[0];
    }
  }

  ngOnInit(): void {
    this.patientId = this.ar.snapshot.paramMap.get('id')!;
    this.assessmentId = this.ar.snapshot.paramMap.get('assessmentId') || undefined;

    // auto-calc area
    this.form.get('measurements.length')!.valueChanges.subscribe(_ => this.computeArea());
    this.form.get('measurements.width')!.valueChanges.subscribe(_ => this.computeArea());

    // if edit mode, you could load the document here (optional)
  }

  private computeArea() {
    const L = Number(this.form.get('measurements.length')!.value) || 0;
    const W = Number(this.form.get('measurements.width')!.value) || 0;
    this.form.get('measurements.area')!.setValue(Number((L * W).toFixed(2)), { emitEvent: false });
  }
  // Supprime tous les 'undefined' récursivement (en gardant Timestamps / FieldValue intacts)
private stripUndefined<T>(val: T): T {
  if (Array.isArray(val)) {
    return (val.map(v => this.stripUndefined(v)) as unknown) as T; // cast via unknown
  }
  if (val && typeof val === 'object') {
    // Firestore Timestamp / FieldValue : on ne touche pas
    // Heuristique : si l'objet possède .toDate (Timestamp) ou .isEqual (FieldValue) on garde tel quel
    const anyVal: any = val as any;
    if (typeof anyVal.toDate === 'function' || typeof anyVal.isEqual === 'function') {
      return val;
    }
    const out: any = {};
    for (const [k, v] of Object.entries(anyVal)) {
      if (v !== undefined) out[k] = this.stripUndefined(v as any);
    }
    return out;
  }
  return val;
}

async save() {
  if (this.form.invalid) return;

  const raw = this.form.getRawValue();

  const payload: WoundAssessment = {
    createdAt: firebase.firestore.Timestamp.now(),
    describe: {
      type: raw.describe.type as WoundType,
      stage: this.coerceStage(raw.describe.stage),
      location: this.reqStr(raw.describe.location),
      acquired: raw.describe.acquired as 'In-House Acquired' | 'Present on Admission',
      ageCategory: this.reqStr(raw.describe.ageCategory),
      exactDate: raw.describe.exactDate ?? undefined,
      stagedBy: this.coerceStagedBy(raw.describe.stagedBy),
    },
    measurements: {
      length: Number(raw.measurements.length) || 0,
      width: Number(raw.measurements.width) || 0,
      depth: Number(raw.measurements.depth) || 0,
      area: Number(raw.measurements.area) || 0,
      undermining: raw.measurements.undermining || '',
      tunneling: raw.measurements.tunneling || '',
    },
    woundBed: {
      epithelial: !!raw.woundBed.epithelial,
      granulation: {
        present: !!raw.woundBed.granulation.present,
        percent: raw.woundBed.granulation.percent ?? undefined,
      },
      slough: {
        present: !!raw.woundBed.slough.present,
        percent: raw.woundBed.slough.percent ?? undefined,
      },
      eschar: !!raw.woundBed.eschar,
      infection: raw.woundBed.infection ?? [],
      other: raw.woundBed.other ?? [],
      otherNote: raw.woundBed.otherNote || undefined,
    },
    exudate: {
      amount: raw.exudate.amount as 'None'|'Light'|'Moderate'|'Heavy',
      type: raw.exudate.type as 'None'|'Serous'|'Sanguineous/Bloody'|'Serosanguineous'|'Purulent'|'Seropurulent',
      odor: raw.exudate.odor as 'None'|'Faint'|'Moderate'|'Strong',
    },
    periwound: {
      edges: raw.periwound.edges as 'Attached'|'Non-Attached'|'Rolled Edge (Epibole)'|'Epithelialization',
      surrounding: raw.periwound.surrounding ?? [],
      induration: raw.periwound.induration as 'None present'|'<2cm'|'2-4 cm <50%'|'2-4 cm >50%'|'>4 cm',
      edema: raw.periwound.edema as 'No swelling or edema'|'Non-pitting < 4cm'|'Non-pitting > 4cm'|'Pitting < 4 cm'|'Pitting > 4 cm',
      temperature: raw.periwound.temperature as 'Cool'|'Normal'|'Warm'|'Hot',
    },
    pain: {
      cognitivelyImpaired: !!raw.pain.cognitivelyImpaired,
      score: raw.pain.score ?? undefined,
      frequency: (raw.pain.frequency || 'None') as 'None'|'Intermittent'|'At Dressing'|'Continuous',
      notes: raw.pain.notes || undefined,
    },
    orders: { goalOfCare: raw.orders.goalOfCare as 'Healable'|'Slow to Heal'|'Monitor/Manage' },
    treatment: {
      dressingAppearance: raw.treatment.dressingAppearance as 'Intact'|'Missing'|'Dry'|'Saturated'|'Leaking'|'None',
      cleansing: raw.treatment.cleansing || 'Normal Saline',
      debridement: raw.treatment.debridement || 'None',
      primary: raw.treatment.primary || 'Foam',
      primaryOther: raw.treatment.primaryOther || undefined,
      secondary: raw.treatment.secondary || 'Film/Membrane',
      secondaryOther: raw.treatment.secondaryOther || undefined,
      modalities: raw.treatment.modalities || 'None',
      additionalCare: raw.treatment.additionalCare ?? [],
    },
    progress: {
      status: raw.progress.status as 'New'|'Improving'|'Stable'|'Stalled'|'Deteriorating'|'Monitoring'|'Resolved',
      infection: raw.progress.infection as 'None'|'Suspected'|'MD/Provider diagnosed infection',
      notes: raw.progress.notes || undefined,
      education: raw.progress.education || undefined,
    },
    notifications: {
      practitioner: raw.notifications.practitioner || undefined,
      residentOrRP: raw.notifications.residentOrRP || undefined,
      dietician: !!raw.notifications.dietician,
      therapy: !!raw.notifications.therapy,
    },
    // photoURL ajouté plus bas si uploadé
  };

  // 1) upload éventuel
  try {
    if (this.file) {
      this.uploading = true;
      const url = await this.svc.uploadPhoto(this.patientId, this.file);
      (payload as any).photoURL = url;
      await this.svc.createMedia(this.patientId, {
        url,
        kind: 'wound-photo',
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
    }
  } finally {
    this.uploading = false;
  }

  // 2) nettoyage et create
  const payloadClean = this.stripUndefined(payload);
  await this.svc.create(this.patientId, payloadClean);

  // 3) redirect
  this.router.navigate(['/patients', this.patientId, 'wounds']);
}




  // Export PDF (simple capture du formulaire)
  async exportPDF() {
    const target = document.getElementById('woundFormCard');
    if (!target) return;
    const canvas = await html2canvas(target, { scale: 2 });
    const img = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = (canvas.height * pageWidth) / canvas.width;
    pdf.addImage(img, 'PNG', 0, 0, pageWidth, pageHeight);
    pdf.save('wound-assessment.pdf');
  }

  private coerceStage(v: unknown): Stage | undefined {
    return typeof v === 'string' && (STAGES as readonly string[]).includes(v) ? (v as Stage) : undefined;
  }
  
  private coerceStagedBy(v: unknown): StagedBy | undefined {
    return typeof v === 'string' && (STAGED_BY as readonly string[]).includes(v) ? (v as StagedBy) : undefined;
  }
  
  private reqStr(v: unknown): string {
    return (typeof v === 'string' ? v : '');
  }
  
  
}
