import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientWoundsComponent } from './patient-wounds.component';

describe('PatientWoundsComponent', () => {
  let component: PatientWoundsComponent;
  let fixture: ComponentFixture<PatientWoundsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PatientWoundsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatientWoundsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
