import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReferralCreateDialogComponent } from './referral-create-dialog.component';

describe('ReferralCreateDialogComponent', () => {
  let component: ReferralCreateDialogComponent;
  let fixture: ComponentFixture<ReferralCreateDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReferralCreateDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReferralCreateDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
