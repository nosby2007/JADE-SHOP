import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { HttpClientModule } from '@angular/common/http';

import { AngularFireModule } from '@angular/fire/compat';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { environment } from 'src/environments/environment';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';

import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import {MatCard, MatCardModule} from '@angular/material/card';
import {MAT_FORM_FIELD_DEFAULT_OPTIONS, MatFormFieldModule} from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatStepperModule} from '@angular/material/stepper';
import { FormBuilder, FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { PatientListComponent } from './COMPONENT/patient-list/patient-list.component';
import { PatienDetailsComponent } from './COMPONENT/patien-details/patien-details.component';
import { AppointmentListComponent } from './COMPONENT/appointment-list/appointment-list.component';
import { MatTableModule} from '@angular/material/table';
import {  MatPaginatorModule } from '@angular/material/paginator';
import {MatIconModule} from '@angular/material/icon';
import { CommonModule, DatePipe } from '@angular/common';
import { AddAppointmentComponent } from './COMPONENT/add-appointment/add-appointment.component';
import { AddPatientComponent } from './COMPONENT/add-patient/add-patient.component';
import { LoginComponent } from './Authentification/login/login.component';
import { NavComponent } from './SHAREPAGES/nav/nav.component';
import { HomeComponent } from './COMPONENT/home/home.component';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
import { ClinicalDashboardComponent } from './components/clinical-dashboard/clinical-dashboard.component';
import { POCComponent } from './components/poc/poc.component';
import { EMARComponent } from './components/e-mar/e-mar.component';
import { AllLinksComponent } from './components/all-links/all-links.component';
import { AutresComponent } from './components/autres/autres.component';
import { PatientListAdComponent } from './Administrator/patient-list-ad/patient-list-ad.component';
import { TableauBordComptComponent } from './Administrator/tableau-bord-compt/tableau-bord-compt.component';
import { UDAComptComponent } from './Administrator/udacompt/udacompt.component';
import { RapportComponent } from './Administrator/rapport/rapport.component';
import { PatientClinicalComponent } from './CLINICAL/patient-clinical/patient-clinical.component';
import { SuivitHospiComponent } from './CLINICAL/suivit-hospi/suivit-hospi.component';
import { SystemDAtaMedComponent } from './CLINICAL/system-data-med/system-data-med.component';
import { CommunicationComponent } from './CLINICAL/communication/communication.component';
import { OrdersComponent } from './CLINICAL/orders/orders.component';
import { LabResultComponent } from './CLINICAL/lab-result/lab-result.component';
import { ManagRiskComponent } from './CLINICAL/manag-risk/manag-risk.component';
import { PoidsSignesVComponent } from './CLINICAL/poids-signes-v/poids-signes-v.component';
import { UDAComponent } from './CLINICAL/uda/uda.component';
import { ControlInfectionsComponent } from './CLINICAL/control-infections/control-infections.component';
import { TherapyComponent } from './CLINICAL/therapy/therapy.component';
import { VisitMedicalComponent } from './CLINICAL/visit-medical/visit-medical.component';
import { VaccinationComponent } from './CLINICAL/vaccination/vaccination.component';
import { PoidsComponent } from './CLINICAL/poids/poids.component';
import { RespirationComponent } from './CLINICAL/respiration/respiration.component';
import { GlucoseComponent } from './CLINICAL/glucose/glucose.component';
import { SpO2Component } from './CLINICAL/sp-o2/sp-o2.component';
import { DouleurComponent } from './CLINICAL/douleur/douleur.component';
import { TensionComponent } from './CLINICAL/tension/tension.component';
import { PoolsComponent } from './CLINICAL/pools/pools.component';

import {MatDialogModule} from '@angular/material/dialog';
import { NouveauProComponent } from './Administrator/nouveau-pro/nouveau-pro.component';
import { NewProfessionalComponent } from './Administrator/new-professional/new-professional.component';
import { NewtempComponent } from './FORMULAIRE/newtemp/newtemp.component';
import { DetailNurseComponent } from './FORMULAIRE/detail-nurse/detail-nurse.component';
import { MatExpansionModule } from '@angular/material/expansion';
import {MatTabsModule} from '@angular/material/tabs';
import { PatientUdaModalComponent } from './FORMULAIRE/patient-uda-modal/patient-uda-modal.component';
import { EditPatientComponent } from './COMPONENT/edit-patient/edit-patient.component';
import { EditAppointmentComponent } from './COMPONENT/edit-appointment/edit-appointment.component';
import {MatMenuModule} from '@angular/material/menu';
import { AddPrescriptionComponent } from './FORMULAIRE/add-prescription/add-prescription.component';
import { PharmacyModalComponent } from './FORMULAIRE/pharmacy-modal/pharmacy-modal.component';
import { TimestampToDatePipe } from './timestamp-to-date.pipe';
import { DiagnosticModalComponent } from './FORMULAIRE/diagnostic-modal/diagnostic-modal.component';
import { NutritionModalComponent } from './FORMULAIRE/nutrition-modal/nutrition-modal.component';
import { LaboratoryModalComponent } from './FORMULAIRE/laboratory-modal/laboratory-modal.component';
import { SupplementModalComponent } from './FORMULAIRE/supplement-modal/supplement-modal.component';
import { OtherModalComponent } from './FORMULAIRE/other-modal/other-modal.component';
import {MatRadioModule} from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ProgesModalComponent } from './FORMULAIRE/proges-modal/proges-modal.component';
import { EmarDetailsComponent } from './FORMULAIRE/emar-details/emar-details.component';
import { AllDiagComponent } from './COMPONENT/all-diag/all-diag.component';
import { AllPresComponent } from './COMPONENT/all-pres/all-pres.component';
import { MedDiagnosticComponent } from './FORMULAIRE/med-diagnotic/med-diagnostic.component';

