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


function rand(max: number): number {
  return Math.floor(Math.random() * Math.floor(max));
}

declare type MockBucketTasks = {[id: string]: TaskItem};

export interface MockBucket {
  name: string;
  label: string;
  tasks: MockBucketTasks;
}

export interface MockResponse<T> {
  success: boolean;
  data?: T;
}


class MockServerStorage {
  private _storage: Storage;
  // private _last_updated: Date = new Date(0);

  public constructor() {
    this._storage = window.localStorage;
  }

  public has(key: string): boolean {
    return (this._storage.getItem(key) !== null);
  }

  public get<T>(key: string): T|null {
    if (!this.has(key)) {
      return undefined;
    }
    return JSON.parse(this._storage.getItem(key));
  }

  public set(key: string, value: any): void {
    this._storage.setItem(key, JSON.stringify(value));
  }

  public remove(key: string): void {
    this._storage.removeItem(key);
  }
}

declare type MockBuckets = {[id: string]: MockBucket};

class MockServer {

  private _buckets: MockBuckets = {};
  private _tasks: TaskItem[] = [];
  private _storage: MockServerStorage;
  private _last_updated: Date = new Date(0);

  public constructor() {
    this._storage = new MockServerStorage();
    this._createOrUpdateStorage();

  }

  private _createOrUpdateStorage(): void {
    if (!this._storage.has("last_updated")) {
      this._createStorage();
    }
    this._updateFromStorage();
  }

  private _createStorage(): void {

    const taskA: TaskItem = {
      uuid: uuid.v4(),
      updated_at: new Date(),
      title: "My Test Task A",
      priority: TaskPriorityEnum.medium,
      url: "https://fail.wipwd.dev/task/a"
    };
    const taskB: TaskItem = {
      uuid: uuid.v4(),
      updated_at: new Date(),
      title: "My Test Task B",
      priority: TaskPriorityEnum.high,
      url: "https://fail.wipwd.dev/task/b"
    };
    const taskC: TaskItem = {
      uuid: uuid.v4(),
      updated_at: new Date(),
      title: "My Test Task C",
      priority: TaskPriorityEnum.low,
      url: "https://fail.wipwd.dev/task/c"
    };
    const taskD: TaskItem = {
      uuid: uuid.v4(),
      updated_at: new Date(),
      title: "My Test Task D",
      priority: TaskPriorityEnum.none,
      url: "https://fail.wipwd.dev/task/d"
    };

    this._createBucket("backlog", "Backlog");
    this._createBucket("next", "Next");
    this._createBucket("inprogress", "In Progress");
    this._createBucket("done", "Done");

    this._buckets.backlog.tasks[taskA.uuid] = taskA;
    this._buckets.backlog.tasks[taskB.uuid] = taskB;
    this._buckets.backlog.tasks[taskC.uuid] = taskC;
    this._buckets.backlog.tasks[taskD.uuid] = taskD;
    this._tasks = [taskA, taskB, taskC, taskD];
    this._last_updated = new Date();

    this._writeToStorage();
  }

  private _writeToStorage(): void {
    this._storage.set("_buckets", this._buckets);
    this._storage.set("_tasks", this._tasks);
    this._storage.set("last_updated", this._last_updated);
  }

  private _updateFromStorage(): void {
    this._buckets = this._storage.get<MockBuckets>("_buckets");
    this._tasks = this._storage.get<TaskItem[]>("_tasks");
    this._last_updated = this._storage.get<Date>("last_updated");
  }

  private _updateStorage(): void {
    this._writeToStorage();
    this._updateFromStorage();
  }

  private _hasBucket(bucket_name: string): boolean {
    return (bucket_name in this._buckets);
  }

  private _hasTaskInBucket(bucket_name: string, task_uuid: string): boolean {
    if (!this._hasBucket(bucket_name)) {
      return false;
    }
    if (!(task_uuid in this._buckets[bucket_name].tasks)) {
      return false;
    }
    return true;
  }

