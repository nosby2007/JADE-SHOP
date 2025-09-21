import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NursePatientListComponent } from './nurse-patient-list.component';

describe('NursePatientListComponent', () => {
  let component: NursePatientListComponent;
  let fixture: ComponentFixture<NursePatientListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NursePatientListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NursePatientListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
