import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientDemographicCardComponent } from './patient-demographic-card.component';

describe('PatientDemographicCardComponent', () => {
  let component: PatientDemographicCardComponent;
  let fixture: ComponentFixture<PatientDemographicCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PatientDemographicCardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatientDemographicCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
