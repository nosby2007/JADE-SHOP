import { TestBed } from '@angular/core/testing';

import { NurseDataService } from './nurse-data.service';

describe('NurseDataService', () => {
  let service: NurseDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NurseDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
