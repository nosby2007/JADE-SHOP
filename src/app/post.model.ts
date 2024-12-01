export interface Post {
    id?: string; // Optionnel, car Firestore génère automatiquement un ID
    title: string;
    subtitle?: string;
    content: string;
    image?: string;
    timestamp: any; // Utilisez `any` si vous recevez un Timestamp Firebase
    comments?: { userName: string; text: string; timestamp: Date }[];
  }
  