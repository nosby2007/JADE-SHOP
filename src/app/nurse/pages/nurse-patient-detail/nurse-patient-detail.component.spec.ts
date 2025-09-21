import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NursePatientDetailComponent } from './nurse-patient-detail.component';

describe('NursePatientDetailComponent', () => {
  let component: NursePatientDetailComponent;
  let fixture: ComponentFixture<NursePatientDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NursePatientDetailComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NursePatientDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
