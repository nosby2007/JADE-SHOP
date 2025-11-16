// src/app/nurse/pages/nurse-assessment/add-assessment-dialog.component.ts
import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, Validators, FormGroup, FormArray } from '@angular/forms';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import firebase from 'firebase/compat/app';

import { AssessmentsService } from '../../service/assessments.service';
import { AssessmentType, Assessment } from '../../models/assessment.model';

type AnyRec = Record<string, any>;
type LocalType = AssessmentType | 'vitalSigns' | 'antibiotic' | 'nurseAdmission';

@Component({
  selector: 'app-add-assessment-dialog',
  templateUrl: './add-assessment-dialog.component.html',
  styleUrls: ['./add-assessment-dialog.component.scss']
})
export class AddAssessmentDialogComponent implements OnInit {
  saving = false;
  hidePw = true;

  private labelMap: Record<string, string> = {
    vitalSigns: 'Vital Signs',
    skinWeekly: 'Skin (Weekly)',
    pressureInjuryWeekly: 'Pressure Injury (Weekly)',
    braden: 'Braden Scale',
    progressNote: 'Progress Note',
    carePlan: 'Care Plan',
    antibiotic: 'Antibiotic Assessment',
    nurseAdmission: 'Nurse Admission Evaluation'
  };

  type!: LocalType; // set in ctor

  /** ----------------- Weekly Skin (V7-style) ----------------- */
  skinConditions = [
    { key: 'intact', label: 'Skin Intact' },
    { key: 'dry', label: 'Dry' },
    { key: 'rash', label: 'Rash' },
    { key: 'plaques', label: 'Plaques' },
    { key: 'callouses', label: 'Callouses' },
    { key: 'redness', label: 'Redness' },
    { key: 'skinTears', label: 'Skin Tears' },
    { key: 'blisters', label: 'Blisters' },
    { key: 'openAreas', label: 'Open areas, not skin tears' },
    { key: 'other', label: 'Other (specify below)' }
  ];

  bodySites = [
    'Scalp', 'Forehead', 'Face', 'Nose', 'Mouth/Lips', 'Chin',
    'Neck (Anterior)', 'Clavicle', 'Sternum/Chest', 'Breast (L/R)',
    'Rib cage (Ant.)', 'Abdomen (RUQ)', 'Abdomen (LUQ)', 'Abdomen (RLQ)', 'Abdomen (LLQ)',
    'Umbilicus', 'Groin (R)', 'Groin (L)', 'Mons pubis',
    'Shoulder (R, Ant.)', 'Shoulder (L, Ant.)', 'Upper arm (R, Ant.)', 'Upper arm (L, Ant.)',
    'Elbow (R, Ant.)', 'Elbow (L, Ant.)', 'Forearm (R, Ant.)', 'Forearm (L, Ant.)',
    'Wrist (R, Ant.)', 'Wrist (L, Ant.)', 'Hand (R, Dorsum/Palmar)', 'Hand (L, Dorsum/Palmar)',
    'Hip (R, Ant.)', 'Hip (L, Ant.)', 'Thigh (R, Ant.)', 'Thigh (L, Ant.)',
    'Knee (R, Ant.)', 'Knee (L, Ant.)', 'Shin (R/Ant.)', 'Shin (L/Ant.)',
    'Ankle (R, Ant.)', 'Ankle (L, Ant.)', 'Foot (R, Dorsum/Plantar)', 'Foot (L, Dorsum/Plantar)',
    'Toes (R)', 'Toes (L)',
    'Occiput', 'Neck (Posterior)', 'Scapula (R)', 'Scapula (L)', 'Thoracic back',
    'Lumbar back', 'Sacrum', 'Coccyx', 'Buttock (R)', 'Buttock (L)',
    'Hip (R, Post.)', 'Hip (L, Post.)', 'Thigh (R, Post.)', 'Thigh (L, Post.)',
    'Knee (R, Post.)', 'Knee (L, Post.)', 'Calf (R)', 'Calf (L)',
    'Ankle (R, Post.)', 'Ankle (L, Post.)', 'Heel (R)', 'Heel (L)',
    'Other (specify)'
  ];

  skinWeeklyFG: FormGroup = this.fb.group({
    effectiveDate: [new Date(), Validators.required],
    cond_intact: [false], cond_dry: [false], cond_rash: [false], cond_plaques: [false],
    cond_callouses: [false], cond_redness: [false], cond_skinTears: [false], cond_blisters: [false],
    cond_openAreas: [false], cond_other: [false], cond_otherText: [''],
    openAreasNew: ['no'],
    sites: this.fb.array([
      this.fb.group({ site: [''], description: [''] }),
      this.fb.group({ site: [''], description: [''] }),
      this.fb.group({ site: [''], description: [''] })
    ]),
    edema: ['no'],
    comments: ['']
  });

