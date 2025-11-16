import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FilePreviewPipe } from '../file-preview.pipe';
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog/confirm-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { PatientDemographicCardComponent } from './patient-demographic-card/patient-demographic-card.component';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatListModule } from '@angular/material/list';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';

import { MatSortModule } from '@angular/material/sort';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DocumentDialogComponent } from './confirm-dialog/nurse/pages/document-dialog/document-dialog.component';
import { DocumentsComponent } from './confirm-dialog/nurse/pages/document/document.component';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { ReceptionPaymentComponent } from './confirm-dialog/nurse/pages/reception-payment/reception-payment.component';
import { InvoiceViewEditDialogComponent } from './confirm-dialog/nurse/pages/invoice-view-edit-dialog/invoice-view-edit-dialog.component';
import { PaymentEditDialogComponent } from './confirm-dialog/nurse/pages/payment-edit-dialog/payment-edit-dialog.component';

import { AppointmentDialogComponent } from './confirm-dialog/nurse/pages/appointment-dialog/appointment-dialog.component';
import { PatientAppointmentsComponent } from './confirm-dialog/nurse/pages/patient-appointments/patient-appointments.component';



@NgModule({
  declarations: [FilePreviewPipe, ConfirmDialogComponent, PatientDemographicCardComponent, DocumentDialogComponent, DocumentsComponent, ReceptionPaymentComponent, 
    InvoiceViewEditDialogComponent, PaymentEditDialogComponent, PatientAppointmentsComponent, AppointmentDialogComponent,],
  imports: [CommonModule,
    MatDialogModule,
    ReactiveFormsModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatCardModule,
    MatSelectModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    FormsModule,
    MatSortModule,
    MatChipsModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatInputModule,
    MatRadioModule,


  ],
  exports: [FilePreviewPipe, PatientDemographicCardComponent, DocumentsComponent, ReceptionPaymentComponent, PatientAppointmentsComponent]   // ⬅️ on exporte pour l’utiliser dans d’autres modules
})
export class SharedModule { }
