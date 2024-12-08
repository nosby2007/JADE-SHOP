import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-new-professional',
  templateUrl: './new-professional.component.html',
  styleUrls: ['./new-professional.component.scss']
})
export class NewProfessionalComponent {
  professionalForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<NewProfessionalComponent>
  ) {
    this.professionalForm = this.fb.group({
      name: ['', Validators.required],
      type: ['', Validators.required],
      officePhone: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      login: ['', Validators.required],
      npi: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
      endDate: ['', Validators.required]
    });
  }

  save(): void {
    if (this.professionalForm.valid) {
      const newProfessional = this.professionalForm.value;
      console.log('New Professional:', newProfessional);
      // Pass data back to the parent or save via API
      this.dialogRef.close(newProfessional);
    }
  }

  close(): void {
    this.dialogRef.close();
  }
}