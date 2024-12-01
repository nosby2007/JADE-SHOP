import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavbarComponent } from './sharePage/navbar/navbar.component';
import { FooterComponent } from './sharePage/footer/footer.component';
import { HomeComponent } from './pages/home/home.component';
import { MenuComponent } from './pages/menu/menu.component';
import { AboutComponent } from './pages/about/about.component';
import { ContactComponent } from './pages/contact/contact.component';
import { MenupagesComponent } from './pages/menupages/menupages.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CaleconComponent } from './pages/calecon/calecon.component';
import { CaleconPageComponent } from './calecon-page/calecon-page.component';
import { PantalonComponent } from './page/pantalon/pantalon.component';
import { PantalonPageComponent } from './pantalon-page/pantalon-page.component';
import { CartComponent } from './pages/cart/cart.component';
import { ProductsComponent } from './pages/products/products.component';
import { FilterPipe } from './sharePage/filter.pipe';
import { LoginComponent } from './component/login/login.component';
import { RegisterComponent } from './component/register/register.component';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { environment } from 'src/environments/environment';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { AddProductComponent } from './pages/add-product/add-product.component';
import { AboutUsComponent } from './pages/about-us/about-us.component';
import { SearchComponent } from './search/search.component';
import { DetailsComponent } from './details/details.component';
import { ReservationComponent } from './component/reservation/reservation.component';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import {MatCardModule} from '@angular/material/card';
import {MAT_FORM_FIELD_DEFAULT_OPTIONS, MatFormFieldModule} from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatStepperModule} from '@angular/material/stepper';
import { BlogComponent } from './component/blog/blog.component';
import { MatButtonModule } from '@angular/material/button';
import { PostDetailsComponent } from './component/post-details/post-details.component';
import { PostsComponent } from './component/posts/posts.component';


@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    FooterComponent,
    HomeComponent,
    MenuComponent,
    AboutComponent,
    ContactComponent,
    MenupagesComponent,
    CaleconComponent,
    CaleconPageComponent,
    PantalonComponent,
    PantalonPageComponent,
    CartComponent,
    ProductsComponent,
    FilterPipe,
    LoginComponent,
    RegisterComponent,
    AddProductComponent,
    AddProductComponent,
    AboutUsComponent,
    SearchComponent,
    DetailsComponent,
    ReservationComponent,
    BlogComponent,
    PostDetailsComponent,
    PostsComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule,
    AngularFireAuthModule,
    BrowserAnimationsModule,
    MatSlideToggleModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatNativeDateModule,
    MatDatepickerModule,
    MatProgressBarModule,
    MatStepperModule,
    MatButtonModule
    
    
  ],
  providers: [ {provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: {floatLabel: 'always'}}],
  bootstrap: [AppComponent]
})
export class AppModule { }
