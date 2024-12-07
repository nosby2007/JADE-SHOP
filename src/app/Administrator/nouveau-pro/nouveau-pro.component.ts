import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-nouveau-pro',
  templateUrl: './nouveau-pro.component.html',
  styleUrls: ['./nouveau-pro.component.scss']
})
export class NouveauProComponent implements OnInit {
  professionals = []; // Replace with actual data from API or service
  filteredProfessionals = [];
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
    
      // Add more data here...
    this.applyFilter();
  }

  applyFilter() {
    let result = [...this.professionals];
    if (this.statusFilter !== 'both') {
      const isExpired = this.statusFilter === 'expired';
      result = result.filter(pro => new Date() < new Date() === isExpired);
    }
    this.filteredProfessionals = result.slice(0, this.itemsPerPage);
    this.totalPages = Math.ceil(result.length / this.itemsPerPage);
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

  
  print() {
    window.print();
  }
}