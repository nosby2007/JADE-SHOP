import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ActivatedRoute } from '@angular/router';
import { Post } from '../../post.model'; // Chemin vers votre modèle

@Component({
  selector: 'app-post-details',
  templateUrl: './post-details.component.html',
  styleUrls: ['./post-details.component.scss']
})
export class PostDetailsComponent implements OnInit {
  post: Post | null = null; // Initialisation de l'objet Post
  newComment: string = '';

  constructor(
    private route: ActivatedRoute,
    private firestore: AngularFirestore
  ) {}

  ngOnInit(): void {
    const postId = this.route.snapshot.paramMap.get('id');
    if (postId) {
      this.loadPost(postId);
    }
  }

  loadPost(postId: string): void {
    this.firestore
      .collection<Post>('posts')
      .doc(postId)
      .snapshotChanges()
      .subscribe({
        next: snapshot => {
          if (snapshot.payload.exists) {
            const data = snapshot.payload.data() as Post;
            const id = snapshot.payload.id;
            this.post = { id, ...data };
  
            // Conversion du Timestamp
            this.post.timestamp = this.post.timestamp?.toDate();
          } else {
            console.error('Le document n\'existe pas.');
          }
        },
        error: error => {
          console.error('Erreur lors du chargement du post :', error);
        }
      });
  }

  addComment(): void {
    if (this.newComment.trim() && this.post?.id) {
      const comment = {
        userName: 'Utilisateur', // Nom de l'utilisateur connecté
        text: this.newComment.trim(),
        timestamp: new Date()
      };
  
      this.firestore
        .collection('posts')
        .doc(this.post.id)
        .update({
          comments: [...(this.post.comments || []), comment]
        })
        .then(() => {
          this.newComment = '';
          console.log('Commentaire ajouté avec succès !');
        })
        .catch(error => {
          console.error('Erreur lors de l\'ajout du commentaire :', error);
        });
    } else {
      console.error('Impossible d\'ajouter le commentaire : ID de document manquant.');
    }
  }
}
