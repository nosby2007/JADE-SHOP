import { TestBed } from '@angular/core/testing';

import { DatalistService } from './datalist.service';

describe('DatalistService', () => {
  let service: DatalistService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DatalistService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
