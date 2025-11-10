import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmarShellComponent } from './emar-shell.component';

describe('EmarShellComponent', () => {
  let component: EmarShellComponent;
  let fixture: ComponentFixture<EmarShellComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmarShellComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmarShellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
