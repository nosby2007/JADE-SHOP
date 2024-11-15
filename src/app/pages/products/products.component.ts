import { Component, OnInit } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { Message, MessageService } from 'src/app/message.service';
import { ProduitServiceService, Item } from 'src/app/produit-service.service';
import { ApiService } from 'src/app/services/api.service';
import { CartServiceService } from 'src/app/services/cart-service.service';
import { __values } from 'tslib';


interface Post {
  id?: number;
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

items: Item[] = [];
editItem: Item = {
  category: '',
  nom: '',
  titre:'',
  description2: '',
  description1: '',
  description: '',
  image: '',
  image1:'',
  image2:'',
  image3:'',
  soustitre:'',
  badge1:'',
  badge2:'',
  modeemploi:''
  }
  
message: Message[] = [];
  

postsCol!: AngularFirestoreCollection<Post>;
  posts!: any;
editingId: string | null = null

  constructor(private api : ApiService, private cartServiceService: CartServiceService,  private afs:AngularFirestore, private itemService: ProduitServiceService, private msg: MessageService  ) { }

  ngOnInit(): void {

    this.postsCol =this.afs.collection('produit');
    this.posts = this.postsCol.valueChanges();

    
      this.itemService.items$.subscribe(data => {
        this.items = data;
      
      });
    this.msg.items$.subscribe(data => {
        this.message = data;
      });

}

}