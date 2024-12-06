import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PatientListComponent } from './COMPONENT/patient-list/patient-list.component';
import { AddPatientComponent } from './COMPONENT/add-patient/add-patient.component';
import { AddAppointmentComponent } from './COMPONENT/add-appointment/add-appointment.component';
import { AppointmentListComponent } from './COMPONENT/appointment-list/appointment-list.component';
import { PatienDetailsComponent } from './COMPONENT/patien-details/patien-details.component';
import { LoginComponent } from './Authentification/login/login.component';
import { AuthGuardGuard } from './SERVICE/auth-guard.guard';
import { HomeComponent } from './COMPONENT/home/home.component';


const routes: Routes = [
  {path: '', redirectTo:'login', pathMatch:'full'},
  {path:'login', component:LoginComponent},
  {path:'home', component:HomeComponent},
  {path: "PatientList", component:PatientListComponent, canActivate:[AuthGuardGuard]},
  {path: "addPatient", component:AddPatientComponent, canActivate:[AuthGuardGuard]},
  {path: "addAppointment", component:AddAppointmentComponent, canActivate:[AuthGuardGuard]},
  {path: "appointmentList", component:AppointmentListComponent, canActivate:[AuthGuardGuard]},
  {path: "PatientList/:id", component:PatienDetailsComponent, canActivate:[AuthGuardGuard]},
  
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
