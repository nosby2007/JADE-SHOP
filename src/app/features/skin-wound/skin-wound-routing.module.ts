import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PatientDetailComponent } from './pages/patient-detail/patient-detail.component';
import { PatientsListComponent } from './pages/patients-list/patients-list.component';
import { WoundDetailComponent } from './pages/wound-detail/wound-detail.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';

const routes: Routes = [
  { path: 'dashboard', component: DashboardComponent, title: 'Skin & Wound Dashboard' },
  { path: 'patients', component: PatientsListComponent, title: 'Skin & Wound - Patients' },
  { path: 'patient/:id', component: PatientDetailComponent, title: 'Patient' },
  { path: 'wound/:id', component: WoundDetailComponent, title: 'Wound' },
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  
})
export class SkinWoundRoutingModule { }
