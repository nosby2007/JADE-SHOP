import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupplementModalComponent } from './supplement-modal.component';

describe('SupplementModalComponent', () => {
  let component: SupplementModalComponent;
  let fixture: ComponentFixture<SupplementModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SupplementModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SupplementModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
