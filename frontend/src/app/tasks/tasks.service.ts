import { Injectable } from '@angular/core';
import { BehaviorSubject, interval, Observable, of } from 'rxjs';
import * as uuid from 'uuid';


export enum TaskPriorityEnum {
  none = 0,
  low = 10,
  medium = 20,
  high = 90
}

export interface TaskItem {
  uuid: string;
  updated_at: Date;
  title: string;
  priority: TaskPriorityEnum;
  url: string;
}


export abstract class TasksBucketBaseService {

  protected _tasks: TaskItem[] = [];
  protected _tasks_by_priority: {[id: number]: TaskItem[]} = {};
  protected _subject_tasks_svc: BehaviorSubject<TaskItem[]>;
  protected _subject_tasks_update: BehaviorSubject<TaskItem[]> =
    new BehaviorSubject<TaskItem[]>([]);
  protected _subject_tasks_total: BehaviorSubject<number> =
    new BehaviorSubject<number>(0);

  protected constructor(protected _svc: TasksService) {
    this._subject_tasks_svc = this._obtainTaskSubject();
    this._subject_tasks_svc.subscribe({
      next: (tasks: TaskItem[]) => {
        if (!tasks) {
          return;
        }
        this._updateTasks(tasks);
      }
    });
  }

  private _updateTasks(tasks: TaskItem[]): void {
    tasks.forEach( (task: TaskItem) => {
      const prio: TaskPriorityEnum = task.priority;
      if (!(prio in this._tasks_by_priority)) {
        this._tasks_by_priority[prio] = [];
      }
    });
    this._tasks = tasks;
    this._subject_tasks_update.next(tasks);
    this._subject_tasks_total.next(tasks.length);
    this._tasksUpdated();
  }

  public getTasksObserver(): BehaviorSubject<TaskItem[]> {
    return this._subject_tasks_update;
  }

  public getTasksTotalObserver(): BehaviorSubject<number> {
    return this._subject_tasks_total;
  }

  public get length(): number {
    return this._tasks.length;
  }

  protected abstract _tasksUpdated(): void;
  protected abstract _obtainTaskSubject(): BehaviorSubject<TaskItem[]>;
}


function rand(max: number): number {
  return Math.floor(Math.random() * Math.floor(max));
}

class MockServer {

  private _backlog: TaskItem[];
  private _next: TaskItem[];
  private _inprogress: TaskItem[];
  private _done: TaskItem[];

  public constructor() {
    this._backlog = [
      {
        uuid: uuid.v4(),
        updated_at: new Date(),
        title: "My Test Task A",
        priority: TaskPriorityEnum.medium,
        url: "https://fail.wipwd.dev/task/a"
      },
      {
        uuid: uuid.v4(),
        updated_at: new Date(),
        title: "My Test Task B",
        priority: TaskPriorityEnum.high,
        url: "https://fail.wipwd.dev/task/b"
      },
      {
        uuid: uuid.v4(),
        updated_at: new Date(),
        title: "My Test Task C",
        priority: TaskPriorityEnum.low,
        url: "https://fail.wipwd.dev/task/c"
      },
      {
        uuid: uuid.v4(),
        updated_at: new Date(),
        title: "My Test Task D",
        priority: TaskPriorityEnum.none,
        url: "https://fail.wipwd.dev/task/d"
      }
    ];
    this._next = [];
    this._inprogress = [];
    this._done = [];
  }

  public tick(): void {
    if (!this._backlog || this._backlog.length === 0) {
      return;
    }
    // update a task in each bucket.
    const _backlog_item: number = rand(this._backlog.length);
    const _next_item: number = rand(this._next.length);

    if (this._backlog.length > 0) {
      this._backlog[_backlog_item].updated_at = new Date();
    }
    if (this._next.length > 0) {
      this._next[_next_item].updated_at = new Date();
    }
  }

  public getBucket(bucket_name: string): Observable<TaskItem[]|undefined> {
    switch (bucket_name) {
      case "backlog":
        return of(this._backlog);
      case "next":
        return of(this._next);
      case "inprogress":
        return of(this._inprogress);
      case "done":
        return of(this._done);
      default:
        return of(undefined);
    }
  }
}


@Injectable({
  providedIn: 'root'
})
export class TasksService {

  private _bucket_backlog: TaskItem[] = [];
  private _bucket_next: TaskItem[] = [];
  private _bucket_inprogress: TaskItem[] = [];
  private _bucket_done: TaskItem[] = [];
  private _server: MockServer;

  private _subject_backlog: BehaviorSubject<TaskItem[]> =
    new BehaviorSubject<TaskItem[]>([]);
  private _subject_next: BehaviorSubject<TaskItem[]> =
    new BehaviorSubject<TaskItem[]>([]);
  private _subject_inprogress: BehaviorSubject<TaskItem[]> =
    new BehaviorSubject<TaskItem[]>([]);
  private _subject_done: BehaviorSubject<TaskItem[]> =
    new BehaviorSubject<TaskItem[]>([]);


  constructor() {
    this._server = new MockServer();
    interval(5000).subscribe( () => {
      this._server.tick();
      this._updateBuckets();
    });
    this._updateBuckets();
  }

  private _updateBuckets(): void {
    const backlog_observer: Observable<TaskItem[]> =
      this._server.getBucket("backlog");
    const next_observer: Observable<TaskItem[]> =
      this._server.getBucket("next");
    const inprogress_observer: Observable<TaskItem[]> =
      this._server.getBucket("inprogress");
    const done_observer: Observable<TaskItem[]> =
      this._server.getBucket("done");
    if (!!backlog_observer) {
      backlog_observer.subscribe({
        next: (items: TaskItem[]) => {
          this._bucket_backlog = items;
          this._subject_backlog.next(items);
        }
      });
    }
    if (!!next_observer) {
      next_observer.subscribe({
        next: (items: TaskItem[]) => {
          this._bucket_next = items;
          this._subject_next.next(items);
        }
      });
    }
    if (!!inprogress_observer) {
      inprogress_observer.subscribe({
        next: (items: TaskItem[]) => {
          this._bucket_inprogress = items;
          this._subject_inprogress.next(items);
        }
      });
    }
    if (!!done_observer) {
      done_observer.subscribe({
        next: (items: TaskItem[]) => {
          this._bucket_done = items;
          this._subject_done.next(items);
        }
      });
    }
  }

  public getBacklog(): BehaviorSubject<TaskItem[]> {
    return this._subject_backlog;
  }

  public getNext(): BehaviorSubject<TaskItem[]> {
    return this._subject_next;
  }

  public getInProgress(): BehaviorSubject<TaskItem[]> {
    return this._subject_inprogress;
  }

  public getDone(): BehaviorSubject<TaskItem[]> {
    return this._subject_done;
  }
}
