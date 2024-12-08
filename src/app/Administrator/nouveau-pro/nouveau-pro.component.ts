import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { NewProfessionalComponent } from '../new-professional/new-professional.component';

@Component({
  selector: 'app-nouveau-pro',
  templateUrl: './nouveau-pro.component.html',
  styleUrls: ['./nouveau-pro.component.scss']
})
export class NouveauProComponent implements OnInit {
  professionalForm!: FormGroup;
  constructor(private fb: FormBuilder, public dialog: MatDialog) {
    this.professionalForm = this.fb.group({
      name: ['', Validators.required],
      type: ['', Validators.required],
      officePhone: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      login: ['', Validators.required],
      npi: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
      endDate: ['', Validators.required]
    });
  }

  penNewProfessionalModal(): void {
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

  addProfessional(): void {
    if (this.professionalForm.valid) {
      const newProfessional = this.professionalForm.value;
      console.log('New Professional:', newProfessional);
      // Add the logic to save the professional (e.g., API call)
      this.dialog.closeAll();
    }
  }

  // Reference for the modal
  newProfessionalModal = this.dialog;

 professionals :any []=[]; // Replace with actual data from API or service
  filteredProfessionals:any;
  statusFilter = 'active';
  searchTerm = '';
  alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;

  ngOnInit() {
    this.fetchProfessionals();
  }

  fetchProfessionals() {
    // Fetch data from API/service and set to this.professionals
    // Example static data:
    this.professionals = [
      { name: 'Sandra Agoreyo', type: 'Rounding Nurse Practitioner', endDate: '2024-12-31', officePhone: '833-578-2763', login: 'sagoreyo', npi: '1568146173' },
      { name: 'Quavardes Barkley', type: 'Wound Care Physician', endDate: '2025-01-15', officePhone: '404-445-5304', login: 'quavbarkley', npi: '1497118715' }
      // Add more data here...
    ];
    this.applyFilter();
  }

  applyFilter() {
    let result = [...this.professionals];
    if (this.statusFilter !== 'both') {
      const isExpired = this.statusFilter === 'expired';
      result = result.filter(pro => new Date(pro.endDate) < new Date() === isExpired);
    }
    this.filteredProfessionals = result.slice(0, this.itemsPerPage);
    this.totalPages = Math.ceil(result.length / this.itemsPerPage);
  }

  applySearch() {
    this.filteredProfessionals = this.professionals.filter((pro: { name: string; }) =>
      pro.name.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  filterByLetter(letter: string) {
    this.filteredProfessionals = this.professionals.filter((pro: { name: string; }) =>
      pro.name.startsWith(letter)
    );
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.paginate();
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.paginate();
    }
  }

  paginate() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.filteredProfessionals = this.professionals.slice(startIndex, endIndex);
  }

  edit(professional: any) {
    console.log('Edit:', professional);
  }

  assignDEA(professional: any) {
    console.log('Assign DEA:', professional);
  }

  deactivateDEA(professional: any) {
    console.log('Deactivate DEA:', professional);
  }

  print() {
    window.print();
  }
}