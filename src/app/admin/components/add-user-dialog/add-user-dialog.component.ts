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
    role: ['user', Validators.required],            // single role
    phoneNumber: [''],
    photoURL: ['']
  });

  constructor(
    private fb: FormBuilder,
    private svc: AdminUserService,
    private ref: MatDialogRef<AddUserDialogComponent>
  ) {}

  async save() {
    if (this.form.invalid || this.loading) return;

    this.loading = true;
    const raw = this.form.value as any;

    // sanitize payload sent to the CF
    const payload = {
      email: raw.email,
      password: raw.password,
      displayName: raw.displayName?.trim() || '',
      role: raw.role || 'user',
      ...(raw.phoneNumber && /^\+\d{8,15}$/.test(raw.phoneNumber)
        ? { phoneNumber: raw.phoneNumber }
        : {}),
      ...(raw.photoURL && raw.photoURL.trim()
        ? { photoURL: raw.photoURL.trim() }
        : {}),
    };

    try {
      // single call (no duplicate)
      await this.svc.createUser(payload);

      // if you want to also call a separate roles setter, do it here,
      // but ideally the CF should set roles + custom claims itself.

      this.ref.close({ ok: true });
    } catch (e) {
      console.error(e);
    } finally {
      this.loading = false;
    }
  }
}
