import { animate, style, transition, trigger } from '@angular/animations';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-communication',
  templateUrl: './communication.component.html',
  styleUrls: ['./communication.component.scss'],
  animations: [
    trigger('modalAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.9)' }),
        animate('300ms ease-in-out', style({ opacity: 1, transform: 'scale(1)' }))
      ]),
      transition(':leave', [
        animate('300ms ease-in-out', style({ opacity: 0, transform: 'scale(0.9)' }))
      ])
    ])
  ]
})

export class CommunicationComponent implements OnInit {
  ngOnInit(): void {
  }
  isModalOpen = false;
  newCommunication = {
    residentNumber: '',
    residentName: '',
    dontDisplayAfter: '',
    message: ''
  };


  saveCommunication() {
    // Logic to save the communication
    console.log('Saved Communication:', this.newCommunication);
    this.closeModal();
  }
  communications = [
    // Example data
    {
      datePosted: new Date(),
      createdBy: 'Terri King',
      position: 'HR Director',
      message: 'Sample message content',
      resident: 'Postell, Johnny (5038)',
      dontDisplayAfter: new Date()
    }, // Example data
    {
      datePosted: new Date(),
      createdBy: 'Terri King',
      position: 'HR Director',
      message: 'Sample message content',
      resident: 'Postell, Johnny (5038)',
      dontDisplayAfter: new Date()
    }, // Example data
    {
      datePosted: new Date(),
      createdBy: 'Terri King',
      position: 'HR Director',
      message: 'Sample message content',
      resident: 'Postell, Johnny (5038)',
      dontDisplayAfter: new Date()
    }, // Example data
    {
      datePosted: new Date(),
      createdBy: 'Terri King',
      position: 'HR Director',
      message: 'Sample message content',
      resident: 'Postell, Johnny (5038)',
      dontDisplayAfter: new Date()
    }, // Example data
    {
      datePosted: new Date(),
      createdBy: 'Terri King',
      position: 'HR Director',
      message: 'Sample message content',
      resident: 'Postell, Johnny (5038)',
      dontDisplayAfter: new Date()
    }, // Example data
    {
      datePosted: new Date(),
      createdBy: 'Terri King',
      position: 'HR Director',
      message: 'Sample message content',
      resident: 'Postell, Johnny (5038)',
      dontDisplayAfter: new Date()
    }, // Example data
    {
      datePosted: new Date(),
      createdBy: 'Terri King',
      position: 'HR Director',
      message: 'Sample message content',
      resident: 'Postell, Johnny (5038)',
      dontDisplayAfter: new Date()
    },
  ];

  openModal() {
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  addCommunication() {
    
  }
}

