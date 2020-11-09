import { Injectable } from '@angular/core';
import { Octokit } from '@octokit/rest';
import { OctokitResponse } from '@octokit/types';
import {
  GithubNotificationResponseData,
  GithubNotificationEntryResponseData
} from './types';
import { TaskInfoIcon, TaskItem, TaskPriorityEnum } from '../../tasks/types';
import {
  IntegrationService, IntegrationServiceConfig
} from '../types';
import { interval } from 'rxjs';

declare type ResponseType = OctokitResponse<GithubNotificationResponseData>;

const NOTIFICATION_PRIORITIES: {[id: string]: TaskPriorityEnum} = {
  review_requested: TaskPriorityEnum.high,
  mention: TaskPriorityEnum.medium,
  assign: TaskPriorityEnum.high,
  author: TaskPriorityEnum.high
};

@Injectable({
  providedIn: 'root'
})
export class GithubService extends IntegrationService {

  private _octokit: Octokit;
  private _notifications: GithubNotificationEntryResponseData[] = [];
  private _tasks: TaskItem[] = [];
  private _tasks_by_uuid: {[id: string]: TaskItem} = {};
  private _last_update: Date = new Date(0);

  constructor() {
    super();
    this._octokit = new Octokit({
      auth: "",
      log: console
    });

    this._loadState();

    interval(10000).subscribe({
      next: () => { this._obtainState(); }
    });
    this._obtainState();
  }

  private _obtainState(): void {
    const now: Date = new Date();
    if ((now.getTime() - this._last_update.getTime()) < 60000) {
      console.debug("github updated recently, skip update.");
      return;
    }
    this._obtainNotifications();
    this._storeState();
  }

  private _obtainNotifications(): void {
    this._octokit.activity.listNotificationsForAuthenticatedUser({
      participating: true
    })
    .then( ({data: result}: ResponseType) => {
      this._tasks = [];
      this._notifications = [];
      result.forEach( (entry: GithubNotificationEntryResponseData) => {
        this._handleNotification(entry);
        this._notifications.push(entry);
      });
      this._updateTasks(this._tasks);
    });

  }

  private _loadState(): void {
    const storage: Storage = window.localStorage;
    const last_update: string|null = storage.getItem("_github_last_update");
    const tasks: string|null = storage.getItem("_github_tasks");
    const notifications: string|null = storage.getItem("_github_notifications");

    if (!!last_update) {
      this._last_update = new Date(JSON.parse(last_update));
    }
    if (!!tasks) {
      this._tasks = JSON.parse(tasks);
      this._tasks.forEach( (task: TaskItem) => {
        task.updated_at = new Date(task.updated_at);
      });
    }
    if (!!notifications) {
      this._notifications = JSON.parse(notifications);
    }
    this._updateTasks(this._tasks);
  }

  private _storeState(): void {
    const storage: Storage = window.localStorage;
    storage.setItem("_github_tasks", JSON.stringify(this._tasks));
    storage.setItem("_github_notifications",
      JSON.stringify(this._notifications));
    storage.setItem("_github_last_update", JSON.stringify(new Date()));
  }

  private _handleNotification(
    notification: GithubNotificationEntryResponseData
  ): void {
    if (!this._wantsNotification(notification)) {
      return;
    }
    const task_icons: TaskInfoIcon[] = [{icon: "github", svg: true}];
    if (notification.reason === "assign") {
      task_icons.push({icon: "assignment_late", svg: false});
    } else if (notification.reason === "mention") {
      task_icons.push({icon: "chat", svg: false});
    } else if (notification.reason === "review_requested") {
      task_icons.push({icon: "rate_review", svg: false});
    }

    const task: TaskItem = {
      priority: NOTIFICATION_PRIORITIES[notification.reason],
      url: notification.subject.url,
      title: notification.subject.title,
      updated_at: new Date(notification.updated_at),
      uuid: `_github_notification_${notification.id}`,
      source_info_icons: task_icons
    };
    this._tasks.push(task);
  }

  private _wantsNotification(
    notification: GithubNotificationEntryResponseData
  ): boolean {
    if (notification.reason in NOTIFICATION_PRIORITIES) {
      return true;
    }
    return false;
  }

  protected _getName(): string {
    return "github";
  }

  public done(task_uuid: string): void { }
  public drop(task_uuid: string): void { }
  public read(task_uuid: string): void { }
  public remove(task_uuid: string): void { }
  public getConfig(): IntegrationServiceConfig {
    return { name: "github" };
  }
}
