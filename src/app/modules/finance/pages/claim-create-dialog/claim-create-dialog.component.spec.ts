import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClaimCreateDialogComponent } from './claim-create-dialog.component';

describe('ClaimCreateDialogComponent', () => {
  let component: ClaimCreateDialogComponent;
  let fixture: ComponentFixture<ClaimCreateDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClaimCreateDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClaimCreateDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
