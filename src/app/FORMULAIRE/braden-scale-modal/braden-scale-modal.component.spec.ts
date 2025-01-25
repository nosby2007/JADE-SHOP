import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BradenScaleModalComponent } from './braden-scale-modal.component';

describe('BradenScaleModalComponent', () => {
  let component: BradenScaleModalComponent;
  let fixture: ComponentFixture<BradenScaleModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BradenScaleModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BradenScaleModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
