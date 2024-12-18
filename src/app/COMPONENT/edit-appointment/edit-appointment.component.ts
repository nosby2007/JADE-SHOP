import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';


@Component({
  selector: 'app-edit-appointment',
  templateUrl: './edit-appointment.component.html',
  styleUrls: ['./edit-appointment.component.scss']
})
export class EditAppointmentComponent implements OnInit{

  appointmentForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<EditAppointmentComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any // Contains appointment details
  ) {
    this.appointmentForm = this.fb.group({
      doctor: '', 
      date: '', 
      time: '', 
      reason: '', 
    });
    
  }
  ngOnInit(): void {
    console.log('Data received in modal:', this.data); // Debug data
  
    if (this.data) {
      this.appointmentForm.patchValue({
        doctor: this.data.doctor || '',
        date: this.data.date || '',
        time: this.data.time || '',
        reason: this.data.reason || '',
      });
    }
  }

  onSubmit(): void {
    if (this. appointmentForm.valid) {
      const updatedAppointment = this. appointmentForm.value;
      updatedAppointment.id = this.data.id; // Ensure the ID is included
      this.dialogRef.close(updatedAppointment);
    } else {
      console.error('Form is invalid:', this. appointmentForm.errors);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}