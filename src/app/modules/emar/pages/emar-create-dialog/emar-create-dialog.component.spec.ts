import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmarCreateDialogComponent } from './emar-create-dialog.component';

describe('EmarCreateDialogComponent', () => {
  let component: EmarCreateDialogComponent;
  let fixture: ComponentFixture<EmarCreateDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmarCreateDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmarCreateDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
