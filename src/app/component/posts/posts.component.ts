import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Component({
  selector: 'app-posts',
  templateUrl: './posts.component.html',
  styleUrls: ['./posts.component.scss']
})
export class PostsComponent implements OnInit {

  posts: any[] = [];

  constructor(private firestore: AngularFirestore) {}

  ngOnInit(): void {
    this.loadPosts();
  }

  loadPosts(): void {
    this.firestore
      .collection('posts', ref => ref.orderBy('timestamp', 'desc'))
      .valueChanges({ idField: 'id' })
      .subscribe(posts => {
        this.posts = posts;
      });
  }
}
