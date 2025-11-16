import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProviderRoutingModule } from './provider-routing.module';
import { ProviderDashboardComponent } from './pages/provider-dashboard/provider-dashboard.component';
import { ProviderListComponent } from './pages/provider-list/provider-list.component';
import { ProviderDetailComponent } from './pages/provider-detail/provider-detail.component';
import { ProviderCreateDialogComponent } from './pages/provider-create-dialog/provider-create-dialog.component';
import { ProviderEditDialogComponent } from './pages/provider-edit-dialog/provider-edit-dialog.component';
import { EncounterListComponent } from './pages/encounter-list/encounter-list.component';
import { EncounterCreateDialogComponent } from './pages/encounter-create-dialog/encounter-create-dialog.component';
import { OrderListComponent } from './pages/order-list/order-list.component';
import { OrderCreateDialogComponent } from './pages/order-create-dialog/order-create-dialog.component';
import { PrescriptionListComponent } from './pages/prescription-list/prescription-list.component';
import { PrescriptionCreateDialogComponent } from './pages/prescription-create-dialog/prescription-create-dialog.component';
import { NoteListComponent } from './pages/note-list/note-list.component';
import { NoteCreateDialogComponent } from './pages/note-create-dialog/note-create-dialog.component';
import { ReferralListComponent } from './pages/referral-list/referral-list.component';
import { ReferralCreateDialogComponent } from './pages/referral-create-dialog/referral-create-dialog.component';
import { LabListComponent } from './pages/lab-list/lab-list.component';
import { LabOrderDialogComponent } from './pages/lab-order-dialog/lab-order-dialog.component';
import { ImagingListComponent } from './pages/imaging-list/imaging-list.component';
import { ImagingOrderDialogComponent } from './pages/imaging-order-dialog/imaging-order-dialog.component';
import { ScheduleComponent } from './pages/schedule/schedule.component';
import { SignatureDialogComponent } from './pages/signature-dialog/signature-dialog.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
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
import { ProviderShellComponent } from './pages/provider-shell/provider-shell.component';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgxEchartsModule } from 'ngx-echarts';
import { NurseRoutingModule } from 'src/app/nurse/nurse-routing.module';
import { provideFirebaseApp } from '@angular/fire/app';
import { provideAuth } from '@angular/fire/auth';
import { provideFirestore } from '@angular/fire/firestore';
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { environment } from 'src/environments/environment';
import * as echarts from 'echarts';
import { ViewNoteDialogComponent } from './pages/view-note-dialog/view-note-dialog.component';
import { MatChipsModule } from '@angular/material/chips';
import { ViewLabsDialogComponent } from './pages/view-labs-dialog/view-labs-dialog.component';
import { SharedModule } from 'src/app/shared/shared.module';


@NgModule({
  declarations: [
    ProviderDashboardComponent,
    ProviderListComponent,
    ProviderDetailComponent,
    ProviderCreateDialogComponent,
    ProviderEditDialogComponent,
    EncounterListComponent,
    EncounterCreateDialogComponent,
    OrderListComponent,
    OrderCreateDialogComponent,
    PrescriptionListComponent,
    PrescriptionCreateDialogComponent,
    NoteListComponent,
    NoteCreateDialogComponent,
    ReferralListComponent,
    ReferralCreateDialogComponent,
    LabListComponent,
    LabOrderDialogComponent,
    ImagingListComponent,
    ImagingOrderDialogComponent,
    ScheduleComponent,
    SignatureDialogComponent,
    ProviderShellComponent,
    ViewNoteDialogComponent,
    ViewLabsDialogComponent
  ],
  imports: [
    CommonModule,
    ProviderRoutingModule,
    ReactiveFormsModule,
    MatTableModule, MatIconModule,
    MatDialogModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatDatepickerModule, MatNativeDateModule,
    MatCheckboxModule, MatSnackBarModule, MatProgressBarModule,
     CommonModule,
        NurseRoutingModule,
        MatSidenavModule,
        MatToolbarModule,
        MatListModule,
        MatIconModule,
        MatButtonModule,
        MatCardModule, FormsModule, ReactiveFormsModule,
        MatDividerModule, MatInputModule, MatTableModule, MatProgressSpinnerModule,
        MatRadioModule, MatMenuModule, MatProgressBarModule, MatTooltipModule, MatTooltipModule, MatCardModule, MatIconModule, SharedModule,

        // UI
        MatSnackBarModule, MatCheckboxModule, MatNativeDateModule, MatDatepickerModule, MatSelectModule, MatTabsModule, MatDialogModule, MatInputModule,
        MatChipsModule, 
        provideFirebaseApp(() => initializeApp(environment.firebase)),
            provideAuth(() => getAuth()),
            provideFirestore(() => getFirestore()),
            NgxEchartsModule.forRoot({ echarts }), 
  ]
})
export class ProviderModule { }
