import { Component, OnInit } from '@angular/core';
import { AppointmentService } from 'src/app/SERVICE/appointment.service';

@Component({
  selector: 'app-appointment-list',
  templateUrl: './appointment-list.component.html',
  styleUrls: ['./appointment-list.component.scss']
})
export class AppointmentListComponent implements OnInit {
  appointments: any[] = [];
  constructor(private appointmentService: AppointmentService) { }

  ngOnInit(): void {
    this.appointmentService.getAppointments().subscribe((res) => {
      this.appointments = res.map((item:any) => {
        return {
          id: item.payload.doc.id,
          ...item.payload.doc.data()
        };
      });
    });
  }
  deleteAppointment(appointmentId: string) {
    this.appointmentService.deleteAppointment(appointmentId).then(() => {
      console.log('Appointment deleted successfully');
    }).catch((error) => {
      console.error('Error deleting appointment: ', error);
    });
  }

}
