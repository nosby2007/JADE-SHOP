import { TestBed } from '@angular/core/testing';

import { NursePatientApiService } from './nurse-patient-api.service';

describe('NursePatientApiService', () => {
  let service: NursePatientApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NursePatientApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
