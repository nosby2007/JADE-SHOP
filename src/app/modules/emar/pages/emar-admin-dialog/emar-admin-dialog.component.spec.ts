import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmarAdminDialogComponent } from './emar-admin-dialog.component';

describe('EmarAdminDialogComponent', () => {
  let component: EmarAdminDialogComponent;
  let fixture: ComponentFixture<EmarAdminDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmarAdminDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmarAdminDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
