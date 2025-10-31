import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export type AddPrescriptionDialogResult = {
  // header
  date: string | Date | null;
  time: string | null;
  category: string | null;
  route: string | null; // "Rang"
  prescriber: string | null;
  description: string | null;
  method: 'Téléphone' | 'Verbale' | 'Ecrite' | string | null;
  type: string | null;

  // routine / schedule
  frequency: string | null;
  scheduleType: 'daily' | 'every-x-days' | 'specific-days' | null;
  everyXDays?: number | null;
  monday?: boolean; tuesday?: boolean; wednesday?: boolean; thursday?: boolean;
  friday?: boolean; saturday?: boolean; sunday?: boolean;

  timeCode: string | null;
  diagnosis: string | null;
  instructions: string | null;
  indications: string | null;
  startDate: string | Date | null;
  endDate: string | Date | null;

  // optional clinical details
  temperature?: number | null;
  frequenceCardiaque?: number | null;
  pouls?: number | null;
  tensionArterielle?: string | null;
  autresObservations?: string | null;
  activity?: string | null;
  repas?: string | null;
  fluides?: string | null;

  // ===== Symptoms checkboxes (added) =====
  abdominalCramps?: boolean;
  bpDecrease?: boolean;
  diarrhea?: boolean;
  dizziness?: boolean;
  facialSwelling?: boolean;
  fever?: boolean;
  hives?: boolean;
  itchingSkin?: boolean;
  itchyWateryEyes?: boolean;
  lossOfAppetite?: boolean;
  lossOfConsciousness?: boolean;
  nausea?: boolean;
  weakRapidPulse?: boolean;
  runnyNose?: boolean;
  seizure?: boolean;
  shortnessOfBreath?: boolean;
  skinRash?: boolean;
  softStools?: boolean;
  stomachDistress?: boolean;
  swellingEdema?: boolean;
  tighteningAirway?: boolean;
  troubleBreathing?: boolean;
  vomiting?: boolean;
  wheezing?: boolean;
  yeastInfectionVaginal?: boolean;
  yeastInfectionOral?: boolean;
  other?: boolean;
  none?: boolean;

  // diagnostics orders
  testsLabo?: boolean;
  radiologie?: boolean;
  autresDiagnostics?: boolean;

  // transition-to-PO
  providerName?: string | null;
  providerPhone?: string | null;
  adverseReactions?: boolean;
  currentStatus?: boolean;
  labResults?: boolean;
  microbiologyResults?: boolean;
  radiologyResults?: boolean;
  otherInfo?: boolean;
  antibioticReview?: 'yes' | 'no' | null;
  providerDetermination?: 'continueTherapy' | 'adjustTherapy' | 'discontinueTherapy' | 'awaitResults' | 'other' | null;
  treatmentLength?: '5days' | '10days' | '14days' | '21days' | 'other' | null;

  // new antibiotic order
  medicationName?: string | null;
  dosage?: string | null;
  routeOrder?: string | null;
  frequencyOrder?: string | null;
  notes?: string | null;

  // e-sign
  signerEmail: string;
  signerPassword: string;
  attest: boolean;
};

@Component({
  selector: 'app-add-prescription-dialog',
  templateUrl: './add-prescription-dialog.component.html',
  styleUrls: ['./add-prescription-dialog.component.scss']
})
export class AddPrescriptionDialogComponent {
  diagnosticForm: FormGroup;
  selectedScheduleType: 'daily' | 'every-x-days' | 'specific-days' | null = null;
  hidePw = true;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { patientId: string },
    private fb: FormBuilder,
    private ref: MatDialogRef<AddPrescriptionDialogComponent>
  ) {
    this.diagnosticForm = this.fb.group({
      // header
      date: [null, Validators.required],
      time: [null, Validators.required],
      category: [null, Validators.required],
      route: [null, Validators.required],
      prescriber: [null, Validators.required],
      description: [null, Validators.required],
      method: [null, Validators.required],
      type: [null, Validators.required],

      // routine
      frequency: [null],
      scheduleType: [null],
      everyXDays: [null],
      monday: [false], tuesday: [false], wednesday: [false], thursday: [false],
      friday: [false], saturday: [false], sunday: [false],

      timeCode: [null],
      diagnosis: [null],
      instructions: [null],
      indications: [null],
      startDate: [null, Validators.required],
      endDate: [null, Validators.required],

      // optional clinical details
      temperature: [null],
      frequenceCardiaque: [null],
      pouls: [null],
      tensionArterielle: [null],
      autresObservations: [null],
      activity: [null],
      repas: [null],
      fluides: [null],

      // ===== Symptoms controls (added) =====
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
      other: [false],
      none: [false],

      // diagnostics
      testsLabo: [false],
      radiologie: [false],
      autresDiagnostics: [false],

      // transition-to-PO
      providerName: [null],
      providerPhone: [null],
      adverseReactions: [false],
      currentStatus: [false],
      labResults: [false],
      microbiologyResults: [false],
      radiologyResults: [false],
      otherInfo: [false],
      antibioticReview: [null],
      providerDetermination: [null],
      treatmentLength: [null],

      // new antibiotic order
      medicationName: [null],
      dosage: [null],
      routeOrder: [null],
      frequencyOrder: [null],
      notes: [null],

      // e-sign
      signerEmail: [null, [Validators.required, Validators.email]],
      signerPassword: [null, Validators.required],
      attest: [false, Validators.requiredTrue]
    });
  }

  onScheduleTypeChange(v: 'daily' | 'every-x-days' | 'specific-days') {
    this.selectedScheduleType = v;
    if (v !== 'every-x-days') this.diagnosticForm.patchValue({ everyXDays: null });
    if (v !== 'specific-days') {
      this.diagnosticForm.patchValue({
        monday: false, tuesday: false, wednesday: false, thursday: false,
        friday: false, saturday: false, sunday: false
      });
    }
  }

  onCancel() { this.ref.close(); }
  onSave() {
    if (this.diagnosticForm.invalid) return;
    const payload: AddPrescriptionDialogResult = this.diagnosticForm.getRawValue();
    this.ref.close(payload);
  }
}
