import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NutritionRxDialogComponent } from './nutrition-rx-dialog.component';

describe('NutritionRxDialogComponent', () => {
  let component: NutritionRxDialogComponent;
  let fixture: ComponentFixture<NutritionRxDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NutritionRxDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NutritionRxDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
