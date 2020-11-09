
export enum TaskPriorityEnum {
  none = 0,
  low = 10,
  medium = 20,
  high = 90
}

export interface TaskInfoIcon {
  icon: string;
  svg: boolean;
}

export interface TaskItem {
  uuid: string;
  updated_at: Date;
  title: string;
  priority: TaskPriorityEnum;
  url: string;
  // list of icon names, specified by the source.
  source_info_icons?: TaskInfoIcon[];
}

