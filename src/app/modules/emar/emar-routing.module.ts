import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EmarListComponent } from './pages/emar-list/emar-list.component';
import { EmarDetailsComponent } from './pages/emar-details/emar-details.component';

const routes: Routes = [
  // Define eMAR related routes here
  { path: 'emar', component: EmarListComponent },
  { path: '', component: EmarListComponent }, // default when lazy-loaded

  // other routes can be added here

  
   // example detail route
   {path: 'emar/:id', component: EmarDetailsComponent}


];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EmarRoutingModule { }
