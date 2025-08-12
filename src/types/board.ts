export type BoardProgressItem = {
  name: string;
  current: number;
  total: number;
};

export interface RecentUser {
  act: string;
  name: string;
  username: string;
  status: string;
  team: string;
}

export interface RecentRepo {
  act: string;
  domain: string;
  subgroup: string;
  fullPath: string;
  team: string;
}

export interface RecentJob {
  time: string;
  jobId: string;
  pipelineId: string;
  fullPath: string;
  team: string;
}
