import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProviderCreateDialogComponent } from './provider-create-dialog.component';

describe('ProviderCreateDialogComponent', () => {
  let component: ProviderCreateDialogComponent;
  let fixture: ComponentFixture<ProviderCreateDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProviderCreateDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProviderCreateDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
