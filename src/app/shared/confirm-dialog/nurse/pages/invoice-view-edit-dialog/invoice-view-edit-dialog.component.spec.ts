import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvoiceViewEditDialogComponent } from './invoice-view-edit-dialog.component';

describe('InvoiceViewEditDialogComponent', () => {
  let component: InvoiceViewEditDialogComponent;
  let fixture: ComponentFixture<InvoiceViewEditDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InvoiceViewEditDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InvoiceViewEditDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
