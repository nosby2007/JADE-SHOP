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
import { NurseAssessmentComponent } from './pages/nurse-assessment/nurse-assessment.component';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';



@NgModule({
  declarations: [NurseShellComponent, NurseDashboardComponent, NursePatientListComponent, NursePatientDetailComponent, NursePrescriptionsComponent, NurseTasksComponent, NurseAssessmentComponent],
  imports: [
    CommonModule,
    NurseRoutingModule,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule, FormsModule, ReactiveFormsModule,
    // UI
    MatSidenavModule, MatToolbarModule, MatListModule, MatIconModule, MatButtonModule, MatCardModule,
    MatTableModule, MatFormFieldModule, MatInputModule, MatDividerModule,MatProgressSpinnerModule,
    MatSnackBarModule,  MatCheckboxModule , MatNativeDateModule, MatDatepickerModule, MatSelectModule, MatTabsModule,
  ]
})
export class NurseModule {}
