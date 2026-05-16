export type Role = 'ADMIN' | 'MEMBER';
export type Status = 'TODO' | 'IN_PROGRESS' | 'DONE';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface ProjectSummary {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  myRole: Role;
  taskCount: number;
  memberCount: number;
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  myRole: Role;
  _count: { tasks: number; memberships: number };
}

export interface Member {
  id: string;
  role: Role;
  joinedAt: string;
  user: User;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: Status;
  priority: Priority;
  dueDate: string | null;
  projectId: string;
  assigneeId: string | null;
  createdAt: string;
  updatedAt: string;
  assignee: User | null;
  project?: { id: string; name: string };
}

export interface ProjectProgress {
  projectId: string;
  name: string;
  total: number;
  done: number;
  pctDone: number;
}

export interface DashboardData {
  myTasks: Task[];
  statusCounts: Record<Status, number>;
  overdue: Task[];
  projectsProgress: ProjectProgress[];
}
