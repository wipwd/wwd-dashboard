import { TestBed } from '@angular/core/testing';

import { TasksBucketDoneService } from './tasks-bucket-done.service';

describe('TasksBucketDoneService', () => {
  let service: TasksBucketDoneService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TasksBucketDoneService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
