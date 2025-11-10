import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FinanceRoutingModule } from './finance-routing.module';
import { InvoiceListComponent } from './pages/invoice-list/invoice-list.component';
import { InvoiceCreateDialogComponent } from './pages/invoice-create-dialog/invoice-create-dialog.component';
import { PaymentListComponent } from './pages/payment-list/payment-list.component';
import { PaymentCreateDialogComponent } from './pages/payment-create-dialog/payment-create-dialog.component';
import { PriceListComponent } from './pages/price-list/price-list.component';
import { PriceCreateDialogComponent } from './pages/price-create-dialog/price-create-dialog.component';
import { ClaimListComponent } from './pages/claim-list/claim-list.component';
import { ClaimCreateDialogComponent } from './pages/claim-create-dialog/claim-create-dialog.component';
import { ShellComponent } from './pages/shell/shell.component';
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
    InvoiceListComponent,
    InvoiceCreateDialogComponent,
    PaymentListComponent,
    PaymentCreateDialogComponent,
    PriceListComponent,
    PriceCreateDialogComponent,
    ClaimListComponent,
    ClaimCreateDialogComponent,
    ShellComponent
  ],
  imports: [
    CommonModule,
    FinanceRoutingModule,
    ReactiveFormsModule,
    MatTableModule, MatButtonModule, MatIconModule,
    MatDialogModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatDatepickerModule, MatNativeDateModule,
    MatCheckboxModule, MatSnackBarModule, MatProgressBarModule
  ]
})
export class FinanceModule { }
