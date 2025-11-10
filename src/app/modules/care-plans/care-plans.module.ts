import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CarePlansRoutingModule } from './care-plans-routing.module';
import { CarePlanListComponent } from './pages/care-plan-list/care-plan-list.component';
import { CarePlanCreateDialogComponent } from './pages/care-plan-create-dialog/care-plan-create-dialog.component';
import { InterventionListComponent } from './pages/intervention-list/intervention-list.component';
import { InterventionCreateDialogComponent } from './pages/intervention-create-dialog/intervention-create-dialog.component';
import { CarePlanShellComponent } from './pages/care-plan-shell/care-plan-shell.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';


@NgModule({
  declarations: [
    CarePlanListComponent,
    CarePlanCreateDialogComponent,
    InterventionListComponent,
    InterventionCreateDialogComponent,
    CarePlanShellComponent
  ],
  imports: [
    CommonModule,
  ReactiveFormsModule,
  MatTableModule, MatButtonModule, MatIconModule,
  MatDialogModule, MatFormFieldModule, MatInputModule,
  MatSelectModule, MatDatepickerModule, MatNativeDateModule,
  MatCheckboxModule, MatSnackBarModule, MatProgressBarModule,
    CarePlansRoutingModule
  ]
})
export class CarePlansModule { }
