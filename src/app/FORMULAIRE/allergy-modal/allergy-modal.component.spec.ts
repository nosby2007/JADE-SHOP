import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllergyModalComponent } from './allergy-modal.component';

describe('AllergyModalComponent', () => {
  let component: AllergyModalComponent;
  let fixture: ComponentFixture<AllergyModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AllergyModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AllergyModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
