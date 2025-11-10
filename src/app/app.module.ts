import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

import { HttpClientModule } from '@angular/common/http';

import { AngularFireModule } from '@angular/fire/compat';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { environment } from 'src/environments/environment';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';

import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import {MatCard, MatCardModule} from '@angular/material/card';
import {MAT_FORM_FIELD_DEFAULT_OPTIONS, MatFormFieldModule} from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatStepperModule} from '@angular/material/stepper';
import { FormBuilder, FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule} from '@angular/material/table';
import {  MatPaginatorModule } from '@angular/material/paginator';
import {MatIconModule} from '@angular/material/icon';
import { CommonModule, DatePipe } from '@angular/common';

import {MatDialogModule} from '@angular/material/dialog';

import { MatExpansionModule } from '@angular/material/expansion';
import {MatTabsModule} from '@angular/material/tabs';

import {MatMenuModule} from '@angular/material/menu';

import { TimestampToDatePipe } from './timestamp-to-date.pipe';
import {MatRadioModule} from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';


import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { RouterModule,Routes } from '@angular/router';

import { provideFirestore, getFirestore } from '@angular/fire/firestore';

import { MatSortModule } from '@angular/material/sort';
import { MatChipsModule } from '@angular/material/chips';
import { AuthTokenInterceptor } from './core/token.interceptor';
import { REGION } from '@angular/fire/compat/functions';
import { LoginComponent } from './authetification/login/login.component';
import { AccountDialogComponent } from './COMPONENT/account-dialog/account-dialog.component';





const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
];



@NgModule({
  declarations: [
    AppComponent,
    TimestampToDatePipe,
    LoginComponent,
    AccountDialogComponent,
    
    
    
   
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    AngularFireModule.initializeApp(environment.firebase),
    provideFirestore(() => getFirestore()),
    AngularFirestoreModule,
    AngularFireAuthModule,
    BrowserAnimationsModule,
    MatSlideToggleModule,
    DatePipe,
    MatIconModule,

    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatNativeDateModule,
    MatDatepickerModule,
    MatProgressBarModule,
    MatStepperModule,
    MatButtonModule,
    MatTableModule,
    MatPaginatorModule,
    MatIconModule,
    MatCardModule,
    MatDialogModule,
    MatExpansionModule,
    MatButtonModule,
    MatTabsModule,
    MatMenuModule,
    MatDialogModule,
    MatButtonModule,
    MatRadioModule,
    MatCheckboxModule,
    RouterModule.forRoot(routes),
    MatTooltipModule, MatInputModule, MatSelectModule, MatRadioModule, MatCheckboxModule,
    MatDatepickerModule, MatNativeDateModule,
    MatTableModule, MatIconModule, MatButtonModule,
    MatCardModule, MatPaginatorModule, MatSortModule, MatChipsModule, CommonModule,

    
    
    
    
    
    
  ],
  providers: [ {provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: {floatLabel: 'always'}}, { provide: LocationStrategy, useClass: HashLocationStrategy }
    ,  { provide: HTTP_INTERCEPTORS, useClass: AuthTokenInterceptor, multi: true },
    { provide: REGION, useValue: 'us-central1' }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }