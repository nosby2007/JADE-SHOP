import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReportListComponent } from './pages/report-list/report-list.component';

const routes: Routes = [
  // Define reports related routes here
  { path: '', component: ReportListComponent }, // default when lazy-loaded
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportsRoutingModule { }
