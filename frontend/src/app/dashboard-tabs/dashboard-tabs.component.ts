import { Component, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { TasksBucketBacklogService } from '../tasks/tasks-bucket-backlog.service';
import { TasksBucketBaseService } from '../tasks/tasks.service';
import { TasksBucketNextService } from '../tasks/tasks-bucket-next.service';
import {
  TasksBucketInProgressService
} from '../tasks/tasks-bucket-inprogress.service';
import { TasksBucketDoneService } from '../tasks/tasks-bucket-done.service';

declare type BucketEntryType = {
  name: string;
  label: string;
};

@Component({
  selector: 'app-dashboard-tabs',
  templateUrl: './dashboard-tabs.component.html',
  styleUrls: ['./dashboard-tabs.component.scss']
})
export class DashboardTabsComponent implements OnInit {

  private _bucket_length_backlog: number = 0;
  private _bucket_length_next: number = 0;
  private _bucket_length_inprogress: number = 0;
  private _bucket_length_done: number = 0;

  constructor(
    private _backlog_tasks_svc: TasksBucketBacklogService,
    private _next_tasks_svc: TasksBucketNextService,
    private _inprogress_tasks_svc: TasksBucketInProgressService,
    private _done_tasks_svc: TasksBucketDoneService
  ) { }

  ngOnInit(): void {
    this._backlog_tasks_svc.getTasksTotalObserver().subscribe({
      next: (len: number) => {
        this._bucket_length_backlog = len;
      }
    });
    this._next_tasks_svc.getTasksTotalObserver().subscribe({
      next: (len: number) => {
        this._bucket_length_next = len;
      }
    });
    this._inprogress_tasks_svc.getTasksTotalObserver().subscribe({
      next: (len: number) => {
        this._bucket_length_inprogress = len;
      }
    });
    this._done_tasks_svc.getTasksTotalObserver().subscribe({
      next: (len: number) => {
        this._bucket_length_done = len;
      }
    });
  }

  // this is ugly, but it works for now. It's late, I'm lazy.
  private _getCounterString(len: number): string {
    if (len > 0) {
      return `(${len})`;
    }
    return "";
  }

  public getBacklogCounter(): string {
    return this._getCounterString(this._bucket_length_backlog);
  }

  public getNextCounter(): string {
    return this._getCounterString(this._bucket_length_next);
  }

  public getInProgressCounter(): string {
    return this._getCounterString(this._bucket_length_inprogress);
  }

  public getDoneCounter(): string {
    return this._getCounterString(this._bucket_length_done);
  }

  public getBacklogService(): TasksBucketBaseService {
    return this._backlog_tasks_svc;
  }

  public getNextService(): TasksBucketBaseService {
    return this._next_tasks_svc;
  }

  public getInProgressService(): TasksBucketBaseService {
    return this._inprogress_tasks_svc;
  }

  public getDoneService(): TasksBucketBaseService {
    return this._done_tasks_svc;
  }
}
