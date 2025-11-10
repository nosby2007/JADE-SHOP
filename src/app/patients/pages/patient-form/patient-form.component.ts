import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { PatientApiService } from 'src/app/core/patient-api.service';

import { environment } from 'src/environments/environment';
import { PatientService } from 'src/app/service/patient.service';

type AnyRec = Record<string, any>;

@Component({
  selector: 'app-patient-form',
  templateUrl: './patient-form.component.html',
  styleUrls: ['./patient-form.component.scss']
})
export class PatientFormComponent implements OnInit {
  useApi = !!environment.apiBase;
  id?: string;
  submitting = false;

  form: FormGroup = this.fb.group({
    demographics: this.fb.group({
      legalName: ['', Validators.required],
      preferredName: [''],
      gender: [''],
      dob: [null as Date | null, Validators.required],
      admissionDate: [null as Date | null, Validators.required],
      phone: [''],
      email: ['', Validators.email],
      address1: [''],
      address2: [''],
      city: [''],
      state: [''],
      zip: [''],
      country: [''],
      language: [''],
      maritalStatus: ['']
    }),
    identity: this.fb.group({
      ssn: [''],
      idType: [''],
      idNumber: [''],
      insuranceProvider: [''],
      insuranceId: [''],
      groupNumber: [''],
      payor: [''],
      policyHolder: [''],
      emergencyContactName: [''],
      emergencyContactPhone: [''],
      emergencyRelation: ['']
    }),
    clinical: this.fb.group({
      reasonForAdmission: [''],
      diagnoses: this.fb.array([]),
      allergies: this.fb.array([]),
      primaryCareProvider: [''],
      referringProvider: [''],
      codeStatus: [''],
      preferredPharmacy: [''],
      heightCm: [''],
      weightKg: ['']
    }),
    consent: this.fb.group({
      hipaaAck: [false, Validators.requiredTrue],
      privacyNoticeAck: [false, Validators.requiredTrue],
      financialAgreementAck: [false, Validators.requiredTrue]
    })
  });

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private api: PatientApiService,
    private fs: PatientService,
    private afAuth: AngularFireAuth
  ) {}

  // Form group getters (for template)
  get demographicsFG(): FormGroup { return this.form.get('demographics') as FormGroup; }
  get identityFG(): FormGroup     { return this.form.get('identity') as FormGroup; }
  get clinicalFG(): FormGroup     { return this.form.get('clinical') as FormGroup; }
  get consentFG(): FormGroup      { return this.form.get('consent') as FormGroup; }

  // Safe value getters for review (plain objects)
  get demVal(): AnyRec  { return (this.demographicsFG?.value ?? {}) as AnyRec; }
  get idVal(): AnyRec   { return (this.identityFG?.value ?? {}) as AnyRec; }
  get clinVal(): AnyRec { return (this.clinicalFG?.value ?? {}) as AnyRec; }

  get dxFA(): FormArray  { return this.clinicalFG.get('diagnoses') as FormArray; }
  get algFA(): FormArray { return this.clinicalFG.get('allergies') as FormArray; }

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id') || undefined;
    if (this.id) {
      const load$ = this.useApi ? this.api.get(this.id) : this.fs.get(this.id);
      (load$ as any).subscribe((p: AnyRec) => {
        if (!p) return;
        const pv = (p || {}) as AnyRec;

        const patch: AnyRec = { demographics: {}, identity: {}, clinical: {} };

        // demographics
        patch['demographics'] = patch['demographics'] || {};
        patch['demographics']['legalName']     = pv['name'] ?? '';
        patch['demographics']['preferredName'] = pv['preferredName'] ?? '';
        patch['demographics']['gender']        = pv['gender'] ?? '';
        patch['demographics']['dob']           = this.toSafeDate(pv['dob']);
        patch['demographics']['admissionDate']           = this.toSafeDate(pv['admissionDate']);
        patch['demographics']['phone']         = pv['phone'] ?? '';
        patch['demographics']['email']         = pv['email'] ?? '';
        patch['demographics']['address1']      = pv['address'] ?? '';
        patch['demographics']['city']          = pv['city'] ?? '';
        patch['demographics']['state']         = pv['state'] ?? '';
        patch['demographics']['zip']           = pv['zip'] ?? '';
        patch['demographics']['country']       = pv['country'] ?? '';
        patch['demographics']['language']      = pv['language'] ?? '';
        patch['demographics']['maritalStatus'] = pv['maritalStatus'] ?? '';

        // identity / clinical (back-compat)
        patch['identity'] = patch['identity'] || {};
        patch['identity']['payor'] = pv['paiement'] ?? pv['payor'] ?? '';
        patch['identity']['ssn']                 = pv['ssn'] ?? '';
        patch['identity']['idType']              = pv['idType'] ?? '';
        patch['identity']['idNumber']            = pv['idNumber'] ?? '';
        patch['identity']['insuranceProvider']   = pv['insuranceProvider'] ?? '';
        patch['identity']['insuranceId']         = pv['insuranceId'] ?? '';
        patch['identity']['groupNumber']         = pv['groupNumber'] ?? '';
        patch['identity']['policyHolder']        = pv['policyHolder'] ?? '';
        patch['identity']['emergencyContactName']  = pv['emergencyContact']?.name ?? pv['emergencyContactName'] ?? '';
        patch['identity']['emergencyContactPhone'] = pv['emergencyContact']?.phone ?? pv['emergencyContactPhone'] ?? '';
        patch['identity']['emergencyRelation']     = pv['emergencyContact']?.relation ?? pv['emergencyRelation'] ?? '';
        // clinical
        

        patch['clinical'] = patch['clinical'] || {};
        patch['clinical']['allergies'] = Array.isArray(pv['allergies']) ? pv['allergies'] : [];
        patch['clinical']['diagnoses'] = Array.isArray(pv['diagnoses']) ? pv['diagnoses'] : [];
        patch['clinical']['medications'] = Array.isArray(pv['medications']) ? pv['medications'] : [];
        patch['clinical']['reasonForAdmission']  = pv['raison'] ?? pv['reasonForAdmission'] ?? '';
        patch['clinical']['primaryCareProvider'] = pv['docteur'] ?? pv['primaryCareProvider'] ?? '';
        patch['clinical']['referringProvider']  = pv['referringProvider'] ?? '';
        patch['clinical']['codeStatus']         = pv['codeStatus'] ?? '';
        patch['clinical']['preferredPharmacy']  = pv['preferredPharmacy'] ?? '';
        patch['clinical']['heightCm']           = pv['heightCm'] ?? '';
        patch['clinical']['weightKg']           = pv['weightKg'] ?? '';
        patch['clinical']['bmi']                = pv['bmi'] ?? '';

        // ...other flat fields can be added here as needed
        // consent
        patch['consent'] = patch['consent'] || {};
        patch['consent']['hipaaAck']             = !!pv['hipaaAck'];
        patch['consent']['privacyNoticeAck']     = !!pv['privacyNoticeAck'];
        patch['consent']['financialAgreementAck'] = !!pv['financialAgreementAck'];

        // arrays
        const dx  = Array.isArray(pv['diagnoses']) ? pv['diagnoses'] : [];
        const alg = Array.isArray(pv['allergies']) ? pv['allergies'] : [];
        this.dxFA.clear();  dx.forEach((v: string) => this.dxFA.push(this.fb.control(v)));
        this.algFA.clear(); alg.forEach((v: string) => this.algFA.push(this.fb.control(v)));

        this.form.patchValue(patch, { emitEvent: false });
      });
    }
  }

  private toSafeDate(input: any): Date | null {
    if (!input) return null;
    if (typeof input?.toDate === 'function') { try { return input.toDate(); } catch { return null; } }
    if (typeof input?.seconds === 'number') { try { return new Date(input.seconds * 1000); } catch { return null; } }
    if (input instanceof Date) return isNaN(input.getTime()) ? null : input;
    if (typeof input === 'string' || typeof input === 'number') {
      const d = new Date(input);
      return isNaN(d.getTime()) ? null : d;
    }
    return null;
  }

  addDiagnosis(v: string) {
    const val = (v || '').trim();
    if (val) this.dxFA.push(this.fb.control(val));
  }
  removeDiagnosis(i: number) { this.dxFA.removeAt(i); }

  addAllergy(v: string) {
    const val = (v || '').trim();
    if (val) this.algFA.push(this.fb.control(val));
  }
  removeAllergy(i: number) { this.algFA.removeAt(i); }

  async submit() {
    if (this.form.invalid) return;
    this.submitting = true;
    try {
      const raw = this.form.getRawValue() as AnyRec;

      const dem  = (raw['demographics'] || {}) as AnyRec;
      const iden = (raw['identity'] || {}) as AnyRec;
      const clin = (raw['clinical'] || {}) as AnyRec;
      const cons = (raw['consent'] || {}) as AnyRec;

      const name    = (dem['legalName'] ?? '').toString();
      const dobDate = this.toSafeDate(dem['dob']);
      const admissionDate = this.toSafeDate(dem['admissionDate']);

      const payload: AnyRec = {
        demographics: dem,
        identity: iden,
        clinical: {
          ...clin,
          diagnoses: Array.isArray(clin['diagnoses']) ? clin['diagnoses'] : [],
          allergies: Array.isArray(clin['allergies']) ? clin['allergies'] : []
        },
        consent: cons,

        // Back-compat flat fields
        name,
preferredName: dem['preferredName'] || '',
gender: dem['gender'] || '',
dob: this.useApi ? (dobDate ? dobDate.toISOString() : undefined) : (dobDate ?? undefined),
admissionDate: this.useApi ? (admissionDate ? admissionDate.toISOString() : undefined) : (admissionDate ?? undefined),

// Contact / address
phone: dem['phone'] || '',
email: dem['email'] || '',
address: dem['address1'] || '',
address1: dem['address1'] || '',
address2: dem['address2'] || '',
city: dem['city'] || '',
state: dem['state'] || '',
zip: dem['zip'] || '',
country: dem['country'] || '',
language: dem['language'] || '',
maritalStatus: dem['maritalStatus'] || '',

// Identity (flat)
ssn: iden['ssn'] || '',
idType: iden['idType'] || '',
idNumber: iden['idNumber'] || '',
insuranceProvider: iden['insuranceProvider'] || '',
insuranceId: iden['insuranceId'] || '',
groupNumber: iden['groupNumber'] || '',
payor: iden['payor'] || '',
policyHolder: iden['policyHolder'] || '',
emergencyContactName: iden['emergencyContactName'] || '',
emergencyContactPhone: iden['emergencyContactPhone'] || '',
emergencyRelation: iden['emergencyRelation'] || '',

// Clinical (flat)
reasonForAdmission: clin['reasonForAdmission'] || '',
primaryCareProvider: clin['primaryCareProvider'] || '',
referringProvider: clin['referringProvider'] || '',
codeStatus: clin['codeStatus'] || '',
preferredPharmacy: clin['preferredPharmacy'] || '',
heightCm: clin['heightCm'] || '',
weightKg: clin['weightKg'] || '',


// Consent (flat)
hipaaAck: !!cons['hipaaAck'],
privacyNoticeAck: !!cons['privacyNoticeAck'],
financialAgreementAck: !!cons['financialAgreementAck'],

// Legacy aliases for older consumers
docteur: clin['primaryCareProvider'] || '',
raison: clin['reasonForAdmission'] || '',
paiement: iden['payor'] || '',

// Optional legacy nested emergencyContact object
emergencyContact: {
  name: iden['emergencyContactName'] || '',
  phone: iden['emergencyContactPhone'] || '',
  relation: iden['emergencyRelation'] || ''
},
 };

      if (!this.id) {
        if (this.useApi) {
          this.api.create(payload).subscribe(({ id }) => this.router.navigate(['/patients', id]));
        } else {
          const ref = await this.fs.create(payload);
          const id = (await ref).id;
          this.router.navigate(['/patients', id]);
        }
      } else {
        if (this.useApi) {
          this.api.update(this.id, { ...payload, updatedAt: new Date().toISOString() })
              .subscribe(() => this.router.navigate(['/patients', this.id!]));
        } else {
          await this.fs.update(this.id, payload);
          this.router.navigate(['/patients', this.id!]);
        }
      }
    } finally {
      this.submitting = false;
    }
  }
}
