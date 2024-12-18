import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NutritionModalComponent } from './nutrition-modal.component';

describe('NutritionModalComponent', () => {
  let component: NutritionModalComponent;
  let fixture: ComponentFixture<NutritionModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NutritionModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NutritionModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
