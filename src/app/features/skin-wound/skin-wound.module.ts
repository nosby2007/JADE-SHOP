import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { PatientDetailComponent } from './pages/patient-detail/patient-detail.component';
import { PatientsListComponent } from './pages/patients-list/patients-list.component';
import { WoundDetailComponent } from './pages/wound-detail/wound-detail.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';

@NgModule({
  declarations: [
    PatientsListComponent,
    PatientDetailComponent,
    WoundDetailComponent,
    DashboardComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild([
      { path: '', component: PatientsListComponent },
      { path: 'patient/:id', component: PatientDetailComponent },
      { path: 'wound/:id', component: WoundDetailComponent },
      { path: '', component: DashboardComponent }
    ]),
    ReactiveFormsModule,  // << requis pour [formGroup] et formControlName
    FormsModule           // << requis pour [ngModel] / [ngValue]
  ]
})
export class SkinWoundModule {}
