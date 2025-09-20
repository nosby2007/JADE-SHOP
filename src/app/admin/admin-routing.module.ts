// src/app/admin/admin-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminUserListComponent } from './pages/admin-user-list/admin-user-list.component';
import { AdminGuard } from './guards/admin.guard';
import { AdminShellComponent } from './shell/admin-shell/admin-shell.component';
// ⚠️ importe le BON composant que tu déclares réellement
import { AdminDashbordComponent } from './pages/admin-dashboard/admin-dashbord/admin-dashbord.component';

const routes: Routes = [
  {
    path: '',                                // ⬅️ vide (car lazy-loaded sur /admin)
    component: AdminShellComponent,
    canActivate: [AdminGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      { path: 'dashboard', component: AdminDashbordComponent }, // ⬅️ nom aligné
      { path: 'users', component: AdminUserListComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {}
