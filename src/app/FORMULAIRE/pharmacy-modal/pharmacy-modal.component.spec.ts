import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PharmacyModalComponent } from './pharmacy-modal.component';

describe('PharmacyModalComponent', () => {
  let component: PharmacyModalComponent;
  let fixture: ComponentFixture<PharmacyModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PharmacyModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PharmacyModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
