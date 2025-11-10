import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InvoiceListComponent } from './pages/invoice-list/invoice-list.component';

const routes: Routes = [
  // Define finance related routes here
  { path: '', component: InvoiceListComponent }, // default when lazy-loaded
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FinanceRoutingModule { }
