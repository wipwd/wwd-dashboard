import { TestBed } from '@angular/core/testing';

import {
  TasksBucketInProgressService
} from './tasks-bucket-inprogress.service';

describe('TasksBucketInProgressService', () => {
  let service: TasksBucketInProgressService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TasksBucketInProgressService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
