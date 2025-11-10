import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MdsCreateDialogComponent } from './mds-create-dialog.component';

describe('MdsCreateDialogComponent', () => {
  let component: MdsCreateDialogComponent;
  let fixture: ComponentFixture<MdsCreateDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MdsCreateDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MdsCreateDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
