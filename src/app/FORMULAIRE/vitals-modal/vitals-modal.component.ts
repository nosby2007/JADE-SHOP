import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { PatientService } from 'src/app/SERVICE/patient.service';
import { PharmacyModalComponent } from '../pharmacy-modal/pharmacy-modal.component';

@Component({
  selector: 'app-vitals-modal',
  templateUrl: './vitals-modal.component.html',
  styleUrls: ['./vitals-modal.component.scss']
})
export class VitalsModalComponent implements OnInit {

   nurseForm!: FormGroup;
    selectedScheduleType: string | null = null;
  
    constructor(
      private fb: FormBuilder, private route:ActivatedRoute,
      public dialogRef: MatDialogRef<PharmacyModalComponent>,
      private patientService: PatientService,  @Inject(MAT_DIALOG_DATA) public data: { patientId: string }
    ){}
    ngOnInit(): void {
      this.initializeForm();
    }
  
    private initializeForm(): void {
      this.nurseForm = this.fb.group({
        taille: [''],
        poids: [''],
        imc: [''],
        allergie: [''],
        température: [''],
        systole: [''],
        dyastole: [''],
        poul: [''],
        couleur: [''],
        scapula: [''],
        cou: [''],
        rythme: [''],
        saturation: [''],
        respiration: [''],
        glycemie: [''],
        sanguin: [''],
        habitudes: [''],
        status: [''],
        poidN: [''],
        cranien: [''],
        poignet: [''],
        poitrine: [''],
        brachiale: [''],
        hanche: [''],
        allergieq: [''],
        description: [''],
        severité: [''],
        reaction: [''],
        tabac: [''],
        alcool: [''],
        histoire: [''],
        bouteilles: [''],
        cigarettes: [''],
        chirurgie: [''],
        medicament: [''],
        observations: [''],
        note: [''],
        douleur: [''],
        radio: [''],
        date:[''],
  
      });
    }
  
    onScheduleTypeChange(scheduleType: string): void {
      this.selectedScheduleType = scheduleType;
    }
  
    onSave(): void {
      if (this.nurseForm.valid) {
        console.log('Données à sauvegarder :', this.nurseForm.value); // Debug
        this.dialogRef.close(this.nurseForm.value);
      } else {
        console.error('Formulaire invalide :', this.nurseForm.errors);
      }
    }
  
    onCancel(): void {
      this.dialogRef.close();
    }

    submit(){}
    edit() { }
  
    delete() { }

    /*calculateImc(tailleValue: number) {
      const poids = this.nurseForm.value.poids;
      const taille = tailleValue;
      const imc = poids / (taille * taille);
      this.nurseForm.controls[`imc`].patchValue(imc);
  
       switch (true) {
         case imc < 18.5:
           this.nurseForm.controls[`bmiResult`].patchValue("Underweight");
           break;
         case ( imc >= 18.5 && imc < 25):
           this.nurseForm.controls[`bmiResult`].patchValue("Normal");
           break;
         case imc >= 25 && imc <30:
           this.nurseForm.controls[`bmiResult`].patchValue("Overrweight");
           break;
       
         default:
           this.nurseForm.controls[`bmiResult`].patchValue("Obese");
           break;
       }
  
    }*/
  }