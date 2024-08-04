import { Component, OnInit } from '@angular/core';
import { OderDetailsService } from 'src/app/service/oder-details.service';

@Component({
  selector: 'app-pantalon',
  templateUrl: './pantalon.component.html',
  styleUrls: ['./pantalon.component.scss']
})
export class PantalonComponent implements OnInit {
  

  constructor(private service:OderDetailsService) {}
pantalonData : any;

  ngOnInit(): void {
    
  }

}
