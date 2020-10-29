
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

