import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VaccinationModalComponent } from './vaccination-modal.component';

describe('VaccinationModalComponent', () => {
  let component: VaccinationModalComponent;
  let fixture: ComponentFixture<VaccinationModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VaccinationModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VaccinationModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
