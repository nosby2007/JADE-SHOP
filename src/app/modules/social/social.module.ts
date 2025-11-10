import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SocialRoutingModule } from './social-routing.module';
import { SocialListComponent } from './pages/social-list/social-list.component';
import { SocialCreateDialogComponent } from './pages/social-create-dialog/social-create-dialog.component';
import { SheelComponent } from './pages/sheel/sheel.component';
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
    SocialListComponent,
    SocialCreateDialogComponent,
    SheelComponent
  ],
  imports: [
    CommonModule,
    SocialRoutingModule,
    ReactiveFormsModule,
    MatTableModule, MatButtonModule, MatIconModule,
    MatDialogModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatDatepickerModule, MatNativeDateModule,
    MatCheckboxModule, MatSnackBarModule, MatProgressBarModule
  ]
})
export class SocialModule { }
