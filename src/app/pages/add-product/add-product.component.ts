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
  editingId: any



  
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
    if (this.newItem.nom && this.newItem.titre && this.newItem.soustitre && this.newItem.description && this.newItem.category && this.newItem.badge1 && this.newItem.badge2 && this.newItem.titre && this.newItem.image && this.newItem.image1 && this.newItem.image2 && this.newItem.image3 && this.newItem.description1 && this.newItem.description2 && this.newItem.modeemploi) {
      this.itemService.addItem(this.newItem)
        .then(() => {
          console.log('Item added successfully');
          alert('félicitation')
          this.newItem = {
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
    this.editItem = { ...item };
  }

  // Update item, guarding against null
  async updateItem(): Promise<void> {
    if (this.editingId && this.editItem) {
      try {
        await this.itemService.updateItem(this.editingId, this.editItem);
        console.log('Item updated successfully');
        this.cancelEdit(); // Reset after updating
      } catch (error) {
        console.error('Error updating item:', error);
      }
    } else {
      console.error('No item selected for update');
    }
  }

  // Cancel edit
  cancelEdit(): void {
    this.editingId = null;
  }

deleteItem(id: string): void {
    this.itemService.deleteItem(id)
      .then(() => console.log('Item deleted successfully'))
      .catch(error => console.error('Error deleting item:', error));
  }

}
