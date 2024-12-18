import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProfessionelsService } from 'src/app/SERVICE/professionels.service';
import { Router } from '@angular/router';
import { Pro } from 'src/app/proffessionel.model';

@Component({
  selector: 'app-new-professional',
  templateUrl: './new-professional.component.html',
  styleUrls: ['./new-professional.component.scss']
})
export class NewProfessionalComponent {
  professionalForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<NewProfessionalComponent>, private professionalService: ProfessionelsService, private router:Router) {
    this.professionalForm = this.fb.group({
      name: ['', Validators.required],
      type: ['', Validators.required],
      officePhone: ['', [Validators.required,]],
      login: ['', Validators.required],
      npi: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
      startDate: ['', Validators.required]
    });
  }


  onSubmit() {
    const newProfessional = this.professionalForm.value;
    if (this.professionalForm.valid) {
      this.professionalService.addProfessionel(this.professionalForm.value).then(() => {
      this.router.navigate(['/medicaux'])
        alert('Pprofessional added successfully!');
        this.professionalForm.reset();
      }).catch((error) => {
        console.error('Error adding patient: ', error);
      });
      this.dialogRef.close(newProfessional);
    }
    

  }
  

  close(): void {
    this.dialogRef.close();
  }
}