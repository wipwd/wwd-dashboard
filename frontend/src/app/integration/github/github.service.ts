import { Injectable } from '@angular/core';
import { Octokit } from '@octokit/rest';
import { OctokitResponse } from '@octokit/types';
import {
  GithubNotificationResponseData,
  GithubNotificationEntryResponseData
} from './types';
import { TaskItem } from '../../tasks/types';
import {
  IntegrationService, IntegrationServiceConfig
} from '../types';

declare type ResponseType = OctokitResponse<GithubNotificationResponseData>;

@Injectable({
  providedIn: 'root'
})
export class GithubService extends IntegrationService {

  private _notifications: GithubNotificationEntryResponseData[] = [];
  private _tasks: TaskItem[] = [];

  constructor() {
    super();
    const octokit: Octokit = new Octokit({
      auth: "",
      log: console
    });

    octokit.activity.listNotificationsForAuthenticatedUser({
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
      // this._storeState();
    });
  }

  private _storeState(): void {
    const storage: Storage = window.localStorage;
    storage.setItem("_github_tasks", JSON.stringify(this._tasks));
    storage.setItem("_github_notifications",
      JSON.stringify(this._notifications));
  }

  private _handleNotification(
    notification: GithubNotificationEntryResponseData
  ): void {
    if (!this._wantsNotification(notification)) {
      return;
    }

    const task: TaskItem = {
      priority: 10,
      url: notification.subject.url,
      title: notification.subject.title,
      updated_at: new Date(notification.updated_at),
      uuid: `github_${notification.id}`
    };
    this._tasks.push(task);
  }

  private _wantsNotification(
    notification: GithubNotificationEntryResponseData
  ): boolean {
    if (notification.reason === "mention" ||
        notification.reason === "review_requested" ||
        notification.reason === "assign") {
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
