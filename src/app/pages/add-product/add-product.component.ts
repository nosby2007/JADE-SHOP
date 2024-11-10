import { Component, OnInit } from '@angular/core';
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
  interface PostId extends Post{
    id:number
  }
  

@Component({
  selector: 'app-add-product',
  templateUrl: './add-product.component.html',
  styleUrls: ['./add-product.component.scss']
})
export class AddProductComponent implements OnInit {
  postsCol!: AngularFirestoreCollection<Post>;
  posts!: any;

  id!: number;
  category!: string
  nom!: string;
  prix!: number;
  description!: string;
  image!: string;
  rating!:number;

  constructor(private afs:AngularFirestore){}

  ngOnInit(){
    this.postsCol =this.afs.collection('produit');
    this.posts = this.postsCol.valueChanges();
  }
  addPost(){
    this.afs.collection('produit').add(
      {
        
  id:this.id,
  category: this.category,
  nom: this.nom,
  prix: this.prix,
  description: this.description,
  image:this.image ,
  rating: this.rating,
      }
    )
  }

}
