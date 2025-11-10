import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EmarListComponent } from './pages/emar-list/emar-list.component';
import { DashboardComponent } from 'src/app/features/skin-wound/pages/dashboard/dashboard.component';

const routes: Routes = [
  // Define eMAR related routes here
  { path: 'dashboard', component: EmarListComponent },
  { path: '', component: EmarListComponent }, // default when lazy-loaded
  // other routes can be added here
  
   // example detail route


];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EmarRoutingModule { }
