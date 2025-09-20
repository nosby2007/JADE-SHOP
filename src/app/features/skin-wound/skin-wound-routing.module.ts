import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { WoundDetailComponent } from './pages/wound-detail/wound-detail.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { AssessmentFormComponent } from './components/assessment-form/assessment-form.component';
import { AssessmentDetailComponent } from './pages/assessment-detail/assessment-detail.component';
import { AssessmentListComponent } from './pages/assessment-list/assessment-list.component';
import { SkinWoundDashboardComponent } from './pages/skin-wound-dashboard/skin-wound-dashboard.component';
import { MediaGalleryComponent } from './pages/media-gallery/media-gallery.component';


const routes: Routes = [
  { path: '', component: SkinWoundDashboardComponent },               // /skin-wound
  { path: 'dashboard', component: DashboardComponent, title: 'Skin & Wound Dashboard' },
  { path: 'new/:id', component: AssessmentFormComponent },            // /skin-wound/new/:patientId
  { path: ':id/media', component: MediaGalleryComponent },            // /skin-wound/:patientId/media  ✅
  { path: ':id/assessments', component: AssessmentListComponent },    // /skin-wound/:patientId/assessments
  { path: ':id/assessments/:assessmentId', component: AssessmentDetailComponent },
];



@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  
})
export class SkinWoundRoutingModule { }
