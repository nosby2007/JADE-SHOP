import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgesModalComponent } from './proges-modal.component';

describe('ProgesModalComponent', () => {
  let component: ProgesModalComponent;
  let fixture: ComponentFixture<ProgesModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProgesModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProgesModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
