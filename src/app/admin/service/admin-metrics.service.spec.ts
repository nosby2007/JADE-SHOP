import { TestBed } from '@angular/core/testing';

import { AdminMetricsService } from './admin-metrics.service';

describe('AdminMetricsService', () => {
  let service: AdminMetricsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdminMetricsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
