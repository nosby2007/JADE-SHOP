import { Component, OnInit } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { ApiService } from 'src/app/services/api.service';
import { CartServiceService } from 'src/app/services/cart-service.service';
import { __values } from 'tslib';


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
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss']
})
export class ProductsComponent implements OnInit {

postsCol!: AngularFirestoreCollection<Post>;
  posts!: any;
  constructor(private api : ApiService, private cartServiceService: CartServiceService,  private afs:AngularFirestore   ) { }

  ngOnInit(): void {

    this.postsCol =this.afs.collection('produit');
    this.posts = this.postsCol.valueChanges();

}
 }