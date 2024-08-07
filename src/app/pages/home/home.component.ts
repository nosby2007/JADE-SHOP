import { Component, OnInit } from '@angular/core';
import { OderDetailsService } from 'src/app/service/oder-details.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  constructor(private service:OderDetailsService){}
  
  clothesData: any;


  ngOnInit(): void {
    this.clothesData = this.service.clothesDetails;


  };
}
