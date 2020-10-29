import { Injectable } from '@angular/core';
import * as uuid from 'uuid';
import { Observable, of } from 'rxjs';
import { TaskItem, TaskPriorityEnum } from './types';
import {
  IntegrationManagerService
} from '../integration/integration-manager.service';


/*
 *           Github     Redmine   Bugzilla
 *             /\         /\         /\
 *             ||         ||         ||
 *      .------||---------||---------||------.
 *      |      ||    INTEGRATIONS    ||      |
 *      |      ||         ||         ||      |
 *      |      \/         \/         \/      |
 *      |    ------     ------     ------    |
 *  .---|   |  GH  |   |  RM  |   |  BZ  |   |---.
 *  |   |    ------     ------     ------    |   |
 *  |   |         Integration Manager        |   |
 *  |   '------------------------------------'   |
 *  |                Task Server                 |
 *  '--------------------------------------------'
 *                      ||
 *                      \/
 *             .--------------------.
 *             |    Task Service    |
 *             '--------------------'
 */

abstract class TaskSourceService {

  public abstract drop(task_uuid: string): void;
  public abstract done(task_uuid: string): void;
  public abstract read(task_uuid: string): void;
}

export interface ServerTask {
  uuid: string;
  task: TaskItem;
  service: TaskSourceService;
}

declare type ServerBucketTasks = {[id: string]: TaskItem};

export interface ServerBucket {
  name: string;
  label: string;
  tasks: ServerBucketTasks;
}

export interface ServerResponse<T> {
  success: boolean;
  data?: T;
}

declare type ServerBuckets = {[id: string]: ServerBucket};


function rand(max: number): number {
  return Math.floor(Math.random() * Math.floor(max));
}


class ServerStorage {
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


@Injectable({
  providedIn: 'root'
})
export class TaskServerService {

  private _buckets: ServerBuckets = {} as ServerBuckets;
  private _task_by_uuid: {[id: string]: TaskItem} = {};
  private _bucket_by_task_uuid: {[id: string]: string} = {};
  private _tasks: TaskItem[] = [];
  private _storage: ServerStorage;
  private _last_updated: Date = new Date(0);


  public constructor(private _integration: IntegrationManagerService) {
    this._storage = new ServerStorage();

    this._createBucket("backlog", "Backlog");
    this._createBucket("next", "Next");
    this._createBucket("inprogress", "In Progress");
    this._createBucket("done", "Done");

    this._integration.getTasks().subscribe({
      next: (tasks: TaskItem[]) => {
        if (!tasks) {
          return;
        }
        this._createBucket("backlog", "Backlog");

        tasks.forEach( (task: TaskItem) => {
          if (task.uuid in this._task_by_uuid) {
            // task exists; should we update?
            if (task.updated_at === this._task_by_uuid[task.uuid].updated_at) {
              // no changes; ignore.
              return;
            }
            console.error("duplicate task? ", task);
            return;
          }
          this._task_by_uuid[task.uuid] = task;
          this._bucket_by_task_uuid[task.uuid] = "backlog";
          this._buckets.backlog.tasks[task.uuid] = task;
        });
      }
    });
    // this._createOrUpdateStorage();
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
    this._buckets = this._storage.get<ServerBuckets>("_buckets");
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
  ): ServerResponse<T> {
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

  public getBucket(
    bucket_name: string
  ): Observable<ServerResponse<ServerBucket>> {
    if (!(bucket_name in this._buckets)) {
      return of(this._createResponse(false));
    }
    return of(this._createResponse(true, this._buckets[bucket_name]));
  }

  public hasBucket(bucket_name: string): Observable<ServerResponse<void>> {
    return of(this._createResponse(this._hasBucket(bucket_name)));
  }

  public hasTaskInBucket(
    bucket_name: string,
    task_uuid: string
  ): Observable<ServerResponse<void>> {
    return of(this._createResponse(
      this._hasTaskInBucket(bucket_name, task_uuid)));
  }

  public move(
    task_uuid: string,
    from: string,
    to: string
  ): Observable<ServerResponse<void>> {
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
    const bucket_from: ServerBucket = this._buckets[from];
    const bucket_to: ServerBucket = this._buckets[to];
    const task: TaskItem = bucket_from.tasks[task_uuid];
    bucket_to.tasks[task.uuid] = task;
    delete bucket_from.tasks[task.uuid];
    this._updateStorage();
    return of(this._createResponse<void>(true));
  }

  public drop(
    from: string,
    task_uuid: string
  ): Observable<ServerResponse<void>> {
    if (!this._hasBucket(from)) {
      console.error(`mock > drop > no bucket ${from}`);
      return of(this._createResponse<void>(false));
    }
    if (!this._hasTaskInBucket(from, task_uuid)) {
      console.error(`mock > drop > no task ${task_uuid} in bucket ${from}`);
      return of(this._createResponse<void>(false));
    }
    const bucket: ServerBucket = this._buckets[from];
    delete bucket.tasks[task_uuid];
    this._updateStorage();
    return of(this._createResponse<void>(true));
  }

  public add(
    to: string,
    task: TaskItem[]
  ): boolean {
    return true;
  }

  public listBuckets(): Observable<ServerResponse<string[]>> {
    return of(
      this._createResponse<string[]>(true, Object.keys(this._buckets)));
  }

  public listTasks(): Observable<ServerResponse<TaskItem[]>> {
    return of(this._createResponse<TaskItem[]>(true, this._tasks));
  }
}
