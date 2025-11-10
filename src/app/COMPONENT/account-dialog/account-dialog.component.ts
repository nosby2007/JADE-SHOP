import { Component, OnDestroy, OnInit, Inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import firebase from 'firebase/compat/app';
import { finalize, Subscription } from 'rxjs';

export type AccountDialogData = { }; // keep for future (e.g., preselect tab)
type Stats = { patients?: number; tasksOpen?: number; docs?: number };

@Component({
  selector: 'app-account-dialog',
  templateUrl: './account-dialog.component.html',
  styleUrls: ['./account-dialog.component.scss'],
})
export class AccountDialogComponent implements OnInit, OnDestroy {
  loading = true;
  saving = false;
  uploading = false;
  uploadProgress = 0;

   stats: Stats | null = null;

  private sub?: Subscription;
  uid: string | null = null;
  email = '';
  phoneNumber = '';
  roles = '';

  form = this.fb.group({
    displayName: ['', [Validators.required, Validators.minLength(2)]],
    phoneNumber: [''],
    email: ['', [Validators.required, Validators.email]],
    photoURL: [''],
    newPassword: [''],
    roles: [''],
    

  });

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: AccountDialogData,
    private ref: MatDialogRef<AccountDialogComponent>,
    private fb: FormBuilder,
    private snack: MatSnackBar,
    private afAuth: AngularFireAuth,
    private afs: AngularFirestore,
    private storage: AngularFireStorage
  ) {}

  ngOnInit(): void {
    this.sub = this.afAuth.authState.subscribe(async (user) => {
      this.loading = false;
      if (!user) return;
      this.uid = user.uid;
      this.email = user.email || '';
      const snap = await this.afs.doc(`users/${user.uid}`).ref.get();
      const doc = snap.exists ? (snap.data() as any) : {};
      this.form.patchValue({
        displayName: user.displayName || doc.displayName || '',
        email: user.email || doc.email || '',
        phoneNumber: user.phoneNumber || doc.phoneNumber || '',
        photoURL: user.photoURL || doc.photoURL || '',
        roles: Array.isArray(doc.roles) ? doc.roles.join(', ') : (doc.roles || ''),
      });
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  close() { this.ref.close(); }

  async save(): Promise<void> {
    if (!this.uid) return;
    const { displayName, phoneNumber, photoURL, newPassword } = this.form.getRawValue();
    try {
      this.saving = true;
      const user = (await this.afAuth.currentUser)!;

      await user.updateProfile({
        displayName: displayName || undefined,
        photoURL: photoURL || undefined,
      });

      if (newPassword && newPassword.length >= 6) {
        await user.updatePassword(newPassword);
      }

      await this.afs.doc(`users/${this.uid}`).set(
        {
          uid: this.uid,
          email: user.email,
          displayName: displayName || null,
          phoneNumber: phoneNumber || null,
          photoURL: photoURL || null,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

      this.snack.open('Profile updated', 'OK', { duration: 2200 });
      this.ref.close(true);
    } catch (e: any) {
      this.snack.open(e?.message || 'Failed to update profile', 'Dismiss', { duration: 4000 });
    } finally {
      this.saving = false;
    }
  }

  onFilePicked(ev: Event) {
    if (!this.uid) return;
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.snack.open('Please select an image file', 'Dismiss', { duration: 3000 });
      return;
    }

    const path = `avatars/${this.uid}/${Date.now()}_${file.name}`;
    const task = this.storage.upload(path, file);
    this.uploading = true;

    const sub = task.percentageChanges().subscribe((p) => {
      this.uploadProgress = Math.round(p || 0);
    });

    task.snapshotChanges().pipe(
      finalize(async () => {
        sub.unsubscribe();
        const url = await this.storage.ref(path).getDownloadURL().toPromise();
        this.form.patchValue({ photoURL: url });
        this.uploading = false;
        this.snack.open('Avatar uploaded', 'OK', { duration: 2000 });
      })
    ).subscribe();
  }

   logout() {
    this.afAuth.signOut?.(); // call your auth service sign-out
    this.ref.close();
  }
}
