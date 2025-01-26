import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnbiotiqueModalComponent } from './anbiotique-modal.component';

describe('AnbiotiqueModalComponent', () => {
  let component: AnbiotiqueModalComponent;
  let fixture: ComponentFixture<AnbiotiqueModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AnbiotiqueModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnbiotiqueModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
