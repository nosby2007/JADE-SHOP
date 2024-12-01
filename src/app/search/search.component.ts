import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {
  query: string = '';
  results: any[] = [];

  constructor(private firestore: AngularFirestore) { }

  ngOnInit(): void {
  }
search(): void {
    this.firestore.collection('wounds', ref => ref.where('name', '>=', this.query).where('name', '<=', this.query + '\uf8ff'))
      .valueChanges({ idField: 'id' })
      .subscribe((data: any[]) => {
        this.results = data;
      });
  }
}