import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { RouterModule,Routes } from '@angular/router';
import { CountDownModalComponent } from './FORMULAIRE/count-down-modal/count-down-modal.component';
import { AuthModalComponent } from './FORMULAIRE/auth-modal/auth-modal.component';
import { AllergyModalComponent } from './FORMULAIRE/allergy-modal/allergy-modal.component';
import { VaccinationModalComponent } from './FORMULAIRE/vaccination-modal/vaccination-modal.component';
import { DoctorModalComponent } from './FORMULAIRE/doctor-modal/doctor-modal.component';
import { ContactModalComponent } from './FORMULAIRE/contact-modal/contact-modal.component';
import { CensusLogModalComponent } from './FORMULAIRE/census-log-modal/census-log-modal.component';
import { VitalsModalComponent } from './FORMULAIRE/vitals-modal/vitals-modal.component';
import { RapportCliniqueComponent } from './RAPPORT/rapport-clinique/rapport-clinique.component';
import { RapportFinancierComponent } from './RAPPORT/rapport-financier/rapport-financier.component';
import { RapportQualiteComponent } from './RAPPORT/rapport-qualite/rapport-qualite.component';
import { BradenScaleModalComponent } from './FORMULAIRE/braden-scale-modal/braden-scale-modal.component';
import { AssessmentModalComponent } from './FORMULAIRE/assessment-modal/assessment-modal.component';
import { FallRiskComponent } from './FORMULAIRE/fall-risk/fall-risk.component';
import { NutritionComponent } from './FORMULAIRE/nutrition/nutrition.component';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { AnbiotiqueModalComponent } from './FORMULAIRE/anbiotique-modal/anbiotique-modal.component';


const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'details/:id', component: DetailNurseComponent },
];



@NgModule({
  declarations: [
    AppComponent,
    PatientListComponent,
    PatienDetailsComponent,
    AddPatientComponent,
    AddAppointmentComponent,
    AppointmentListComponent,
    LoginComponent,
    NavComponent,
    HomeComponent,
    AdminDashboardComponent,
    ClinicalDashboardComponent,
    POCComponent,
    EMARComponent,
    AllLinksComponent,
    AutresComponent,
    PatientListAdComponent,AllergyModalComponent,
    TableauBordComptComponent,
    UDAComptComponent,
    RapportComponent,
    PatientClinicalComponent,
    SuivitHospiComponent,
    SystemDAtaMedComponent,
    CommunicationComponent,
    OrdersComponent,
    LabResultComponent,
    ManagRiskComponent,
    PoidsSignesVComponent,
    UDAComponent,
    ControlInfectionsComponent,
    TherapyComponent,
    VisitMedicalComponent,
    VaccinationComponent,
    PoidsComponent,
    RespirationComponent,
    GlucoseComponent,
    SpO2Component,
    DouleurComponent,
    TensionComponent,
    PoolsComponent,
    NouveauProComponent,
    NewProfessionalComponent,
    NewtempComponent,
    DetailNurseComponent,
    PatientUdaModalComponent,
    EditPatientComponent,
    EditAppointmentComponent,
    AddPrescriptionComponent,
    PharmacyModalComponent,
    TimestampToDatePipe,
    DiagnosticModalComponent,
    NutritionModalComponent,
    LaboratoryModalComponent,
    SupplementModalComponent,
    OtherModalComponent,
    ProgesModalComponent,
    EmarDetailsComponent,
    MedDiagnosticComponent,
    AllDiagComponent,
    AllPresComponent,
    CountDownModalComponent,
    AuthModalComponent,
    VaccinationModalComponent,
    DoctorModalComponent,
    ContactModalComponent,
    CensusLogModalComponent,
    VitalsModalComponent,
    RapportCliniqueComponent,
    RapportFinancierComponent,
    RapportQualiteComponent,
    BradenScaleModalComponent,
    AssessmentModalComponent,
    FallRiskComponent,
    NutritionComponent,
    AnbiotiqueModalComponent
    
    
    
   
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    AngularFireModule.initializeApp(environment.firebase),
    provideFirestore(() => getFirestore()),
    AngularFirestoreModule,
    AngularFireAuthModule,
    BrowserAnimationsModule,
    MatSlideToggleModule,
    DatePipe,

    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatNativeDateModule,
    MatDatepickerModule,
    MatProgressBarModule,
    MatStepperModule,
    MatButtonModule,
    MatTableModule,
    MatPaginatorModule,
    MatIconModule,
    MatCardModule,
    MatDialogModule,
    MatExpansionModule,
    MatButtonModule,
    MatTabsModule,
    MatMenuModule,
    MatDialogModule,
    MatButtonModule,
    MatRadioModule,
    MatCheckboxModule,
    RouterModule.forRoot(routes),
    MatTooltipModule
    
    
    
    
    
  ],
  providers: [ {provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: {floatLabel: 'always'}}, { provide: LocationStrategy, useClass: HashLocationStrategy }],
  bootstrap: [AppComponent]
})
export class AppModule { }
