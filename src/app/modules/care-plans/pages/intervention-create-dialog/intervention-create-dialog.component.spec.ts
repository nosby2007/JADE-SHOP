import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InterventionCreateDialogComponent } from './intervention-create-dialog.component';

describe('InterventionCreateDialogComponent', () => {
  let component: InterventionCreateDialogComponent;
  let fixture: ComponentFixture<InterventionCreateDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InterventionCreateDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InterventionCreateDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