  get sitesFA(): FormArray { return this.skinWeeklyFG.get('sites') as FormArray; }
  addSiteRow(): void { this.sitesFA.push(this.fb.group({ site: [''], description: [''] })); }
  removeSiteRow(i: number): void { if (this.sitesFA.length > 1) this.sitesFA.removeAt(i); }

  /** E-SIGNATURE */
  esignFG: FormGroup = this.fb.group({
    role: ['RN', Validators.required],
    signerName: [''],
    signerEmail: ['', [Validators.required, Validators.email]],
    signerPassword: ['', Validators.required],
  });

  /** Vital signs */
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

  /** Antibiotic assessment */
  antibioticFG: FormGroup = this.fb.group({
    medication: [''],
    prescriber: [''],
    indication: [''],
    clinicalSymptoms: [''],
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
    temperatureC: [null],
    respiratoryRate: [null],
    heartRate: [null],
    bloodPressure: [''],
    infectionSymptoms: [''],
    activityLevel: [''],
    meals: [''],
    fluids: [''],
    testsLab: [false],
    radiology: [false],
    otherDiagnostics: [false],
    providerName: [''],
    providerPhone: [''],
    adverseReactions: [false],
    currentStatus: [false],
    labResults: [false],
    microbiologyResults: [false],
    radiologyResults: [false],
    otherInfo: [false],
    antibioticReview: ['no'],
    providerDetermination: ['continueTherapy'],
    treatmentLength: ['5days'],
    newMedicationName: [''],
    dosage: [''],
    route: [''],
    frequency: [''],
    notes: [''],
    date: [new Date()]
  });

