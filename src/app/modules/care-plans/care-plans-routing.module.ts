import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CarePlanListComponent } from './pages/care-plan-list/care-plan-list.component';

const routes: Routes = [
  // Define care plans related routes here
  { path: '', component: CarePlanListComponent }, // default when lazy-loaded
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CarePlansRoutingModule { }
