import { Component, OnInit } from '@angular/core';
import { OderDetailsService } from 'src/app/service/oder-details.service';
@Component({
  selector: 'app-calecon',
  templateUrl: './calecon.component.html',
  styleUrls: ['./calecon.component.scss']
})
export class CaleconComponent implements OnInit {

  constructor(private service:OderDetailsService) { }
  caleconData : any;

  ngOnInit(): void {
  }

}
