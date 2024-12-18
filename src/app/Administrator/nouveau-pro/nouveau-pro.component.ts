import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog'
import { ProfessionelsService } from 'src/app/SERVICE/professionels.service';
import { Router } from '@angular/router';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { NewProfessionalComponent } from '../new-professional/new-professional.component';
import { Pro } from 'src/app/proffessionel.model';
import { ReportService } from 'src/app/SERVICE/report.service';
import { PrintService } from 'src/app/SERVICE/print.service';

@Component({
  selector: 'app-nouveau-pro',
  templateUrl: './nouveau-pro.component.html',
  template: `
  <div id="patient-list-card">
    <h1>Rapport</h1>
    <table>
      <thead>
        <tr>
          <th>Nom</th>
          <th>Date</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Jean Dupont</td>
          <td>01/01/2024</td>
        </tr>
      </tbody>
    </table>
  </div>
  <button (click)="print()">Imprimer</button>
`,
  styleUrls: ['./nouveau-pro.component.scss']
})
export class NouveauProComponent implements OnInit {
  dataSource = new MatTableDataSource<Pro>([]);
  displayedColumns: string [] = ['name','type', 'officePhone', 'login', 'npi', 'startDate', 'action'] 

  @ViewChild(MatPaginator,  { static: true }) paginator!:MatPaginator;
  @ViewChild(MatSort,  { static: true }) sort!:MatSort;
  

  patients: any[] = [];
  constructor(private proService: ProfessionelsService, private router:Router, private printService:PrintService, private dialog: MatDialog, private reportService: ReportService) { }

  ngOnInit(): void {
    this.proService.pro$.subscribe((patients: any[]) => {
      // Ajout d'un code temporel à chaque patient pour démonstration
      patients.forEach(patient => {
        patient.timestamp = new Date();
      });
      this.dataSource.data = patients;
    });
  }
  fetchPatients(): void {
    this.proService.getProfessionel().subscribe(
      (patients: Pro[]) => {
        this.dataSource.data = patients;
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      },
      (error) => {
        console.error('Error fetching patients:', error);
      }
    );
  }

  ngAfterViewInit(): void {
    if (this.paginator && this.sort) {
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  openNewProfessionalModal(): void {
    const dialogRef = this.dialog.open(NewProfessionalComponent, {
      width: '500px'
      
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Modal closed with result:', result);
        // Handle the new professional data (e.g., save it to a database)
      }
    });
  }
  editProfessionel(patient: any): void {
    // Logic to edit the patient
    console.log('Editing patient:', patient);
  }

  deleteProfessionel(patientId: string) {
    this.proService.deleteProfessionel(patientId).then(() => {
      console.log('patient  deleted successfully');
    }).catch((error) => {
      console.error('Error deleting appointment: ', error);
    });
  }
  print(){
    this.printService.printInNewWindow('print-section'); // Imprime dans une nouvelle fenêtre
  }
  generatePdf() {
    this.reportService.downloadPdf().subscribe((blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'rapport.pdf';
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }
}                                   