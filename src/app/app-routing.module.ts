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
import { ClinicalDashboardComponent } from './components/clinical-dashboard/clinical-dashboard.component';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
import { POCComponent } from './components/poc/poc.component';
import { EMARComponent } from './components/e-mar/e-mar.component';
import { AllLinksComponent } from './components/all-links/all-links.component';
import { AutresComponent } from './components/autres/autres.component';
import { PatientListAdComponent } from './Administrator/patient-list-ad/patient-list-ad.component';
import { NouveauProComponent } from './Administrator/nouveau-pro/nouveau-pro.component';
import { TableauBordComptComponent } from './Administrator/tableau-bord-compt/tableau-bord-compt.component';
import { UDAComptComponent } from './Administrator/udacompt/udacompt.component';
import { RapportComponent } from './Administrator/rapport/rapport.component';
import { SuivitHospiComponent } from './CLINICAL/suivit-hospi/suivit-hospi.component';
import { SystemDAtaMedComponent } from './CLINICAL/system-data-med/system-data-med.component';
import { CommunicationComponent } from './CLINICAL/communication/communication.component';
import { OrdersComponent } from './CLINICAL/orders/orders.component';
import { LabResultComponent } from './CLINICAL/lab-result/lab-result.component';
import { ManagRiskComponent } from './CLINICAL/manag-risk/manag-risk.component';
import { PoidsSignesVComponent } from './CLINICAL/poids-signes-v/poids-signes-v.component';
import { ControlInfectionsComponent } from './CLINICAL/control-infections/control-infections.component';
import { TherapyComponent } from './CLINICAL/therapy/therapy.component';
import { VisitMedicalComponent } from './CLINICAL/visit-medical/visit-medical.component';
import { PoidsComponent } from './CLINICAL/poids/poids.component';
import { VaccinationComponent } from './CLINICAL/vaccination/vaccination.component';
import { GlucoseComponent } from './CLINICAL/glucose/glucose.component';
import { RespirationComponent } from './CLINICAL/respiration/respiration.component';
import { SpO2Component } from './CLINICAL/sp-o2/sp-o2.component';
import { DouleurComponent } from './CLINICAL/douleur/douleur.component';
import { TensionComponent } from './CLINICAL/tension/tension.component';
import { PoolsComponent } from './CLINICAL/pools/pools.component';
import { RapportQualiteComponent } from './RAPPORT/rapport-qualite/rapport-qualite.component';
import { RapportCliniqueComponent } from './RAPPORT/rapport-clinique/rapport-clinique.component';
import { RapportFinancierComponent } from './RAPPORT/rapport-financier/rapport-financier.component';
import { DetailNurseComponent } from './FORMULAIRE/detail-nurse/detail-nurse.component';
import { UDAComponent } from './CLINICAL/uda/uda.component';
import { PatientClinicalComponent } from './CLINICAL/patient-clinical/patient-clinical.component';
import { AddPrescriptionComponent } from './FORMULAIRE/add-prescription/add-prescription.component';
import { EmarDetailsComponent } from './FORMULAIRE/emar-details/emar-details.component';
import { AllPresComponent } from './COMPONENT/all-pres/all-pres.component';
import { AllDiagComponent } from './COMPONENT/all-diag/all-diag.component';
import { BradenScaleModalComponent } from './FORMULAIRE/braden-scale-modal/braden-scale-modal.component';
import { FallRiskComponent } from './FORMULAIRE/fall-risk/fall-risk.component';
import { NutritionComponent } from './FORMULAIRE/nutrition/nutrition.component';
import { AssessmentFormComponent } from './features/skin-wound/components/assessment-form/assessment-form.component';
import { PatientDetailComponent } from './patients/pages/patient-detail/patient-detail.component';








