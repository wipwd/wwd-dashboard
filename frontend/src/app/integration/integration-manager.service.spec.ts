import { TestBed } from '@angular/core/testing';

import { IntegrationManagerService } from './integration-manager.service';

describe('IntegrationManagerService', () => {
  let service: IntegrationManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IntegrationManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
