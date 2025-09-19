import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { WoundDetailComponent } from './pages/wound-detail/wound-detail.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { AssessmentFormComponent } from './components/assessment-form/assessment-form.component';
import { AssessmentDetailComponent } from './pages/assessment-detail/assessment-detail.component';
import { AssessmentListComponent } from './pages/assessment-list/assessment-list.component';
import { SkinWoundDashboardComponent } from './pages/skin-wound-dashboard/skin-wound-dashboard.component';

const routes: Routes = [
  { path: 'dashboard', component: DashboardComponent, title: 'Skin & Wound Dashboard' },
  { path: 'dash', component: SkinWoundDashboardComponent },
  { path: 'skin-wound/new/:id', component: AssessmentFormComponent },
  { path: 'skin-wound/:id/assessments', component: AssessmentListComponent },
  { path: 'skin-wound/:id/assessments/:assessmentId', component: AssessmentDetailComponent },



 


  { path: '', component: SkinWoundDashboardComponent },                         // /skin-wound
  { path: 'new/:id', component: AssessmentFormComponent },                      // /skin-wound/new/:patientId
  { path: ':id/assessments', component: AssessmentListComponent },              // /skin-wound/:patientId/assessments
  { path: ':id/assessments/:assessmentId', component: AssessmentDetailComponent } // /skin-wound/:patientId/assessments/:assessmentId
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  
})
export class SkinWoundRoutingModule { }
