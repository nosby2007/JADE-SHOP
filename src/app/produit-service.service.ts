import { Injectable } from '@angular/core';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { Action } from 'rxjs/internal/scheduler/Action';
import { SubscriptionLoggable } from 'rxjs/internal/testing/SubscriptionLoggable';
import { map} from 'rxjs/operators';

export interface Item {
  id?: string;
  category: string,
  nom: string,
  titre:string,
  description2: string,
  description1: string,
  description: string,
  image: string,
  image1:string,
  image2:string,
  image3:string,
  soustitre:string,
  badge1:string,
  badge2:string,
  modeemploi:string
  }

@Injectable({
  providedIn: 'root'
})

export class ProduitServiceService {   
  private itemsCollection: AngularFirestoreCollection<Item>;
  items$: Observable<Item[]>;

  constructor(private firestore: AngularFirestore) {
    this.itemsCollection = firestore.collection<Item>('produit');
    //use  snapshotchanges() to get real-time data with metadata
    this.items$ = this.itemsCollection.snapshotChanges().pipe(
      map(actions => actions.map(a =>{
        const data = a.payload.doc.data() as Item;
        const id = a.payload.doc.id;
        return {
          id, ...data
        };
      }))
    );
   }
   //create doc

   addItem(item: Item):Promise<void> {  
      return this.itemsCollection.add(item).then(()=>{
        
      })
   }
// read single document

   getItem(id: string): Observable<Item | undefined> {
    return this.itemsCollection.doc(id).snapshotChanges().pipe(
      map(action => {
        const data = action.payload.data() as Item;
        const id = action.payload.id;
        return {
          id, ...data
        };
      }))
   };

   //update

   updateItem(id: string, item: Partial<Item>):Promise<void> {
    return this.itemsCollection.doc(id).update(item).then(()=>{});
   }
   
   //delete

   deleteItem(id: string): Promise<void> {
    return this.itemsCollection.doc(id).delete().then(()=>{});
   }
}
