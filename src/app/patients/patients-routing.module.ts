import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PatientListComponent } from './pages/patient-list/patient-list.component';
import { PatientDetailComponent } from './pages/patient-detail/patient-detail.component';
import { PatientWoundsComponent } from './pages/patient-wounds/patient-wounds.component';
import { AssessmentFormComponent } from '../features/skin-wound/components/assessment-form/assessment-form.component';
import { PatientFormComponent } from './pages/patient-form/patient-form.component';
import { AssessmentDetailComponent } from '../features/skin-wound/pages/assessment-detail/assessment-detail.component';

// src/app/patients/patients-routing.module.ts
const routes: Routes = [
  { path: '', component: PatientListComponent },
  { path: 'new', component: PatientFormComponent },
  { path: ':id', component: PatientDetailComponent },
  { path: ':id/wounds', component: PatientWoundsComponent },
  { path: ':id/wounds/:assessmentId', component: AssessmentDetailComponent }
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PatientsRoutingModule {}
