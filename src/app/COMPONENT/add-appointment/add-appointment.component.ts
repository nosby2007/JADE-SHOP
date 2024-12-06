import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AppointmentService } from 'src/app/SERVICE/appointment.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-add-appointment',
  templateUrl: './add-appointment.component.html',
  styleUrls: ['./add-appointment.component.scss']
})
export class AddAppointmentComponent implements OnInit {
  appointmentForm: FormGroup;
  constructor(private fb: FormBuilder, private appointmentService: AppointmentService, private ActivatedRoute: ActivatedRoute,private router:Router) {
    this.appointmentForm = this.fb.group({
      patientId: ['', Validators.required],
      doctor: ['', Validators.required],
      date: ['', Validators.required],
      time: ['', Validators.required],
      reason: ['', Validators.required]
    });
   }

  ngOnInit(): void {
  }
  onSubmit() {
    if (this.appointmentForm.valid) {
      this.appointmentService.addAppointment(this.appointmentForm.value).then(() => {
        console.log('Appointment added successfully!');
        this.appointmentForm.reset();
      }).catch((error) => {
        console.error('Error adding appointment: ', error);
      });
    }
  }

}
