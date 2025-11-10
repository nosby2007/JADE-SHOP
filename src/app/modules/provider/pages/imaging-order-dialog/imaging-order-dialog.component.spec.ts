import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImagingOrderDialogComponent } from './imaging-order-dialog.component';

describe('ImagingOrderDialogComponent', () => {
  let component: ImagingOrderDialogComponent;
  let fixture: ComponentFixture<ImagingOrderDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ImagingOrderDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImagingOrderDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
