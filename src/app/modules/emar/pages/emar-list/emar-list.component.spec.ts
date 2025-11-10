import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmarListComponent } from './emar-list.component';

describe('EmarListComponent', () => {
  let component: EmarListComponent;
  let fixture: ComponentFixture<EmarListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmarListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmarListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
