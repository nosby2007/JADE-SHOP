import { Component, OnInit } from '@angular/core';
import { OderDetailsService } from 'src/app/service/oder-details.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit {


  constructor(private service:OderDetailsService){}
  
  clothesData: any;

  ngOnInit(): void {
    this.clothesData = this.service.clothesDetails;
  }
  scrollToSection(){}

}
