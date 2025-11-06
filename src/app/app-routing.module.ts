import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './COMPONENT/home/home.component';

import { AssessmentFormComponent } from './features/skin-wound/components/assessment-form/assessment-form.component';
import { PatientDetailComponent } from './patients/pages/patient-detail/patient-detail.component';
import { RoleRedirectGuard } from './authentification/role-redirect.guard';
import { LoginComponent } from './authetification/login/login.component';

const routes: Routes = [
  {path:'login', component:LoginComponent,},
  { path: '', redirectTo: 'login', pathMatch: 'full' },


  { path: '', canActivate: [RoleRedirectGuard], component: HomeComponent },

  { path: 'patients', loadChildren: () => import('./patients/patients.module').then(m => m.PatientsModule) },
  { path: 'skin-wound', loadChildren: () => import('./features/skin-wound/skin-wound.module').then(m => m.SkinWoundModule) },
  { path: 'admin', loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule) },
  { path: 'nurse', loadChildren: () => import('./nurse/nurse.module').then(m => m.NurseModule) },
  

  { path: '**', redirectTo: 'home' },

  
]; 



@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }