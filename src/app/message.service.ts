import { Injectable } from '@angular/core';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { Action } from 'rxjs/internal/scheduler/Action';
import { SubscriptionLoggable } from 'rxjs/internal/testing/SubscriptionLoggable';
import { map} from 'rxjs/operators';

export interface Message {
  id?: string;
  nom: string;
  email: string;
  message: string;
  }

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private itemsCollection: AngularFirestoreCollection<Message>;
  items$: Observable<Message[]>;
  constructor(private firestore: AngularFirestore) {
    this.itemsCollection = firestore.collection<Message>('message');
  //use  snapshotchanges() to get real-time data with metadata
  this.items$ = this.itemsCollection.snapshotChanges().pipe(
    map(actions => actions.map(a =>{
      const data = a.payload.doc.data() as Message;
      const id = a.payload.doc.id;
      return {
        id, ...data
      };
    }))
  );
 } 
 addItem(item: Message):Promise<void> {  
  return this.itemsCollection.add(item).then(()=>{
    
  })
}
// read single document

getItem(id: string): Observable<Message | undefined> {
return this.itemsCollection.doc(id).snapshotChanges().pipe(
  map(action => {
    const data = action.payload.data() as Message;
    const id = action.payload.id;
    return {
      id, ...data
    };
  }))
};

//update

updateItem(id: string, item: Partial<Message>):Promise<void> {
return this.itemsCollection.doc(id).update(item).then(()=>{});
}

//delete

deleteItem(id: string): Promise<void> {
return this.itemsCollection.doc(id).delete().then(()=>{});
}


}


  

