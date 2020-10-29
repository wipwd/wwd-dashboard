import { Injectable } from '@angular/core';
import { BehaviorSubject, interval, Observable, of } from 'rxjs';
import {
  TaskServerService,
  ServerBucket,
  ServerResponse
} from './task-server.service';


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

  protected constructor(
    protected _svc: TasksService,
    protected _bucket_name: string
  ) {
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

  public getBucketName(): string {
    return this._bucket_name;
  }

  protected abstract _tasksUpdated(): void;
  protected abstract _obtainTaskSubject(): BehaviorSubject<TaskItem[]>;
}


@Injectable({
  providedIn: 'root'
})
export class TasksService {

  // private _server: MockServer;
  private _buckets: {[id: string]: ServerBucket} = {};
  private _bucket_subjects: {[id: string]: BehaviorSubject<TaskItem[]>} = {};

  constructor(private _server: TaskServerService) {
    // this._server = new MockServer();
    interval(5000).subscribe( () => {
      this._server.tick();
      this._updateBuckets();
    });
    this._updateBuckets();
  }

  private _updateBucket(bucketname: string): void {
    this._server.getBucket(bucketname).subscribe({
      next: (response: ServerResponse<ServerBucket>) => {
        // console.log(`task-svc > getBucket(${bucketname}) > `, response);
        if (!response || !response.success || !response.data) {
          return;
        }
        const bucket: ServerBucket = response.data;
        this._buckets[bucket.name] = bucket;
        if (!(bucket.name in this._bucket_subjects)) {
          this._bucket_subjects[bucket.name] =
            new BehaviorSubject<TaskItem[]>([]);
        }
        this._bucket_subjects[bucket.name].next(Object.values(bucket.tasks));
      }
    });
  }

  private _updateBuckets(): void {

    this._server.listBuckets().subscribe({
      next: (response: ServerResponse<string[]>) => {
        if (!response || !response.success || !response.data) {
          return;
        }
        response.data.forEach( (bucket: string) => {
          this._updateBucket(bucket);
        });
      }
    });
  }

  public getBucket(bucketname: string): BehaviorSubject<TaskItem[]> {
    if (!(bucketname in this._bucket_subjects)) {
      this._bucket_subjects[bucketname] =
        new BehaviorSubject<TaskItem[]>([]);
    }
    return this._bucket_subjects[bucketname];
  }

  public move(
    task: TaskItem,
    from: TasksBucketBaseService,
    to: TasksBucketBaseService
  ): void {
    this._server.move(
      task.uuid, from.getBucketName(), to.getBucketName()
    ).subscribe({
      next: () => {
        this._updateBuckets();
      }
    });
  }

  public drop(from: TasksBucketBaseService, task: TaskItem): void {
    this._server.drop(from.getBucketName(), task.uuid).subscribe({
      next: () => {
        this._updateBuckets();
      }
    });
  }
}
