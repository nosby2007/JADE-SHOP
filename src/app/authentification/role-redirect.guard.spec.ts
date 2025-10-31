import { TestBed } from '@angular/core/testing';

import { RoleRedirectGuard } from './role-redirect.guard';

describe('RoleRedirectGuard', () => {
  let guard: RoleRedirectGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(RoleRedirectGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
