import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PatientService } from 'src/app/SERVICE/patient.service';

@Component({
  selector: 'app-e-mar',
  templateUrl: './e-mar.component.html',
  styleUrls: ['./e-mar.component.scss']
})
export class EMARComponent implements OnInit {
  patients:any[]=[];
  filteredPatients:any[]=[];

  constructor(private patientService: PatientService, private router:Router) {}

  ngOnInit(): void {
    this.patientService.getPatients().subscribe((data) => {
      this.patients = data;
      this.filteredPatients = data;
    });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value.toLowerCase();
    this.filteredPatients = this.patients.filter((patient) =>
      patient.name.toLowerCase().includes(filterValue)
    );
  }

  viewTasks(patientId: string): void {
    // Navigation logic here
    this.router.navigate(['/emar', patientId]);
  }

  getCardClass(patient: any): string {
    return patient.prescriptions && patient.prescriptions.length > 0 + 1
      ? 'has-prescriptions'
      : 'no-prescriptions';
  }
  
}