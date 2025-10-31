import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import firebase from 'firebase/compat/app';

import { AssessmentsService } from '../../service/assessments.service';
import { AssessmentType, Assessment } from '../../models/assessment.model';

type AnyRec = Record<string, any>;
type LocalType = AssessmentType | 'vitalSigns' | 'antibiotic';

@Component({
  selector: 'app-add-assessment-dialog',
  templateUrl: './add-assessment-dialog.component.html',
  styleUrls: ['./add-assessment-dialog.component.scss']
})
export class AddAssessmentDialogComponent implements OnInit {
  saving = false;
  hidePw = true;

  type: LocalType = (this.data.type as unknown as LocalType);

  // E-SIGNATURE
  esignFG: FormGroup = this.fb.group({
    role: ['RN', Validators.required],
    signerName: [''],
    signerEmail: ['', [Validators.required, Validators.email]],
    signerPassword: ['', Validators.required],
  });

  // Vital signs
  vitalsFG: FormGroup = this.fb.group({
    measuredAt: [new Date(), Validators.required],
    systolic: [null],
    diastolic: [null],
    heartRate: [null],
    respiratoryRate: [null],
    temperatureC: [null],
    spo2: [null],
    painScore: [null],
    position: [''],
    device: [''],
    note: ['']
  });

  // Antibiotic assessment (English fields)
  antibioticFG: FormGroup = this.fb.group({
    // Core
    medication: [''],
    prescriber: [''],
    indication: [''],
    clinicalSymptoms: [''],

    // Symptoms checklist
    abdominalCramps: [false],
    bpDecrease: [false],
    diarrhea: [false],
    dizziness: [false],
    facialSwelling: [false],
    fever: [false],
    hives: [false],
    itchingSkin: [false],
    itchyWateryEyes: [false],
    lossOfAppetite: [false],
    lossOfConsciousness: [false],
    nausea: [false],
    weakRapidPulse: [false],
    runnyNose: [false],
    seizure: [false],
    shortnessOfBreath: [false],
    skinRash: [false],
    softStools: [false],
    stomachDistress: [false],
    swellingEdema: [false],
    tighteningAirway: [false],
    troubleBreathing: [false],
    vomiting: [false],
    wheezing: [false],
    yeastInfectionVaginal: [false],
    yeastInfectionOral: [false],
    otherSymptom: [false],
    noneSymptoms: [false],

    // Physical / vitals snapshot
    temperatureC: [null],
    respiratoryRate: [null],
    heartRate: [null],
    bloodPressure: [''],

    infectionSymptoms: [''],
    activityLevel: [''],
    meals: [''],
    fluids: [''],

    // Diagnostic orders
    testsLab: [false],
    radiology: [false],
    otherDiagnostics: [false],

    // Transition to PO
    providerName: [''],
    providerPhone: [''],
    adverseReactions: [false],
    currentStatus: [false],
    labResults: [false],
    microbiologyResults: [false],
    radiologyResults: [false],
    otherInfo: [false],
    antibioticReview: ['no'], // yes|no
    providerDetermination: ['continueTherapy'], // enum
    treatmentLength: ['5days'], // '5days'|'10days'|'14days'|'21days'|'other'

    // New order
    newMedicationName: [''],
    dosage: [''],
    route: [''],
    frequency: [''],

    // Notes + date
    notes: [''],
    date: [new Date()]
  });

  // Generic form (incl. Braden)
  form: FormGroup = this.fb.group({
    // skinWeekly
    findings: [''],

    // pressureInjuryWeekly
    stage: ['2'],
    location: [''],
    lengthCm: [null],
    widthCm: [null],
    depthCm: [null],
    exudate: ['none'],
    odor: ['none'],
    dressing: [''],
    piNotes: [''],

    // braden (radios + required, with date)
    sensory: [null, Validators.required],
    moisture: [null, Validators.required],
    activity: [null, Validators.required],
    mobility: [null, Validators.required],
    nutrition: [null, Validators.required],
    friction: [null, Validators.required],
    bradenDate: [new Date(), Validators.required],

    // progressNote
    authorRole: ['RN'],
    note: [''],
    visitDate: [new Date()],

    // carePlan
    diagnoses: [''],
    goals: [''],
    interventions: [''],
    targetDate: [null],
  });

  // Braden options (ENGLISH)
  sensoryOptions = [
    { value: 1, label: '1: Completely limited' },
    { value: 2, label: '2: Very limited' },
    { value: 3, label: '3: Slightly limited' },
    { value: 4, label: '4: No limitation' }
  ];
  moistureOptions = [
    { value: 1, label: '1: Constantly moist' },
    { value: 2, label: '2: Very moist' },
    { value: 3, label: '3: Occasionally moist' },
    { value: 4, label: '4: Rarely moist' }
  ];
  activityOptions = [
    { value: 1, label: '1: Bedfast' },
    { value: 2, label: '2: Chairfast' },
    { value: 3, label: '3: Walks occasionally' },
    { value: 4, label: '4: Walks frequently' }
  ];
  mobilityOptions = [
    { value: 1, label: '1: Completely immobile' },
    { value: 2, label: '2: Very limited' },
    { value: 3, label: '3: Slightly limited' },
    { value: 4, label: '4: No limitation' }
  ];
  nutritionOptions = [
    { value: 1, label: '1: Very poor' },
    { value: 2, label: '2: Probably inadequate' },
    { value: 3, label: '3: Adequate' },
    { value: 4, label: '4: Excellent' }
  ];
  frictionOptions = [
    { value: 1, label: '1: Problem' },
    { value: 2, label: '2: Potential problem' },
    { value: 3, label: '3: No apparent problem' }
  ];

