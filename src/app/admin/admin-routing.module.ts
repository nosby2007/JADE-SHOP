import { NgModule } from '@angular/core';
import { RouterModule, Routes, CanActivate } from '@angular/router';
import { AdminUserListComponent } from './pages/admin-user-list/admin-user-list.component';
import { AdminGuard } from './guards/admin.guard';

const routes: Routes = [
  { path: 'users', component: AdminUserListComponent, canActivate: [AdminGuard] },
  { path: '', pathMatch: 'full', redirectTo: 'users' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule {}