  private _createBucket(bucket_name: string, bucket_label: string): void {
    if (this._hasBucket(bucket_name)) {
      return;
    }
    this._buckets[bucket_name] = {
      name: bucket_name,
      label: bucket_label,
      tasks: {}
    };
  }

  private _createResponse<T>(
    _success: boolean,
    _data?: T
  ): MockResponse<T> {
    return { success: _success, data: _data};
  }

  public tick(): void {
    // update random task.
    if (this._tasks.length === 0) {
      return;
    }
    const _task_idx: number = rand(this._tasks.length);
    this._tasks[_task_idx].updated_at = new Date();
  }

  public getBucket(bucket_name: string): Observable<MockResponse<MockBucket>> {
    if (!(bucket_name in this._buckets)) {
      return of(this._createResponse(false));
    }
    return of(this._createResponse(true, this._buckets[bucket_name]));
  }

  public hasBucket(bucket_name: string): Observable<MockResponse<void>> {
    return of(this._createResponse(this._hasBucket(bucket_name)));
  }

  public hasTaskInBucket(
    bucket_name: string,
    task_uuid: string
  ): Observable<MockResponse<void>> {
    return of(this._createResponse(
      this._hasTaskInBucket(bucket_name, task_uuid)));
  }

  public move(
    task_uuid: string,
    from: string,
    to: string
  ): Observable<MockResponse<void>> {
    if (!this._hasBucket(from)) {
      console.error(`mock > move > no bucket ${from}`);
      return of(this._createResponse<void>(false));
    }
    if (!this._hasTaskInBucket(from, task_uuid)) {
      console.error(`mock > move > no task ${task_uuid} in bucket ${from}`);
      return of(this._createResponse<void>(false));
    }
    if (!this._hasBucket(to)) {
      console.error(`mock > move > no dest bucket ${to}`);
      return of(this._createResponse<void>(false));
    }
    const bucket_from: MockBucket = this._buckets[from];
    const bucket_to: MockBucket = this._buckets[to];
    const task: TaskItem = bucket_from.tasks[task_uuid];
    bucket_to.tasks[task.uuid] = task;
    delete bucket_from.tasks[task.uuid];
    this._updateStorage();
    return of(this._createResponse<void>(true));
  }

  public drop(
    from: string,
    task_uuid: string
  ): Observable<MockResponse<void>> {
    if (!this._hasBucket(from)) {
      console.error(`mock > drop > no bucket ${from}`);
      return of(this._createResponse<void>(false));
    }
    if (!this._hasTaskInBucket(from, task_uuid)) {
      console.error(`mock > drop > no task ${task_uuid} in bucket ${from}`);
      return of(this._createResponse<void>(false));
    }
    const bucket: MockBucket = this._buckets[from];
    delete bucket.tasks[task_uuid];
    this._updateStorage();
    return of(this._createResponse<void>(true));
  }

  public listBuckets(): Observable<MockResponse<string[]>> {
    return of(
      this._createResponse<string[]>(true, Object.keys(this._buckets)));
  }

  public listTasks(): Observable<MockResponse<TaskItem[]>> {
    return of(this._createResponse<TaskItem[]>(true, this._tasks));
  }
}


@Injectable({
  providedIn: 'root'
})
export class TasksService {

  private _server: MockServer;
  private _buckets: {[id: string]: MockBucket} = {};
  private _bucket_subjects: {[id: string]: BehaviorSubject<TaskItem[]>} = {};

  constructor() {
    this._server = new MockServer();
    interval(5000).subscribe( () => {
      this._server.tick();
      this._updateBuckets();
    });
    this._updateBuckets();
  }

  private _updateBucket(bucketname: string): void {
    this._server.getBucket(bucketname).subscribe({
      next: (response: MockResponse<MockBucket>) => {
        // console.log(`task-svc > getBucket(${bucketname}) > `, response);
        if (!response || !response.success || !response.data) {
          return;
        }
        const bucket: MockBucket = response.data;
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
      next: (response: MockResponse<string[]>) => {
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
