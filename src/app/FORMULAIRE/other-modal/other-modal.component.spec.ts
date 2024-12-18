import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OtherModalComponent } from './other-modal.component';

describe('OtherModalComponent', () => {
  let component: OtherModalComponent;
  let fixture: ComponentFixture<OtherModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OtherModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OtherModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
