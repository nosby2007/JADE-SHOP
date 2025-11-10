import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SocialListComponent } from './pages/social-list/social-list.component';

const routes: Routes = [
  // Define social related routes here
  { path: '', component: SocialListComponent }, // default when lazy-loaded
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SocialRoutingModule { }
