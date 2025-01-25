import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-doctor-modal',
  templateUrl: './doctor-modal.component.html',
  styleUrls: ['./doctor-modal.component.scss'],
})
export class DoctorModalComponent {
  doctorForm: FormGroup;

  constructor(
    private dialogRef: MatDialogRef<DoctorModalComponent>,
    private fb: FormBuilder
  ) {
    this.doctorForm = this.fb.group({
      name: ['', Validators.required],
      profession: ['', Validators.required],
      phone: ['', [Validators.required, Validators.pattern('^[0-9]{10,15}$')]],
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.doctorForm.valid) {
      this.dialogRef.close(this.doctorForm.value);
    }
  }
}
