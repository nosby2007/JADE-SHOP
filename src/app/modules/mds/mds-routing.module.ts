import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MdsListComponent } from './pages/mds-list/mds-list.component';

const routes: Routes = [
  // Define MDS related routes here
  { path: '', component: MdsListComponent }, // default when lazy-loaded
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MdsRoutingModule { }
