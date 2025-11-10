// src/app/nurse/nurse.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NurseRoutingModule } from './nurse-routing.module';

import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

import { NurseShellComponent } from './shell/nurse-shell/nurse-shell.component';
import { NurseDashboardComponent } from './pages/nurse-dashboard/nurse-dashboard.component';
import { NursePatientListComponent } from './pages/nurse-patient-list/nurse-patient-list.component';
import { NursePatientDetailComponent } from './pages/nurse-patient-detail/nurse-patient-detail.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NursePrescriptionsComponent } from './pages/nurse-prescriptions/nurse-prescriptions.component';
import { NurseTasksComponent } from './pages/nurse-tasks/nurse-tasks.component';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { SafeDatePipe } from './pages/nurse-tasks/safe-date.pipe';
import { MatChipsModule } from "@angular/material/chips";
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { environment } from 'src/environments/environment';
import { AddAssessmentDialogComponent } from './pages/add-assessment-dialog/add-assessment-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';
import { NurseAssessmentsComponent } from './pages/nurse-assessment/nurse-assessment.component';
import { VitalsTrendDialogComponent } from './pages/vitals-trend-dialog/vitals-trend-dialog.component';
import {MatRadioModule} from '@angular/material/radio';

import { NgxEchartsModule } from 'ngx-echarts';
import * as echarts from 'echarts';
import { AddPrescriptionDialogComponent } from './pages/add-prescription-dialog/add-prescription-dialog.component';
import { MatMenuModule } from '@angular/material/menu';
import { PharmacyRxDialogComponent } from './pages/nurse-prescriptions/prescription-dialog/pharmacy-rx-dialog/pharmacy-rx-dialog.component';
import { LaboratoryRxDialogComponent } from './pages/nurse-prescriptions/prescription-dialog/laboratory-rx-dialog/laboratory-rx-dialog.component';
import { NutritionRxDialogComponent } from './pages/nurse-prescriptions/prescription-dialog/nutrition-rx-dialog/nutrition-rx-dialog.component';
import { OrderRxDialogComponent } from './pages/nurse-prescriptions/prescription-dialog/order-rx-dialog/order-rx-dialog.component';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ViewOrderDialogComponent } from './pages/view-order-dialog/view-order-dialog.component';
import { NurseLabListComponent } from './pages/nurse-lab-list/nurse-lab-list.component';



@NgModule({
  declarations: [NurseShellComponent, NurseDashboardComponent, 
    NursePatientListComponent, 
    NursePatientDetailComponent, 
    NursePrescriptionsComponent, 
    NurseTasksComponent, 
    SafeDatePipe, 
    AddAssessmentDialogComponent, 
    NurseAssessmentsComponent, 
    VitalsTrendDialogComponent, 
    AddPrescriptionDialogComponent, 
    PharmacyRxDialogComponent, 
    LaboratoryRxDialogComponent, 
    NutritionRxDialogComponent, 
    OrderRxDialogComponent, ViewOrderDialogComponent, 
    NurseLabListComponent
  ],
    
  imports: [
    CommonModule,
    NurseRoutingModule,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule, FormsModule, ReactiveFormsModule,
    MatDividerModule, MatFormFieldModule, MatInputModule, MatTableModule, MatProgressSpinnerModule,
    MatRadioModule, MatMenuModule, MatProgressBarModule, MatTooltipModule, MatTooltipModule, MatCardModule, MatIconModule,

    // UI
    MatSnackBarModule, MatCheckboxModule, MatNativeDateModule, MatDatepickerModule, MatSelectModule, MatTabsModule, MatDialogModule,
    NgxEchartsModule.forRoot({ echarts }),
    MatInputModule,
    MatChipsModule, provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
]
})
export class NurseModule {}
