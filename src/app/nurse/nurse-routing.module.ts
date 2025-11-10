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
import { AssessmentDetailComponent } from '../features/skin-wound/pages/assessment-detail/assessment-detail.component';
import { SkinWoundComponent } from '../features/skin-wound/skin-wound.component';
import { NurseGuard } from '../guards/nurse.guard';



const routes: Routes = [
  {
    path: '',
    component: NurseShellComponent,
      canActivate: [NurseGuard],
    data: { roles: ['nurse', 'admin', 'provider'] },   // ← employer n’est PAS autorisé
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
       { path: ':id/wounds', component: SkinWoundComponent },
       { path: ':id/wounds/:assessmentId', component: AssessmentDetailComponent },
       { path: 'patients/:id/assessments/:assessmentId', component: AssessmentDetailComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class NurseRoutingModule {}
