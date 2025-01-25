import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

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

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.bradenForm = this.fb.group({
      sensory: [null, Validators.required],
      moisture: [null, Validators.required],
      activity: [null, Validators.required],
      mobility: [null, Validators.required],
      nutrition: [null, Validators.required],
      friction: [null, Validators.required]
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

  onSubmit(): void {
    if (this.bradenForm.valid) {
      
      // Logique pour sauvegarder les données
    }
  }

  onReset(): void {
    this.bradenForm.reset();
    this.totalScore = 0;
  }
}