import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import {ActivatedRoute} from '@angular/router';
import {  Observable, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { ProduitServiceService } from 'src/app/produit-service.service';
import { OderDetailsService } from 'src/app/service/oder-details.service';

interface Item {
  id?: string;
  category: string;
  nom: string;
  prix: number;
  description: string;
  image: string;
  rating:number;
  }


@Component({
  selector: 'app-menupages',
  templateUrl: './menupages.component.html',
  styleUrls: ['./menupages.component.scss']
})
export class MenupagesComponent implements OnInit {
   
  item$: Observable<Item| undefined> | null = null; // observable for the item data
  
  constructor(private param:ActivatedRoute, private service:OderDetailsService, private afs:ProduitServiceService, private firestore: AngularFirestore) {}
 
  getMenuId:any;
  menuData: any;

  ngOnInit(): void {
    //retrieve the 'id' parameter from the url
    const id = this.param.snapshot.paramMap.get('id');
    if (id){
      //fetch the document from firestore by ID
      this.item$ = this.afs.getItem(id).pipe(
        catchError(error => {
          console.error('Error fetching item:', error);
      return of (undefined);
                  }),
      );
    }else {
      console.error('no valid ID provided in route');
      this.item$ = of(undefined);
      
    }


    this.getMenuId = this.param.snapshot.paramMap.get('id');
    console.log(this.getMenuId,'getmenu');

    if (this.getMenuId) {
      this.menuData = this.service.clothesDetails.filter((value)=>{
        return value.id == this.getMenuId
      });
      console.log(this.menuData,'menudata>>');
    }

  }
  videoIcon:string = "./assets/img/play.png";
  play:string = "Play";
  videodisabled:boolean = true;

  changeImg(){
    if(this.play == "Play")
    {
      this.play = "Pause",
      this.videoIcon = "/assets/img/pause.png",
      this.videodisabled = false
    }
    else
    {
      this.videoIcon = "./assets/images/play.png",
      this.play = "Play",
      this.videodisabled = true
    }
  }
 

}
