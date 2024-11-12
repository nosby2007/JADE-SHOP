import { Component, OnInit } from '@angular/core';
import { AngularFirestore,AngularFirestoreCollection,AngularFirestoreDocument } from '@angular/fire/compat/firestore';
import { Observable, observable } from 'rxjs';
import { NgPipesModule } from 'ng-pipes';
import { Action } from 'rxjs/internal/scheduler/Action';
import { ProduitServiceService, Item } from 'src/app/produit-service.service';
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

  items: Item[] = [];
  newItem: Item = {

  category: '',
  nom: '',
  prix: 0,
  description: '',
  image: '',
  rating:0 
  }
  editItem: Item = {
  category: '',
  nom: '',
  prix: 0,
  description: '',
  image: '',
  rating:0
  }
  editingId: string | null = null



  
  postsCol!: AngularFirestoreCollection<Post>;
  posts!: any;

  id!: number;
  category!: string
  nom!: string;
  prix!: number;
  description!: string;
  image!: string;
  rating!:number;

  constructor(private afs:AngularFirestore , private itemService: ProduitServiceService){}

  ngOnInit(){
    this.postsCol =this.afs.collection('produit');
    this.posts = this.postsCol.valueChanges();

    this.itemService.items$.subscribe(data => {
      this.items = data;
    });
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
    ).then(()=>{
      return console.log('collection added successfully');
      this.postsCol
    })
  }
  


  addItem(): void {
    if (this.newItem.nom && this.newItem.description && this.newItem.category && this.newItem.prix && this.newItem.image && this.newItem.rating) {
      this.itemService.addItem(this.newItem)
        .then(() => {
          console.log('Item added successfully');
          alert('félicitation')
          this.newItem = {
            nom: '',
            description: '',
            category: '',
            prix: 0,
            image: '',
            rating: 0
          };
        })
        .catch(error => console.error('Error adding item:', error));
    } else {
      console.error('All fields must be filled out.');
      alert('veuillez remplir toutes les cases')
    }
  }

  editItemForm(item: Item): void {
    this.editingId = item.id!;
    this.editItem = { ...item }; // Create a copy of the item to edit
  }

  updateItem(id:any): void {
    this.itemService.updateItem(id, this.editItem)
      .then(() => {
        console.log('Item updated successfully');
        this.cancelEdit(); // Reset edit fields after successful update
      })
      .catch(error => console.error('Error updating item:', error));
  }

  // Cancel edit and clear form fields
  cancelEdit(): void {
    this.editingId = null;
    this.editItem = { nom: '', description: '', category: '', prix: 0, image: '', rating: 0 };
  }
deleteItem(id: string): void {
    this.itemService.deleteItem(id)
      .then(() => console.log('Item deleted successfully'))
      .catch(error => console.error('Error deleting item:', error));
  }

}
