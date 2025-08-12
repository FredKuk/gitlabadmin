import { RecentUser, RecentRepo, RecentJob } from "../types/board";

const API_BASE = "/api"; // 실제 API 서버 주소

export async function fetchRecentUser(): Promise<RecentUser[]> {
  const res = await fetch(`${API_BASE}/recentuser`);
  if (!res.ok) throw new Error("RecentUser 데이터 로드 실패");
  return res.json();
}

export async function fetchRecentRepo(): Promise<RecentRepo[]> {
  const res = await fetch(`${API_BASE}/recentrepo`);
  if (!res.ok) throw new Error("RecentRepo 데이터 로드 실패");
  return res.json();
}

export async function fetchRecentJob(): Promise<RecentJob[]> {
  const res = await fetch(`${API_BASE}/recentjob`);
  if (!res.ok) throw new Error("RecentJob 데이터 로드 실패");
  return res.json();
}
