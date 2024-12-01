import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CaleconPageComponent } from './calecon-page/calecon-page.component';
import { LoginComponent } from './component/login/login.component';
import { RegisterComponent } from './component/register/register.component';
import { PantalonComponent } from './page/pantalon/pantalon.component';
import { AboutComponent } from './pages/about/about.component';
import { CaleconComponent } from './pages/calecon/calecon.component';
import { CartComponent } from './pages/cart/cart.component';
import { ContactComponent } from './pages/contact/contact.component';
import { HomeComponent } from './pages/home/home.component';
import { MenuComponent } from './pages/menu/menu.component';
import { MenupagesComponent } from './pages/menupages/menupages.component';
import { ProductsComponent } from './pages/products/products.component';
import { PantalonPageComponent } from './pantalon-page/pantalon-page.component';
import { AddProductComponent } from './pages/add-product/add-product.component';
import { SearchComponent } from './search/search.component';
import { DetailsComponent } from './details/details.component';
import { ReservationComponent } from './component/reservation/reservation.component';
import { BlogComponent } from './component/blog/blog.component';
import { PostDetailsComponent } from './component/post-details/post-details.component';
import { PostsComponent } from './component/posts/posts.component';

const routes: Routes = [
  {path: '', redirectTo:'home', pathMatch:'full'},
  {path: "login", component:LoginComponent},
  {path: "register", component:RegisterComponent},
  {path: "home", component:HomeComponent},
  {path: "menu", component:MenuComponent},
  {path: "about", component:AboutComponent},
  {path: "product", component:ProductsComponent},
  {path: "contact", component:ContactComponent},
  {path: "calecons", component:CaleconComponent},
  {path: "blog", component:BlogComponent},
  {path: "posts", component:PostsComponent},
  {path: "addProduct", component:AddProductComponent},
  {path: "pantalon", component:PantalonComponent},
  {path: "cart", component:CartComponent},
  {path:"menu/:id", component:MenupagesComponent},
  {path:"calecon", component:CaleconPageComponent},
  {path:"lon", component:PantalonPageComponent},
  { path: 'search', component: SearchComponent },
  { path: 'details/:id', component: DetailsComponent },
  { path: 'reservation', component: ReservationComponent },
  { path: 'post/:id', component: PostDetailsComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
