import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewLabsDialogComponent } from './view-labs-dialog.component';

describe('ViewLabsDialogComponent', () => {
  let component: ViewLabsDialogComponent;
  let fixture: ComponentFixture<ViewLabsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewLabsDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewLabsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
