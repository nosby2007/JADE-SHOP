import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OderDetailsService } from '../service/oder-details.service';
@Component({
  selector: 'app-calecon-page',
  templateUrl: './calecon-page.component.html',
  styleUrls: ['./calecon-page.component.scss']
})
export class CaleconPageComponent implements OnInit {

  constructor(private param:ActivatedRoute, private service:OderDetailsService) {}
 
  

  ngOnInit(): void {
   

  }

}
