import { Component, OnInit } from '@angular/core';
import { HammerLoader } from '@angular/platform-browser';
import { CartServiceService } from 'src/app/services/cart-service.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {

  public totalItem: number = 0;
  public searchTerm !: string;
  public filterCategory: any;
  public productList: any;
loggedInUser: any;
  constructor(private cartServiceServive: CartServiceService) { }


  ngOnInit(): void {
    this.cartServiceServive.getProducts().subscribe(res=>{
      this.totalItem = res.length;
    })
  }
  search(event:any){
    this.searchTerm = (event.target as HTMLInputElement).value;
    console.log(this.searchTerm);
    this.cartServiceServive.search.next(this.searchTerm);
    
  }
  filter(category: string){
    this.filterCategory= this.productList.filter((a:any)=>{
      if(a.category == category || category==''){
        return a;
      }
    })

  }
}
