// src/app/nurse/nurse-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NurseShellComponent } from './shell/nurse-shell/nurse-shell.component';
import { NurseDashboardComponent } from './pages/nurse-dashboard/nurse-dashboard.component';
import { NursePatientDetailComponent } from './pages/nurse-patient-detail/nurse-patient-detail.component';
import { NursePatientListComponent } from './pages/nurse-patient-list/nurse-patient-list.component';
import { NursePrescriptionsComponent } from './pages/nurse-prescriptions/nurse-prescriptions.component';
import { NurseTasksComponent } from './pages/nurse-tasks/nurse-tasks.component';
import { NurseAssessmentsComponent } from './pages/nurse-assessment/nurse-assessment.component';

const routes: Routes = [
  {
    path: '',
    component: NurseShellComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      { path: 'dashboard', component: NurseDashboardComponent },

      // (on ajoutera ici les pages suivantes, brique par brique)
      { path: 'patients', component: NursePatientListComponent },
      { path: 'patients/:id', component: NursePatientDetailComponent },
       { path: 'patients/:id/prescriptions', component: NursePrescriptionsComponent },
       { path: 'tasks', component: NurseTasksComponent },
       { path: 'nurse/:pid/tasks', component: NurseTasksComponent },
       { path: 'patients/:id/assessments', component: NurseAssessmentsComponent },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class NurseRoutingModule {}
