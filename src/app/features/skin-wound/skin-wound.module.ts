import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';

import { SkinWoundRoutingModule } from './skin-wound-routing.module';


import { AssessmentFormComponent } from './components/assessment-form/assessment-form.component';
import { SkinWoundDashboardComponent } from './pages/skin-wound-dashboard/skin-wound-dashboard.component';
import { AssessmentListComponent } from './pages/assessment-list/assessment-list.component';
import { AssessmentDetailComponent } from './pages/assessment-detail/assessment-detail.component';

import { WoundDetailComponent } from './pages/wound-detail/wound-detail.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { AngularFireStorageModule } from '@angular/fire/compat/storage';
import { SharedModule } from 'src/app/shared/shared.module';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MediaGalleryComponent } from './pages/media-gallery/media-gallery.component';


@NgModule({
  declarations: [
   
    AssessmentFormComponent,
        SkinWoundDashboardComponent,
        AssessmentListComponent,
        AssessmentDetailComponent,
        WoundDetailComponent,
        DashboardComponent,
        MediaGalleryComponent
        
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,

    // Material
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatSelectModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    MatPaginatorModule,
    MatSortModule,

    SkinWoundRoutingModule,
    SharedModule,
    AngularFireStorageModule,
    MatProgressBarModule,
    MatDividerModule
  ]
})
export class SkinWoundModule {}
