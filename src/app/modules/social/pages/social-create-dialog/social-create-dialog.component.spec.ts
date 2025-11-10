import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SocialCreateDialogComponent } from './social-create-dialog.component';

describe('SocialCreateDialogComponent', () => {
  let component: SocialCreateDialogComponent;
  let fixture: ComponentFixture<SocialCreateDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SocialCreateDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SocialCreateDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
