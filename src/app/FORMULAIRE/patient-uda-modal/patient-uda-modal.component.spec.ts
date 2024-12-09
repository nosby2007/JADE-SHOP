import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientUdaModalComponent } from './patient-uda-modal.component';

describe('PatientUdaModalComponent', () => {
  let component: PatientUdaModalComponent;
  let fixture: ComponentFixture<PatientUdaModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PatientUdaModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatientUdaModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
