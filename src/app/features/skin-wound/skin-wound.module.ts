import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { PatientDetailComponent } from './pages/patient-detail/patient-detail.component';
import { PatientsListComponent } from './pages/patients-list/patients-list.component';
import { WoundDetailComponent } from './pages/wound-detail/wound-detail.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { AssessmentFormComponent } from './components/assessment-form/assessment-form.component';

@NgModule({
  declarations: [
    PatientsListComponent,
    PatientDetailComponent,
    WoundDetailComponent,
    DashboardComponent,
    AssessmentFormComponent,

  ],
  imports: [
    CommonModule,
    RouterModule.forChild([
      { path: '', component: PatientsListComponent },
      { path: 'patient/:id', component: PatientDetailComponent },
      { path: 'wound/:id', component: WoundDetailComponent },
      { path: '', component: DashboardComponent }
    ]),
    ReactiveFormsModule,  // << requis pour [formGroup] et formControlName
    FormsModule,           // << requis pour [ngModel] / [ngValue]
    MatInputModule, MatSelectModule, MatRadioModule, MatCheckboxModule,
    MatDatepickerModule, MatNativeDateModule,
    MatTableModule, MatIconModule, MatButtonModule,
    MatCardModule, MatPaginatorModule, MatSortModule,MatChipsModule
  ]
})
export class SkinWoundModule {}
