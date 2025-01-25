import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-allergy-modal',
  templateUrl: './allergy-modal.component.html',
  styleUrls: ['./allergy-modal.component.css']
})
export class AllergyModalComponent implements OnInit {
  allergyForm: FormGroup;
  viewOnly: boolean;


  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any, // Les données transmises à la modal
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AllergyModalComponent>
  ) {
    this.viewOnly = data.viewOnly || false; // Lecture seule ou modifiable
    const allergy = data.allergy || {};

    // Initialisez le formulaire avec les données reçues
    this.allergyForm = this.fb.group({
      status: [data?.status || ''],
      date: [data?.date?.toDate() || ''],
      category: [data?.category || ''],
      allergen: [data?.allergen || ''],
      allergyType: [data?.allergyType || ''],
      severity: [data?.severity || ''],
      manifestation: [data?.manifestation || ''],
      note: [data?.note || '']
    });
  }

  ngOnInit(): void {
    console.log('Données reçues par la modal :', this.data);
  }

  onSave(): void {
    if (this.allergyForm.valid) {
      this.dialogRef.close(this.allergyForm.value);
    }
    console.log('Données sauvegardées :', this.allergyForm.value);
  }

  onCancel(): void {
    console.log('Annulé');
    this.dialogRef.close();
  }
}
