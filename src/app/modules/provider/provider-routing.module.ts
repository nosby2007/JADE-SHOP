import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ProviderDashboardComponent } from './pages/provider-dashboard/provider-dashboard.component';
import { ProviderListComponent } from './pages/provider-list/provider-list.component';
import { ProviderDetailComponent } from './pages/provider-detail/provider-detail.component';

import { EncounterListComponent } from './pages/encounter-list/encounter-list.component';
import { OrderListComponent } from './pages/order-list/order-list.component';
import { PrescriptionListComponent } from './pages/prescription-list/prescription-list.component';
import { NoteListComponent } from './pages/note-list/note-list.component';
import { ReferralListComponent } from './pages/referral-list/referral-list.component';
import { LabListComponent } from './pages/lab-list/lab-list.component';
import { ImagingListComponent } from './pages/imaging-list/imaging-list.component';
import { ScheduleComponent } from './pages/schedule/schedule.component';
import { ProviderShellComponent } from './pages/provider-shell/provider-shell.component';
import { ProviderGuard } from 'src/app/guards/provider.guard';

const routes: Routes = [
  { path: '', component: ProviderShellComponent,
     canActivate: [ProviderGuard],
        data: { roles: ['provider', 'admin'] },   // ← employer n’est PAS autorisé
   children: [
  {
    path: 'dashboard',
    component: ProviderDashboardComponent
  }, // /provider  OU  /patients/:id/provider
  {
    path: 'list',
    component: ProviderListComponent
  }, // /provider/list
  {
    path: 'list/:id',
    component: ProviderDetailComponent
  },

  // Cliniques
  { path: 'encounters', component: EncounterListComponent },
  { path: 'list/:id/orders', component: OrderListComponent },
  { path: 'list/:id/prescriptions', component: PrescriptionListComponent },
  { path: 'notes', component: NoteListComponent },
  { path: 'referrals', component: ReferralListComponent },
  { path: 'labs', component: LabListComponent },
  
  // e.g., in skin-wound or provider module route

  { path: 'imaging', component: ImagingListComponent },

  // Planning
  { path: 'schedule', component: ScheduleComponent },
  ] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProviderRoutingModule {}
