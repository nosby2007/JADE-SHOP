import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NursePrescriptionsComponent } from './nurse-prescriptions.component';

describe('NursePrescriptionsComponent', () => {
  let component: NursePrescriptionsComponent;
  let fixture: ComponentFixture<NursePrescriptionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NursePrescriptionsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NursePrescriptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