  totalScore = 0;

  private labelMap: Record<string, string> = {
    vitalSigns: 'Vital Signs',
    skinWeekly: 'Skin (Weekly)',
    pressureInjuryWeekly: 'Pressure Injury (Weekly)',
    braden: 'Braden Scale',
    progressNote: 'Progress Note',
    carePlan: 'Care Plan',
    antibiotic: 'Antibiotic Assessment'
  };
  get typeLabel(): string { return this.labelMap[this.type as string] ?? 'Assessment'; }

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { patientId: string; type: AssessmentType },
    private fb: FormBuilder,
    private svc: AssessmentsService,
    private afAuth: AngularFireAuth,
    private ref: MatDialogRef<AddAssessmentDialogComponent>
  ) {
    this.afAuth.currentUser.then(u => {
      if (u?.email) this.esignFG.patchValue({ signerEmail: u.email });
      if (u?.displayName) this.esignFG.patchValue({ signerName: u.displayName });
    });
  }

  ngOnInit(): void {
    this.form.valueChanges.subscribe(() => {
      if ((this.type as string) === 'braden') this.calculateBradenTotal();
    });
  }

  private toNum(v: unknown): number {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  }

  private calculateBradenTotal(): void {
    const v = this.form.getRawValue();
    this.totalScore =
      this.toNum(v['sensory']) +
      this.toNum(v['moisture']) +
      this.toNum(v['activity']) +
      this.toNum(v['mobility']) +
      this.toNum(v['nutrition']) +
      this.toNum(v['friction']);
  }

  // English risk text for UI
  get bradenRiskText(): string {
    const s = this.totalScore;
    if (s <= 9)  return 'Very high risk';
    if (s <= 12) return 'High risk';
    if (s <= 14) return 'Moderate risk';
    if (s <= 18) return 'At risk';
    return 'Minimal / no risk';
  }

  get bradenRiskClass(): 'vh' | 'h' | 'm' | 'r' | 'n' {
    const s = this.totalScore;
    if (s <= 9)  return 'vh';
    if (s <= 12) return 'h';
    if (s <= 14) return 'm';
    if (s <= 18) return 'r';
    return 'n';
  }

  async save() {
    if (this.esignFG.invalid) return;

    const isVitals = (this.type as string) === 'vitalSigns';
    const isBraden = (this.type as string) === 'braden';
    const isAntibiotic = (this.type as string) === 'antibiotic';

    if (isVitals && this.vitalsFG.invalid) return;
    if (isBraden) this.calculateBradenTotal();

    this.saving = true;
    try {
      const u = await this.afAuth.currentUser;
      if (!u) throw new Error('Not authenticated.');

      const es = this.esignFG.getRawValue() as AnyRec;
      const email = (es['signerEmail'] ?? '').toString().trim();
      const pw    = (es['signerPassword'] ?? '').toString();

      if (!email || !pw) throw new Error('Email and password are required.');
      if ((u.email ?? '') !== email) throw new Error('Signed-in user and signer email differ.');

      const cred = firebase.auth.EmailAuthProvider.credential(email, pw);
      await (u as firebase.User).reauthenticateWithCredential(cred);

      const payload: AnyRec = { type: (this.type as unknown as AssessmentType) };

      if (isVitals) {
        const vf = this.vitalsFG.getRawValue() as AnyRec;
        Object.assign(payload, {
          measuredAt: vf['measuredAt'] || new Date(),
          systolic: vf['systolic'],
          diastolic: vf['diastolic'],
          heartRate: vf['heartRate'],
          respiratoryRate: vf['respiratoryRate'],
          temperatureC: vf['temperatureC'],
          spo2: vf['spo2'],
          painScore: vf['painScore'],
          position: vf['position'],
          device: vf['device'],
          note: vf['note']?.trim() || null
        });
      } else if (isAntibiotic) {
        const a = this.antibioticFG.getRawValue() as AnyRec;
        Object.assign(payload, {
          antibiotic: {
            core: {
              medication: a['medication'],
              prescriber: a['prescriber'],
              indication: a['indication'],
              clinicalSymptoms: a['clinicalSymptoms'],
            },
            symptomsChecklist: {
              abdominalCramps: a['abdominalCramps'],
              bpDecrease: a['bpDecrease'],
              diarrhea: a['diarrhea'],
              dizziness: a['dizziness'],
              facialSwelling: a['facialSwelling'],
              fever: a['fever'],
              hives: a['hives'],
              itchingSkin: a['itchingSkin'],
              itchyWateryEyes: a['itchyWateryEyes'],
              lossOfAppetite: a['lossOfAppetite'],
              lossOfConsciousness: a['lossOfConsciousness'],
              nausea: a['nausea'],
              weakRapidPulse: a['weakRapidPulse'],
              runnyNose: a['runnyNose'],
              seizure: a['seizure'],
              shortnessOfBreath: a['shortnessOfBreath'],
              skinRash: a['skinRash'],
              softStools: a['softStools'],
              stomachDistress: a['stomachDistress'],
              swellingEdema: a['swellingEdema'],
              tighteningAirway: a['tighteningAirway'],
              troubleBreathing: a['troubleBreathing'],
              vomiting: a['vomiting'],
              wheezing: a['wheezing'],
              yeastInfectionVaginal: a['yeastInfectionVaginal'],
              yeastInfectionOral: a['yeastInfectionOral'],
              otherSymptom: a['otherSymptom'],
              noneSymptoms: a['noneSymptoms'],
            },
            physical: {
              temperatureC: a['temperatureC'],
              respiratoryRate: a['respiratoryRate'],
              heartRate: a['heartRate'],
              bloodPressure: a['bloodPressure'],
              infectionSymptoms: a['infectionSymptoms'],
              activityLevel: a['activityLevel'],
              meals: a['meals'],
              fluids: a['fluids'],
            },
            diagnostics: {
              testsLab: a['testsLab'],
              radiology: a['radiology'],
              otherDiagnostics: a['otherDiagnostics'],
            },
            transitionPO: {
              providerName: a['providerName'],
              providerPhone: a['providerPhone'],
              notifiedInfo: {
                adverseReactions: a['adverseReactions'],
                currentStatus: a['currentStatus'],
                labResults: a['labResults'],
                microbiologyResults: a['microbiologyResults'],
                radiologyResults: a['radiologyResults'],
                otherInfo: a['otherInfo'],
              },
              antibioticReview: a['antibioticReview'],
              providerDetermination: a['providerDetermination'],
              treatmentLength: a['treatmentLength'],
            },
            newOrder: {
              medicationName: a['newMedicationName'],
              dosage: a['dosage'],
              route: a['route'],
              frequency: a['frequency'],
            },
            notes: a['notes'],
            date: a['date'] || new Date()
          },

          // convenience for table summary
          medication: a['medication'] || a['newMedicationName'] || null,
          prescriber: a['prescriber'] || null,
          indication: a['indication'] || null
        });
      } else {
        const v = this.form.getRawValue() as AnyRec;
        switch (this.type as AssessmentType) {
          case 'skinWeekly':
            payload['findings'] = (v['findings'] || '').trim();
            break;

          case 'pressureInjuryWeekly':
            payload['stage']    = v['stage'];
            payload['location'] = v['location'];
            payload['size']     = {
              lengthCm: v['lengthCm'] ?? null,
              widthCm:  v['widthCm']  ?? null,
              depthCm:  v['depthCm']  ?? null,
            };
            payload['exudate']  = v['exudate'];
            payload['odor']     = v['odor'];
            payload['dressing'] = v['dressing'];
            payload['notes']    = v['piNotes']?.trim() || null;
            break;

          case 'braden': {
            const s = this.totalScore;
            const risk = s>=19 ? 'none'
                      : s>=15 ? 'mild'
                      : s>=13 ? 'moderate'
                      : s>=10 ? 'high'
                      : 'very high';
            Object.assign(payload, {
              sensory: v['sensory'],
              moisture: v['moisture'],
              activity: v['activity'],
              mobility: v['mobility'],
              nutrition: v['nutrition'],
              friction: v['friction'],
              score: s,
              risk,
              assessedAt: (() => {
                const d = v['bradenDate'];
                if (!d) return new Date();
                if (d instanceof Date) return d;
                const parsed = new Date(d);
                return isNaN(+parsed) ? new Date() : parsed;
              })()
            });
            break;
          }

          case 'progressNote':
            payload['authorRole'] = v['authorRole'] || 'RN';
            payload['note']       = v['note']?.trim();
            payload['visitDate']  = v['visitDate'] || new Date();
            break;

          case 'carePlan':
            payload['diagnoses']     = (v['diagnoses'] || '').split('\n').map((x:string)=>x.trim()).filter(Boolean);
            payload['goals']         = (v['goals'] || '').split('\n').map((x:string)=>x.trim()).filter(Boolean);
            payload['interventions'] = (v['interventions'] || '').split('\n').map((x:string)=>x.trim()).filter(Boolean);
            payload['targetDate']    = v['targetDate'] || null;
            break;
        }
      }

      const esign = {
        signerUid: u.uid,
        signerEmail: u.email ?? null,
        signerName: (this.esignFG.value['signerName'] as string) || u.displayName || null,
        role: (this.esignFG.value['role'] as 'RN'|'NP'|'MD') ?? 'RN'
      };

      await this.svc.add(
        this.data.patientId,
        payload as Partial<Assessment> & { type: AssessmentType },
        esign as any
      );

      this.ref.close(true);
    } finally {
      this.saving = false;
    }
  }
}
