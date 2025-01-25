import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CountDownModalComponent } from './count-down-modal.component';

describe('CountDownModalComponent', () => {
  let component: CountDownModalComponent;
  let fixture: ComponentFixture<CountDownModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CountDownModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CountDownModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
