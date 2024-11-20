import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OderDetailsService } from '../service/oder-details.service';

@Component({
  selector: 'app-pantalon-page',
  templateUrl: './pantalon-page.component.html',
  styleUrls: ['./pantalon-page.component.scss']
})
export class PantalonPageComponent implements OnInit {

  constructor(private param:ActivatedRoute, private service:OderDetailsService) {}
 
 getpantalonId:any;
  pantalonData: any;
  contact:any;

  ngOnInit(): void {
    /* this.getpantalonId = this.param.snapshot.paramMap.get('id');
    console.log(this.getpantalonId,'getpantalon');

    if (this.getpantalonId) {
      this.pantalonData = this.service.pantalon.filter((value)=>{
        return value.id == this.getpantalonId
      });
      console.log(this.pantalonData,'calecondata>>');
    }*/

  }

  onSubmitContactForm(){}
  scrollToSection(contact:any){}

}
