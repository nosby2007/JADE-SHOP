import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { AdminUserService } from '../../services/admin-user.service';

@Component({
  selector: 'app-add-user-dialog',
  templateUrl: './add-user-dialog.component.html'
})
export class AddUserDialogComponent {
  loading = false;
  roles = ['user','employer','nurse','provider','admin'];

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    displayName: [''],
    role: ['user', Validators.required],
    phoneNumber: [''],
    photoURL: ['']
  });

  constructor(private fb: FormBuilder, private svc: AdminUserService, private ref: MatDialogRef<AddUserDialogComponent>) {}
  
  async save() {
    if (this.form.invalid) return;
    this.loading = true;
    const raw = this.form.value as any;
const payload = {
  email: raw.email,
  password: raw.password,
  displayName: raw.displayName || '',
  role: raw.role || 'user',
  // n’envoyer phoneNumber QUE s’il ressemble à E.164
  ...(raw.phoneNumber && /^\+\d{8,15}$/.test(raw.phoneNumber) ? { phoneNumber: raw.phoneNumber } : {}),
  ...(raw.photoURL && raw.photoURL.trim() ? { photoURL: raw.photoURL.trim() } : {}),
};
await this.svc.createUser(payload);

    try {
      await this.svc.createUser(this.form.value as any);
      this.ref.close({ ok: true });
    } catch (e) {
      console.error(e);
      this.loading = false;
    }
  }
  
}
