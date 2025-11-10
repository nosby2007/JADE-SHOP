import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProviderShellComponent } from './provider-shell.component';

describe('ProviderShellComponent', () => {
  let component: ProviderShellComponent;
  let fixture: ComponentFixture<ProviderShellComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProviderShellComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProviderShellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