const routes: Routes = [
  {path:'login', component:LoginComponent,},
  {path:'home', component:HomeComponent, canActivate:[AuthGuardGuard]},
  {path:'poc', component:POCComponent, canActivate:[AuthGuardGuard]},
  {path:'emar', component:EMARComponent, canActivate:[AuthGuardGuard]},
  {path:'allLink', component:AllLinksComponent, canActivate:[AuthGuardGuard]},
  {path:'autres', component:AutresComponent, canActivate:[AuthGuardGuard]},
  {path:'patientAd', component:PatientListAdComponent, canActivate:[AuthGuardGuard]},
  {path:'medicaux', component:NouveauProComponent, canActivate:[AuthGuardGuard]},
  {path:'finance', component:TableauBordComptComponent, canActivate:[AuthGuardGuard]},
  {path:'udaComp', component:UDAComptComponent, canActivate:[AuthGuardGuard]},
  {path:'rapport', component:RapportComponent, canActivate:[AuthGuardGuard]},
  {path:'dashbordCli', component:ClinicalDashboardComponent, canActivate:[AuthGuardGuard]},
  {path:'suiviHos', component:SuivitHospiComponent, canActivate:[AuthGuardGuard]},
  {path:'mds', component:SystemDAtaMedComponent, canActivate:[AuthGuardGuard]},
  {path:'com', component:CommunicationComponent, canActivate:[AuthGuardGuard]},
  {path:'order', component:OrdersComponent, canActivate:[AuthGuardGuard]},
  {path:'alldiag', component:AllDiagComponent, canActivate:[AuthGuardGuard]},
  {path:'allprog', component:AllPresComponent, canActivate:[AuthGuardGuard]},
  {path:'labo', component:LabResultComponent, canActivate:[AuthGuardGuard]},
  {path:'risques', component:ManagRiskComponent, canActivate:[AuthGuardGuard]},
  {path:'signes', component:PoidsSignesVComponent, canActivate:[AuthGuardGuard]},
  {path:'uda', component:UDAComptComponent, canActivate:[AuthGuardGuard]},
  {path:'udaCli', component:UDAComponent, canActivate:[AuthGuardGuard]},
  {path:'infection', component:ControlInfectionsComponent, canActivate:[AuthGuardGuard]},
  {path:'patientCli', component:PatientClinicalComponent, canActivate:[AuthGuardGuard]},
  {path:'tharapy', component:TherapyComponent, canActivate:[AuthGuardGuard]},
  {path:'VisiteMed', component:VisitMedicalComponent, canActivate:[AuthGuardGuard]},
  {path:'poids', component:PoidsComponent, canActivate:[AuthGuardGuard]},
  {path:'vaccination', component:VaccinationComponent, canActivate:[AuthGuardGuard]},
  {path:'glucose', component:GlucoseComponent, canActivate:[AuthGuardGuard]},
  {path:'respiration', component:RespirationComponent, canActivate:[AuthGuardGuard]},
  {path:'saturation', component:SpO2Component, canActivate:[AuthGuardGuard]},
  {path:'douleur', component:DouleurComponent, canActivate:[AuthGuardGuard]},
  {path:'tension', component:TensionComponent, canActivate:[AuthGuardGuard]},
  {path:'pools', component:PoolsComponent, canActivate:[AuthGuardGuard]},
  {path:'rfinance', component:RapportFinancierComponent, canActivate:[AuthGuardGuard]},
  {path:'rclinique', component:RapportCliniqueComponent, canActivate:[AuthGuardGuard]},
  {path:'rqualite', component:RapportQualiteComponent, canActivate:[AuthGuardGuard]},
  {path: 'administrator-dashboard', component: AdminDashboardComponent },
  {path: 'clinicalBoard', component: ClinicalDashboardComponent },
  {path: "patientList", component:PatientListComponent, canActivate:[AuthGuardGuard]},
  {path: "addPatient", component:AddPatientComponent, canActivate:[AuthGuardGuard]},
  {path: "allPrescription/id", component:AddPrescriptionComponent, canActivate:[AuthGuardGuard]},
  {path: "addAppointment", component:AddAppointmentComponent, canActivate:[AuthGuardGuard]},
  {path: "appointmentList", component:AppointmentListComponent, canActivate:[AuthGuardGuard]},
  {path: "PatientList/:id", component:PatienDetailsComponent, canActivate:[AuthGuardGuard]},
  {path: "patientCli/:id", component:DetailNurseComponent, canActivate:[AuthGuardGuard]},
  {path: "emar/:id", component:EmarDetailsComponent, canActivate:[AuthGuardGuard]},
  {path: 'editPatient/:id', component: AddPatientComponent, canActivate:[AuthGuardGuard] },
  {path: 'editAppointment/:id', component: AddAppointmentComponent, canActivate:[AuthGuardGuard] },

  { path: 'braden', component: BradenScaleModalComponent },
  { path: 'fall-risk', component: FallRiskComponent },
  { path: 'nutrition', component: NutritionComponent },
  { path: 'patients/:id/wounds', component: PatientListComponent },
  { path: 'patients/:id/wounds/new', component: AssessmentFormComponent },
  { path: 'patients/:id/wounds/:assessmentId', component: PatientDetailComponent},
  { path: '', redirectTo: 'login', pathMatch: 'full' },



  { path: 'patients', loadChildren: () => import('./patients/patients.module').then(m => m.PatientsModule) },
  { path: 'skin-wound', loadChildren: () => import('./features/skin-wound/skin-wound.module').then(m => m.SkinWoundModule) },
  { path: 'admin', loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule) },

  { path: '**', redirectTo: 'patients' },

  
]; 



@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }