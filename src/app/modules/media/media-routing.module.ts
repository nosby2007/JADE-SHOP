import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MediaListComponent } from './pages/media-list/media-list.component';

const routes: Routes = [
  // Define MDS related routes here
  { path: '', component: MediaListComponent }, // default when lazy-loaded

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MediaRoutingModule { }
