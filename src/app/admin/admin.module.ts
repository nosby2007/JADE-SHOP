import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { AdminRoutingModule } from './admin-routing.module';
import { AdminUserListComponent } from './pages/admin-user-list/admin-user-list.component';
import { AddUserDialogComponent } from './components/add-user-dialog/add-user-dialog.component';
import { AdminShellComponent } from './shell/admin-shell/admin-shell.component';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatListModule} from '@angular/material/list';
import {MatToolbarModule} from '@angular/material/toolbar';
import { AdminDashbordComponent } from './pages/admin-dashboard/admin-dashbord/admin-dashbord.component';
import { AdminGuard } from './guards/admin.guard';

@NgModule({
  declarations: [AdminUserListComponent, AddUserDialogComponent, AdminShellComponent, AdminDashbordComponent],
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    AdminRoutingModule,

    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDialogModule,
    MatTableModule,
    MatChipsModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatSidenavModule,
    MatListModule,
    MatToolbarModule
  ],
  providers: [AdminGuard],
})

export class AdminModule {}
