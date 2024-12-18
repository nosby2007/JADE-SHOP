import { TestBed } from '@angular/core/testing';

import { ProfessionelsService } from './professionels.service';

describe('ProfessionelsService', () => {
  let service: ProfessionelsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProfessionelsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
