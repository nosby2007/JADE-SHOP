import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { JobListComponent } from './pages/job-list/job-list.component';

const routes: Routes = [
  // Define laundry related routes here
  { path: '', component: JobListComponent }, // default when lazy-loaded
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LaundryRoutingModule { }
