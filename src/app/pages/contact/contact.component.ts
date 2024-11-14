import { Component, OnInit } from '@angular/core';
import { Message, MessageService } from 'src/app/message.service';
import { AngularFirestore,AngularFirestoreCollection,AngularFirestoreDocument } from '@angular/fire/compat/firestore';
import { Observable, observable } from 'rxjs';
import { NgPipesModule } from 'ng-pipes';
import { Action } from 'rxjs/internal/scheduler/Action';
import { ProduitServiceService, Item } from 'src/app/produit-service.service';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent implements OnInit {
  items: Message[] = [];
  newItem: Message = {
  nom: '',
  message: '',
  email: '',
  }

  constructor(private msg: MessageService) { }

  ngOnInit(): void {


    
  }
addMessage(): void {
      if (this.newItem.nom && this.newItem.message && this.newItem.email) {
        this.msg.addItem(this.newItem)
          .then(() => {
            console.log('Item added successfully');
            alert('Merci pour votre message, vous recevrez une réponse rapidement par email')
            this.newItem = {
              nom: '',
              message: '',
              email: ''
            };
          })
          .catch(error => console.error('Error adding item:', error));
      } else {
        console.error('All fields must be filled out.');
        alert('veuillez remplir toutes les cases')
      }
    }
}
