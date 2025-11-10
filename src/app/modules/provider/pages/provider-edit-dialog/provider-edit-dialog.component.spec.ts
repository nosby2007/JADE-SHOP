import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProviderEditDialogComponent } from './provider-edit-dialog.component';

describe('ProviderEditDialogComponent', () => {
  let component: ProviderEditDialogComponent;
  let fixture: ComponentFixture<ProviderEditDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProviderEditDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProviderEditDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
