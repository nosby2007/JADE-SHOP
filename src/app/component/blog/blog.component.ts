import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Component({
  selector: 'app-blog',
  templateUrl: './blog.component.html',
  styleUrls: ['./blog.component.scss']
})
export class BlogComponent implements OnInit {

  posts: any[] = [];
  newComment: { [key: string]: string } = {};
  newPost = {
    title: '',
    content: '',
    userName: '',
    userPhoto: '',
    subtitle: '',
    image: '',
  };
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
   // Ajouter un nouveau post
   addPost(): void {
    if (this.newPost.title && this.newPost.content && this.newPost.userName && this.newPost.userPhoto) {
      const post = {
        ...this.newPost,
        timestamp: new Date(),
        comments: [] // Initialiser une liste de commentaires vide
      };

      this.firestore
        .collection('posts')
        .add(post)
        .then(() => {
          alert('Post ajouté avec succès !');
          this.resetForm();
        })
        .catch(error => console.error('Erreur lors de l\'ajout du post :', error));
    }
  }

  resetForm(): void {
    this.newPost = {
      title: '',
      content: '',
      userName: '',
      userPhoto: '',
      subtitle: '',
    image: ''
    };
  }

  addComment(postId: string): void {
    const commentText = this.newComment[postId]?.trim();

    if (commentText) {
      const post = this.posts.find(p => p.id === postId);

      const comment = {
        userName: 'Utilisateur Actuel', // Remplacez par le nom de l'utilisateur connecté
        text: commentText,
        timestamp: new Date()
      };

      // Ajouter le commentaire à Firestore
      this.firestore
        .collection('posts')
        .doc(postId)
        .update({
          comments: [...(post.comments || []), comment]
        })
        .then(() => {
          this.newComment[postId] = ''; // Réinitialiser l'entrée
        })
        .catch(error => console.error('Erreur lors de l\'ajout du commentaire :', error));
    }
  }

}