  /** Generic form */
  form: FormGroup = this.fb.group({
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
    // braden
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

  /** Nurse Admission */
  nurseAdmissionFG: FormGroup = this.fb.group({
    residentName: [''],
    room: [''],
    dob: [''],
    physician: [''],
    admissionDate: [new Date()],
    admissionSource: [''],
    admissionReason: [''],
    codeStatus: [''],
    tobaccoUse: ['unknown'],
    allergies: [''],
    adl_sitToStand: ['Independent'],
    adl_bedChairTransfer: ['Independent'],
    adl_eating: ['Independent'],
    adl_toiletHygiene: ['Independent'],
    adl_walk: ['Independent'],
    skin_condition: ['Normal'],
    skin_turgor: ['Normal'],
    skin_integrity_pressureUlcer: [false],
    skin_integrity_skinTears: [false],
    skin_integrity_surgicalWound: [false],
    skin_comments: [''],
    oral_ownTeeth: [true],
    oral_mouthPain: [false],
    nutrition_mechAltered: [false],
    nutrition_liquidConsistency: ['Thin'],
    cog_loc: ['Alert & Oriented'],
    cog_speech: ['Verbally Appropriate'],
    cog_disposition: [[]],
    resp_appearance: ['Normal'],
    resp_cough: ['None'],
    resp_sputum: ['None'],
    resp_o2Sats: [null],
    resp_o2Method: [''],
    cv_apical: ['Regular'],
    cv_radial: ['Normal'],
    cv_pedalLeft: ['Present'],
    cv_pedalRight: ['Present'],
    cv_edema: [false],
    gi_bowelSounds: ['Present'],
    gi_lastBM: [''],
    gu_urinaryContinence: ['Always continent'],
    gu_catheter: [false],
    gu_recentUTI: [false],
    comm_vision: ['Adequate'],
    comm_hearing: ['Adequate'],
    comm_primaryLanguage: ['English'],
    comm_interpreterNeeded: [false],
    meds_groups: [[]],
    infections_key: [[]],
    dischargePlan: ['TBD'],
    narrative: ['']
  });

  // Braden options
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
    this.type = (this.data?.type as unknown as LocalType) ?? 'braden';
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

  async save(): Promise<void> {
    if (this.esignFG.invalid) return;

    const asType = (this.type as string);
    const isVitals = asType === 'vitalSigns';
    const isBraden = asType === 'braden';

    if (isVitals && this.vitalsFG.invalid) return;
    if (isBraden) this.calculateBradenTotal();

    this.saving = true;
    try {
      const u = await this.afAuth.currentUser;
      if (!u) throw new Error('Not authenticated.');

      // re-auth for e-sign
      const es = this.esignFG.getRawValue() as AnyRec;
      const email = (es['signerEmail'] ?? '').toString().trim();
      const pw    = (es['signerPassword'] ?? '').toString();
      if (!email || !pw) throw new Error('Email and password are required.');
      if ((u.email ?? '') !== email) throw new Error('Signed-in user and signer email differ.');
      const cred = firebase.auth.EmailAuthProvider.credential(email, pw);
      await (u as firebase.User).reauthenticateWithCredential(cred);

      const payload: AnyRec = { type: (this.type as unknown as AssessmentType), createdAt: new Date() };

      switch (asType) {
        case 'vitalSigns': {
          Object.assign(payload, this.vitalsFG.getRawValue());
          break;
        }
        case 'skinWeekly': {
          const f = this.skinWeeklyFG.getRawValue() as AnyRec;
          const conditions = {
            intact: !!f['cond_intact'],
            dry: !!f['cond_dry'],
            rash: !!f['cond_rash'],
            plaques: !!f['cond_plaques'],
            callouses: !!f['cond_callouses'],
            redness: !!f['cond_redness'],
            skinTears: !!f['cond_skinTears'],
            blisters: !!f['cond_blisters'],
            openAreas: !!f['cond_openAreas'],
            other: !!f['cond_other'],
            otherText: (f['cond_otherText'] || '').trim() || null
          };
          const sites = (Array.isArray(f['sites']) ? f['sites'] : [])
            .map((row: AnyRec) => ({
              site: (row['site'] || '').toString(),
              description: (row['description'] || '').toString()
            }))
            .filter(r => r.site || r.description);

          payload['skinWeekly'] = {
            effectiveDate: f['effectiveDate'] || new Date(),
            conditions,
            openAreasNew: f['openAreasNew'] === 'yes',
            sites,
            edema: f['edema'] === 'yes',
            comments: (f['comments'] || '').trim() || null
          };
          payload['findings'] = [
            ...Object.entries(conditions)
              .filter(([k, v]) => k !== 'otherText' && v === true)
              .map(([k]) => k),
            conditions.otherText ? `Other: ${conditions.otherText}` : null
          ].filter(Boolean).join(', ') || null;
          break;
        }
        case 'pressureInjuryWeekly': {
          const f = this.form.getRawValue();
          payload['pressureInjuryWeekly'] = {
            stage: f.stage, location: f.location,
            lengthCm: f.lengthCm, widthCm: f.widthCm, depthCm: f.depthCm,
            exudate: f.exudate, odor: f.odor, dressing: f.dressing,
            notes: f.piNotes || null
          };
          break;
        }
        case 'braden': {
          const f = this.form.getRawValue();
          payload['braden'] = {
            sensory: f.sensory,
            moisture: f.moisture,
            activity: f.activity,
            mobility: f.mobility,
            nutrition: f.nutrition,
            friction: f.friction,
            date: f.bradenDate,
            total: this.totalScore,
            riskText: this.bradenRiskText
          };
          break;
        }
        case 'progressNote': {
          const f = this.form.getRawValue();
          payload['progressNote'] = {
            authorRole: f.authorRole,
            visitDate: f.visitDate,
            note: (f.note || '').trim()
          };
          break;
        }
        case 'carePlan': {
          const f = this.form.getRawValue();
          const splitLines = (s: string) =>
            (s || '').split('\n').map((x: string) => x.trim()).filter(Boolean);
          payload['carePlan'] = {
            diagnoses: splitLines(f.diagnoses),
            goals: splitLines(f.goals),
            interventions: splitLines(f.interventions),
            targetDate: f.targetDate || null
          };
          break;
        }
        case 'antibiotic': {
          const a = this.antibioticFG.getRawValue() as AnyRec;
          payload['antibiotic'] = {
            core: {
              medication: a['medication'] || a['newMedicationName'] || null,
              prescriber: a['prescriber'] || null,
              indication: a['indication'] || null,
              clinicalSymptoms: a['clinicalSymptoms'] || null
            },
            symptoms: {
              abdominalCramps: !!a['abdominalCramps'],
              bpDecrease: !!a['bpDecrease'],
              diarrhea: !!a['diarrhea'],
              dizziness: !!a['dizziness'],
              facialSwelling: !!a['facialSwelling'],
              fever: !!a['fever'],
              hives: !!a['hives'],
              itchingSkin: !!a['itchingSkin'],
              itchyWateryEyes: !!a['itchyWateryEyes'],
              lossOfAppetite: !!a['lossOfAppetite'],
              lossOfConsciousness: !!a['lossOfConsciousness'],
              nausea: !!a['nausea'],
              weakRapidPulse: !!a['weakRapidPulse'],
              runnyNose: !!a['runnyNose'],
              seizure: !!a['seizure'],
              shortnessOfBreath: !!a['shortnessOfBreath'],
              skinRash: !!a['skinRash'],
              softStools: !!a['softStools'],
              stomachDistress: !!a['stomachDistress'],
              swellingEdema: !!a['swellingEdema'],
              tighteningAirway: !!a['tighteningAirway'],
              troubleBreathing: !!a['troubleBreathing'],
              vomiting: !!a['vomiting'],
              wheezing: !!a['wheezing'],
              yeastInfectionVaginal: !!a['yeastInfectionVaginal'],
              yeastInfectionOral: !!a['yeastInfectionOral'],
              otherSymptom: !!a['otherSymptom'],
              noneSymptoms: !!a['noneSymptoms'],
            },
            vitals: {
              temperatureC: a['temperatureC'] ?? null,
              respiratoryRate: a['respiratoryRate'] ?? null,
              heartRate: a['heartRate'] ?? null,
              bloodPressure: a['bloodPressure'] || null,
            },
            status: {
              infectionSymptoms: a['infectionSymptoms'] || null,
              activityLevel: a['activityLevel'] || null,
              meals: a['meals'] || null,
              fluids: a['fluids'] || null,
            },
            diagnostics: {
              testsLab: !!a['testsLab'],
              radiology: !!a['radiology'],
              otherDiagnostics: !!a['otherDiagnostics']
            },
            transitionPO: {
              providerName: a['providerName'] || null,
              providerPhone: a['providerPhone'] || null,
              notified: {
                adverseReactions: !!a['adverseReactions'],
                currentStatus: !!a['currentStatus'],
                labResults: !!a['labResults'],
                microbiologyResults: !!a['microbiologyResults'],
                radiologyResults: !!a['radiologyResults'],
                otherInfo: !!a['otherInfo']
              },
              antibioticReview: a['antibioticReview'] === 'yes',
              providerDetermination: a['providerDetermination'],
              treatmentLength: a['treatmentLength'],
              newOrder: {
                medication: a['newMedicationName'] || null,
                dosage: a['dosage'] || null,
                route: a['route'] || null,
                frequency: a['frequency'] || null
              },
              notes: a['notes'] || null,
              date: a['date'] || new Date()
            }
          };
          break;
        }
        case 'nurseAdmission': {
          const n = this.nurseAdmissionFG.getRawValue() as AnyRec;
          payload['nurseAdmission'] = {
            resident: {
              name: n['residentName'], room: n['room'], dob: n['dob'],
              physician: n['physician'], admissionDate: n['admissionDate']
            },
            demographics: {
              admissionSource: n['admissionSource'],
              admissionReason: n['admissionReason'],
              codeStatus: n['codeStatus'],
              tobaccoUse: n['tobaccoUse'],
              allergies: (n['allergies'] || '')
                .split(',').map((s: string) => s.trim()).filter(Boolean)
            },
            adl: {
              sitToStand: n['adl_sitToStand'],
              bedChairTransfer: n['adl_bedChairTransfer'],
              eating: n['adl_eating'],
              toiletHygiene: n['adl_toiletHygiene'],
              walk: n['adl_walk']
            },
            skin: {
              condition: n['skin_condition'], turgor: n['skin_turgor'],
              integrity: {
                pressureUlcer: !!n['skin_integrity_pressureUlcer'],
                skinTears: !!n['skin_integrity_skinTears'],
                surgicalWound: !!n['skin_integrity_surgicalWound']
              },
              comments: n['skin_comments']
            },
            oralNutrition: {
              ownTeeth: !!n['oral_ownTeeth'],
              mouthPain: !!n['oral_mouthPain'],
              mechAltered: !!n['nutrition_mechAltered'],
              liquidConsistency: n['nutrition_liquidConsistency']
            },
            cognition: { loc: n['cog_loc'], speech: n['cog_speech'], disposition: n['cog_disposition'] || [] },
            respiratory: { appearance: n['resp_appearance'], cough: n['resp_cough'], sputum: n['resp_sputum'], o2Sats: n['resp_o2Sats'], o2Method: n['resp_o2Method'] },
            cardiovascular: { apical: n['cv_apical'], radial: n['cv_radial'], pedalLeft: n['cv_pedalLeft'], pedalRight: n['cv_pedalRight'], edema: !!n['cv_edema'] },
            gi: { bowelSounds: n['gi_bowelSounds'], lastBM: n['gi_lastBM'] },
            gu: { urinaryContinence: n['gu_urinaryContinence'], catheter: !!n['gu_catheter'], recentUTI: !!n['gu_recentUTI'] },
            communication: { vision: n['comm_vision'], hearing: n['comm_hearing'], primaryLanguage: n['comm_primaryLanguage'], interpreterNeeded: !!n['comm_interpreterNeeded'] },
            meds: { groups: n['meds_groups'] || [] },
            infections: { key: n['infections_key'] || [] },
            dischargePlan: n['dischargePlan'],
            narrative: n['narrative']
          };
          payload['admissionSource'] = n['admissionSource'] || null;
          payload['codeStatus'] = n['codeStatus'] || null;
          break;
        }
        default: break;
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
