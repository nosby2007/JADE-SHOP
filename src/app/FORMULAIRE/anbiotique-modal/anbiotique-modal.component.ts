import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-anbiotique-modal',
  templateUrl: './anbiotique-modal.component.html',
  styleUrls: ['./anbiotique-modal.component.scss']
})
export class AnbiotiqueModalComponent implements OnInit {

  evaluationForm!: FormGroup;

  constructor(private fb: FormBuilder, private dialogRef: MatDialogRef<AnbiotiqueModalComponent>) {}

  ngOnInit(): void {
    this.evaluationForm = this.fb.group({
      medicament: [null, Validators.required],
      prescripteur: [null, Validators.required],
      pouls: [null, Validators.required],
      indication: [null],
      activity: [null],
      fluides: [null],
      repas: [null],
      symptomes: [null],
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
      temperature: [null],
      frequenceCardiaque: [null],
      tensionArterielle: [null],
      autresObservations: [null],
      testsLabo: [false],
      radiologie: [false],
      autresDiagnostics: [false],
      notes: [null],
      providerName: ['', Validators.required],
      providerPhone: ['', Validators.required],
      adverseReactions: [false],
      currentStatus: [false],
      labResults: [false],
      microbiologyResults: [false],
      radiologyResults: [false],
      otherInfo: [false],
      antibioticReview: ['', Validators.required],
      providerDetermination: ['', Validators.required],
      treatmentLength: ['', Validators.required],
      medicationName: [''],
      dosage: [''],
      route: [''],
      frequency: [''],
      date: ['']
    });
  }

  onSubmit(): void {
    if (this.evaluationForm.valid) {
      console.log('Données à sauvegarder :', this.evaluationForm.value); // Debug
      this.dialogRef.close(this.evaluationForm.value);
    } else {
      console.error('Formulaire invalide :', this.evaluationForm.errors);
    }
  }

  onReset(): void {
    this.evaluationForm.reset();
    this.dialogRef.close();
  }
}