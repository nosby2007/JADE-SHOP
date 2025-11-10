import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PriceCreateDialogComponent } from './price-create-dialog.component';

describe('PriceCreateDialogComponent', () => {
  let component: PriceCreateDialogComponent;
  let fixture: ComponentFixture<PriceCreateDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PriceCreateDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PriceCreateDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
