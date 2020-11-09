import { TestBed } from '@angular/core/testing';

import { TaskServerService } from './task-server.service';

describe('TaskServerService', () => {
  let service: TaskServerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TaskServerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
