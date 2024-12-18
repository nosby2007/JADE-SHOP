import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LaboratoryModalComponent } from './laboratory-modal.component';

describe('LaboratoryModalComponent', () => {
  let component: LaboratoryModalComponent;
  let fixture: ComponentFixture<LaboratoryModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LaboratoryModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LaboratoryModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
