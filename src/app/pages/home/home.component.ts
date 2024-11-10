import { Component, OnInit } from '@angular/core';
import { OderDetailsService } from 'src/app/service/oder-details.service';
import { AngularFirestore,AngularFirestoreCollection,AngularFirestoreDocument } from '@angular/fire/compat/firestore';
import { Observable, observable } from 'rxjs';
import { NgPipesModule } from 'ng-pipes';
import { Action } from 'rxjs/internal/scheduler/Action';

interface Post {
  id: number;
  category: string
  nom: string;
  prix: number;
  description: string;
  image: string;
  rating:number;
  }
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  constructor(private service:OderDetailsService, private afs:AngularFirestore){}
  postsCol!: AngularFirestoreCollection<Post>;
  posts!: any;

  clothesData: any;


  ngOnInit(): void {
    this.clothesData = this.service.clothesDetails;
    
    this.postsCol =this.afs.collection('produit');
    this.posts = this.postsCol.valueChanges();

  };

  
  
}
