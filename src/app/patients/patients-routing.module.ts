import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PatientListComponent } from './pages/patient-list/patient-list.component';
import { PatientDetailComponent } from './pages/patient-detail/patient-detail.component';

import { PatientFormComponent } from './pages/patient-form/patient-form.component';
import { ReceptionShellComponent } from './pages/reception-shell/reception-shell.component';
import { ReceptionDashboardComponent } from './pages/reception-dashboard/reception-dashboard.component';

// src/app/patients/patients-routing.module.ts
const routes: Routes = [


   {
      path: '',
      component: ReceptionShellComponent,
      children: [
        { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
        { path: 'dashboard', component: ReceptionDashboardComponent },
        { path: 'patients', component: PatientListComponent },
        { path: 'patients/new', component: PatientFormComponent },
        { path: 'patients/:id', component: PatientDetailComponent },
        { path: 'patients/:id/edit', component: PatientFormComponent },

      ]
    }
  
  
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PatientsRoutingModule {}
