import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SkinWoundComponent } from './skin-wound.component';

describe('SkinWoundComponent', () => {
  let component: SkinWoundComponent;
  let fixture: ComponentFixture<SkinWoundComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SkinWoundComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SkinWoundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
