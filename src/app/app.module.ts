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
import { NgConfirmModule } from 'ng-confirm-box';
import { CommonModule, DatePipe } from '@angular/common';
import { AddAppointmentComponent } from './COMPONENT/add-appointment/add-appointment.component';
import { AddPatientComponent } from './COMPONENT/add-patient/add-patient.component';
import { LoginComponent } from './Authentification/login/login.component';
import { NavComponent } from './SHAREPAGES/nav/nav.component';
import { HomeComponent } from './COMPONENT/home/home.component';

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
    HomeComponent
    
   
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    AngularFireModule.initializeApp(environment.firebase),
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
    NgConfirmModule,
    MatCardModule,
    CommonModule
    
    
    
  ],
  providers: [ {provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: {floatLabel: 'always'}}],
  bootstrap: [AppComponent]
})
export class AppModule { }
