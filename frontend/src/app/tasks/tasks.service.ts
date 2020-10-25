import { UniqueSelectionDispatcher } from '@angular/cdk/collections';
import { Injectable } from '@angular/core';
import { BehaviorSubject, interval, Observable, of } from 'rxjs';
import * as uuid from 'uuid';


enum TaskPriority {
  none = 0,
  low = 10,
  medium = 20,
  high = 90
}

export interface TaskItem {
  uuid: string;
  updated_at: Date;
  title: string;
  priority: TaskPriority;
  url: string;
}

function rand(max: number) {
  return Math.floor(Math.random() * Math.floor(max));
}

class MockServer {

  private _backlog: TaskItem[];
  private _next: TaskItem[];

  public constructor() {
    this._backlog = [
      {
        uuid: uuid.v4(),
        updated_at: new Date(),
        title: "My Test Task A",
        priority: TaskPriority.medium,
        url: "https://fail.wipwd.dev/task/a"
      },
      {
        uuid: uuid.v4(),
        updated_at: new Date(),
        title: "My Test Task B",
        priority: TaskPriority.high,
        url: "https://fail.wipwd.dev/task/b"
      },
      {
        uuid: uuid.v4(),
        updated_at: new Date(),
        title: "My Test Task C",
        priority: TaskPriority.low,
        url: "https://fail.wipwd.dev/task/c"
      },
      {
        uuid: uuid.v4(),
        updated_at: new Date(),
        title: "My Test Task D",
        priority: TaskPriority.none,
        url: "https://fail.wipwd.dev/task/d"
      }
    ];
    this._next = [];
  }

  public tick(): void {
    // update a task in each bucket.
    const _backlog_item: number = rand(this._backlog.length);
    const _next_item: number = rand(this._next.length);

    this._backlog[_backlog_item].updated_at = new Date();
    this._next[_next_item].updated_at = new Date();
  }

  public getBucket(bucket_name: string): Observable<TaskItem[]|undefined> {
    switch (bucket_name) {
      case "backlog":
        return of(this._backlog);
      case "next":
        return of(this._next);
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
  private _server: MockServer;

  private _subject_backlog: BehaviorSubject<TaskItem[]> =
    new BehaviorSubject<TaskItem[]>([]);
  private _subject_next: BehaviorSubject<TaskItem[]> =
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
    this._server.getBucket("backlog").subscribe({
      next: (items: TaskItem[]) => {
        this._bucket_backlog = items;
        this._subject_backlog.next(this._bucket_backlog);
      }
    });
    this._server.getBucket("next").subscribe({
      next: (items: TaskItem[]) => {
        this._bucket_next = items;
        this._subject_next.next(this._bucket_next);
      }
    });
  }

  public getBacklog(): BehaviorSubject<TaskItem[]> {
    return this._subject_backlog;
  }

  public getNext(): BehaviorSubject<TaskItem[]> {
    return this._subject_next;
  }
}
