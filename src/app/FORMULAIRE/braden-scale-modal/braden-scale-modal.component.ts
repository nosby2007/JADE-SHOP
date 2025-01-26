import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Component({
  selector: 'app-braden-scale-modal',
  templateUrl: './braden-scale-modal.component.html',
  styleUrls: ['./braden-scale-modal.component.scss']
})
export class BradenScaleModalComponent implements OnInit {

  bradenForm!: FormGroup;
  totalScore: number = 0;

  sensoryOptions = [
    { value: 1, label: '1 : Complètement limitée' },
    { value: 2, label: '2 : Très limitée' },
    { value: 3, label: '3 : Légèrement limitée' },
    { value: 4, label: '4 : Aucune limitation' }
  ];

  moistureOptions = [
    { value: 1, label: '1 : Constamment humide' },
    { value: 2, label: '2 : Très humide' },
    { value: 3, label: '3 : Parfois humide' },
    { value: 4, label: '4 : Rarement humide' }
  ];

  activityOptions = [
    { value: 1, label: '1 : Alité' },
    { value: 2, label: '2 : Fauteuil' },
    { value: 3, label: '3 : Marche occasionnelle' },
    { value: 4, label: '4 : Marche fréquente' }
  ];

  mobilityOptions = [
    { value: 1, label: '1 : Totalement immobile' },
    { value: 2, label: '2 : Très limitée' },
    { value: 3, label: '3 : Légèrement limitée' },
    { value: 4, label: '4 : Aucune limitation' }
  ];

  nutritionOptions = [
    { value: 1, label: '1 : Très pauvre' },
    { value: 2, label: '2 : Probablement inadéquat' },
    { value: 3, label: '3 : Adéquat' },
    { value: 4, label: '4 : Excellent' }
  ];

  frictionOptions = [
    { value: 1, label: '1 : Problème' },
    { value: 2, label: '2 : Problème potentiel' },
    { value: 3, label: '3 : Aucun problème apparent' }
  ];

  ngOnInit(): void {
    this.bradenForm = this.fb.group({
      sensory: [null, Validators.required],
      moisture: [null, Validators.required],
      activity: [null, Validators.required],
      mobility: [null, Validators.required],
      nutrition: [null, Validators.required],
      friction: [null, Validators.required],
      date: [null, Validators.required],
      totalScore: [{ value: 0, disabled: true }]
    });

    // Écoute les changements pour calculer le score total
    this.bradenForm.valueChanges.subscribe(() => {
      this.calculateTotalScore();
    });
  }

  calculateTotalScore(): void {
    const values = this.bradenForm.value;
    this.totalScore =
      (values.sensory || 0) +
      (values.moisture || 0) +
      (values.activity || 0) +
      (values.mobility || 0) +
      (values.nutrition || 0) +
      (values.friction || 0);
  }

  constructor(private fb: FormBuilder, private dialogRef: MatDialogRef<BradenScaleModalComponent>, private firestore: AngularFirestore) {}

  onSubmit(): void {
    if (this.bradenForm.valid) {
      const formData = { ...this.bradenForm.value, totalScore: this.totalScore };
      console.log('Données à sauvegarder :', formData); // Debug
      this.firestore.collection('bradenScores').add(formData)
        .then(() => {
          console.log('Données sauvegardées avec succès');
          this.dialogRef.close(formData);
        })
        .catch(error => {
          console.error('Erreur lors de la sauvegarde des données :', error);
        });
    } else {
      console.error('Formulaire invalide :', this.bradenForm.errors);
    }
  }

  onReset(): void {
    this.bradenForm.reset();
    this.totalScore = 0;
    this.dialogRef.close();
  }
} 