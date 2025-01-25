import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VitalsModalComponent } from './vitals-modal.component';

describe('VitalsModalComponent', () => {
  let component: VitalsModalComponent;
  let fixture: ComponentFixture<VitalsModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VitalsModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VitalsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
