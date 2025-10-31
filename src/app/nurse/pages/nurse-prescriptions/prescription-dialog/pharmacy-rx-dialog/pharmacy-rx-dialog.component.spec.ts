import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PharmacyRxDialogComponent } from './pharmacy-rx-dialog.component';

describe('PharmacyRxDialogComponent', () => {
  let component: PharmacyRxDialogComponent;
  let fixture: ComponentFixture<PharmacyRxDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PharmacyRxDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PharmacyRxDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
