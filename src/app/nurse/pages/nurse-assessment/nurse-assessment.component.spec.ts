import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NurseAssessmentsComponent } from './nurse-assessment.component';

describe('NurseAssessmentsComponent', () => {
  let component: NurseAssessmentsComponent;
  let fixture: ComponentFixture<NurseAssessmentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NurseAssessmentsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(NurseAssessmentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
