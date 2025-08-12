// src/mock/mockData.ts
import { BoardProgressItem, RecentJob, RecentRepo, RecentUser } from "../types/board";

export const infoDataMock = {
  licenseTotal: 590,
  Maximum: 580,
  userActive: 550,
  userInactive: 1200,
  userEtc: 30,
};

export const licenseUsageMock = {
  current: infoDataMock.userActive,
  total: infoDataMock.licenseTotal,
};

export const projectsMock: BoardProgressItem[] = [
  { name: "프로젝트 1", current: 12, total: 20 },
  { name: "프로젝트 2", current: 7, total: 10 },
  { name: "프로젝트 3", current: 5, total: 15 },
  { name: "프로젝트 4", current: 25, total: 25 },
  { name: "프로젝트 5", current: 7, total: 10 },
  { name: "프로젝트 6", current: 5, total: 15 },
  { name: "프로젝트 7", current: 25, total: 25 },
];

export const teamsMock: BoardProgressItem[] = [
  { name: "팀 1", current: 3, total: 8 },
  { name: "팀 2", current: 6, total: 12 },
  { name: "팀 3", current: 10, total: 10 },
  { name: "팀 4", current: 15, total: 7 },
  { name: "팀 5", current: 7, total: 9 },
  { name: "팀 6", current: 8, total: 16 },
  { name: "팀 7", current: 1, total: 5 },
  { name: "팀 8", current: 7, total: 9 },
  { name: "팀 9", current: 8, total: 16 },
  { name: "팀 10", current: 1, total: 5 },
];
export const RecentUserMock: RecentUser[] = [
  { act: "new", name: "홍길동", username: "user001", status: "활성", team: "팀 1" },
  { act: "ban", name: "김철수", username: "user002", status: "비활성", team: "팀 2" },
  { act: "lock", name: "이영희", username: "user003", status: "활성", team: "팀 3" },
  { act: "new", name: "박민수", username: "user004", status: "비활성", team: "팀 4" },
  { act: "new", name: "최유리", username: "user005", status: "활성", team: "팀 5" },
];
export const RecentRepoMock: RecentRepo[] = [
  { act: "new", domain: "domain1.com", subgroup: "subA", fullPath: "/domain1/subA", team: "팀 1" },
  { act: "update", domain: "domain2.com", subgroup: "subB", fullPath: "/domain2/subB", team: "팀 2" },
  { act: "delete", domain: "domain3.com", subgroup: "subC", fullPath: "/domain3/subC", team: "팀 3" },
  { act: "new", domain: "domain4.com", subgroup: "subD", fullPath: "/domain4/subD", team: "팀 4" },
  { act: "update", domain: "domain5.com", subgroup: "subE", fullPath: "/domain5/subE", team: "팀 5" },
];
export const RecentJobMock: RecentJob[] = [
  { time: "2025-08-11 10:00", jobId: "job001", pipelineId: "Pipeline A", fullPath: "/pipeline/A", team: "팀 1" },
  { time: "2025-08-11 11:30", jobId: "job002", pipelineId: "Pipeline B", fullPath: "/pipeline/B", team: "팀 2" },
  { time: "2025-08-11 12:15", jobId: "job003", pipelineId: "Pipeline C", fullPath: "/pipeline/C", team: "팀 3" },
  { time: "2025-08-11 14:00", jobId: "job004", pipelineId: "Pipeline D", fullPath: "/pipeline/D", team: "팀 4" },
  { time: "2025-08-11 15:45", jobId: "job005", pipelineId: "Pipeline E", fullPath: "/pipeline/E", team: "팀 5" },
  { time: "2025-08-11 17:20", jobId: "job006", pipelineId: "Pipeline F", fullPath: "/pipeline/F", team: "팀 1" },
  { time: "2025-08-11 19:00", jobId: "job007", pipelineId: "Pipeline G", fullPath: "/pipeline/G", team: "팀 2" },
  { time: "2025-08-11 20:10", jobId: "job008", pipelineId: "Pipeline H", fullPath: "/pipeline/H", team: "팀 3" },
]; 