import { TestBed } from '@angular/core/testing';

import { CloudPrintService } from './cloud-print.service';

describe('CloudPrintService', () => {
  let service: CloudPrintService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CloudPrintService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
