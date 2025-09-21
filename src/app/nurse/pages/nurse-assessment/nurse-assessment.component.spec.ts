import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NurseAssessmentComponent } from './nurse-assessment.component';

describe('NurseAssessmentComponent', () => {
  let component: NurseAssessmentComponent;
  let fixture: ComponentFixture<NurseAssessmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NurseAssessmentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NurseAssessmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
