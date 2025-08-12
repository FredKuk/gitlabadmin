// src/pages/BoardPage.tsx
import React, { useState } from "react";
import "./BoardPage.scss";
import "./BoardPageRight.scss";
import { BoardProgressItem } from "../../types/board";
import {
  infoDataMock,
  licenseUsageMock,
  projectsMock,
  teamsMock,
  RecentUserMock,
  RecentRepoMock,
  RecentJobMock,
} from "../../mock/board";
import Modal from "../../components/Modal";
import ModalTable from "../../components/ModalTable"; // New component import

// WAS에서 받아올 데이터 예시
const infoData = infoDataMock;
const licenseUsage = licenseUsageMock;
const projects: BoardProgressItem[] = projectsMock;
const teams: BoardProgressItem[] = teamsMock;
const recentUsers = RecentUserMock;
const recentRepos = RecentRepoMock;
const recentJobs = RecentJobMock;

// 프로그레스바 색상 결정 함수
const getProgressColor = (ratio: number) => {
  if (ratio <= 0.75) return "#3498db";
  if (ratio <= 0.90) return "#f1c40f";
  if (ratio <= 0.99) return "#e73c7eff";
  return "linear-gradient(90deg, #ff1e1eff, #af0000ff)";
};

export const BoardPage = () => {
  const [isProjectModalOpen, setProjectModalOpen] = useState(false);
  const [isTeamModalOpen, setTeamModalOpen] = useState(false);

  // New state to manage the selected filter for each modal
  const [projectFilter, setProjectFilter] = useState("All");
  const [teamFilter, setTeamFilter] = useState("All");

  const openProjectModal = () => setProjectModalOpen(true);
  const openTeamModal = () => setTeamModalOpen(true);
  const closeModals = () => {
    setProjectModalOpen(false);
    setTeamModalOpen(false);
    // Reset filters when closing modal
    setProjectFilter("All");
    setTeamFilter("All");
  };

  
  // Dummy data for the modals, replace with your actual data
  const projectModalData = [...Array(25)].map((_, i) => ({
    id: 26 - i,
    username: `user${26 - i}`,
    name: `Project ${String.fromCharCode(65 + i)}`,
    created: `2024-01-${26 - i}`,
    status: i % 2 === 0 ? 'Active' : 'Inactive',
  }));

  const teamModalData = [...Array(25)].map((_, i) => ({
    id: 26 - i,
    username: `teamuser${26 - i}`,
    name: `Team ${String.fromCharCode(65 + i)}`,
    created: `2024-02-${26 - i}`,
    status: i % 3 === 0 ? 'Running' : 'Paused',
  }));

  const modalColumns = [
    { header: '#', accessor: 'id' },
    { header: 'username', accessor: 'username' },
    { header: 'name', accessor: 'name' },
    { header: 'created', accessor: 'created' },
    { header: 'status', accessor: 'status' },
  ];

  const filterData = (data: any[], filter: string) => {
    if (filter === "All") {
      return data;
    }
    // Assuming 'status' is the property to filter on
    return data.filter(item => item.status === filter);
  };
  
  return (
    <div className="board-page">
      <div className="board-col board-col-left">
        <div className="section">
          <div className="section-title">Info</div>
          <div className="progress-item">
            <div className="progress-label">라이센스</div>
            <span className="progress-num">{licenseUsage.current}</span>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{
                  width: `${(licenseUsage.current / licenseUsage.total) * 100}%`,
                  background: getProgressColor(licenseUsage.current / licenseUsage.total),
                }}
              />
            </div>
            <span className="progress-num">{licenseUsage.total}</span>
          </div>
          <div className="info-list">
            <div className="info-row">
              <span>라이센스 유저</span>
              <span>{infoData.licenseTotal}</span>
            </div>
            <div className="info-row">
              <span>최대사용 유저</span>
              <span>{infoData.Maximum}</span>
            </div>
            <div className="info-row">
              <span>사용중인 유저</span>
              <span>{infoData.userActive}</span>
            </div>
            <div className="info-row">
              <span>비활성화 유저</span>
              <span>{infoData.userInactive}</span>
            </div>
            <div className="info-row">
              <span>기타 유저</span>
              <span>{infoData.userEtc}</span>
            </div>
          </div>
        </div>
        <div className="section" onClick={openProjectModal}>
          <div className="section-title">Project</div>
          <div className="scroll-area">
            {projects.map((item, idx) => (
              <div className="progress-item" key={idx}>
                <div className="progress-label">{item.name}</div>
                <span className="progress-num">{item.current}</span>
                <div className="progress-bar">
                  <div
                    className={`progress-fill${item.current / item.total >= 1 ? " neon" : ""}`}
                    style={{
                      width: `${(item.current / item.total) * 100}%`,
                      ...(item.current / item.total >= 1
                        ? {}
                        : {
                            background: getProgressColor(item.current / item.total),
                          }),
                    }}
                  />
                </div>
                <span className="progress-num">{item.total}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="section" onClick={openTeamModal}>
          <div className="section-title">Team</div>
          <div className="scroll-area">
            {teams.map((item, idx) => (
              <div className="team-item" key={idx}>
                <span className="progress-label">{item.name}</span>
                <span className="progress-num">{item.current}</span>
                <div className="progress-bar">
                  <div
                    className={`progress-fill${item.current / item.total >= 1 ? " neon" : ""}`}
                    style={{
                      width: `${(item.current / item.total) * 100}%`,
                      ...(item.current / item.total >= 1
                        ? {}
                        : {
                            background: getProgressColor(item.current / item.total),
                          }),
                    }}
                  />
                </div>
                <span className="progress-num">{item.total}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="board-col board-col-right">
        <div className="section right-area1">
          <div className="section-title">Recent Users</div>
          <div className="scroll-area">
            <table className="data-table table-col-widths">
              <thead>
                <tr>
                  <th>활동</th>
                  <th>이름</th>
                  <th>ID</th>
                  <th>상태</th>
                  <th>팀</th>
                </tr>
              </thead>
              <tbody>
                {recentUsers.map((user, i) => (
                  <tr key={i}>
                    <td className={`status-${user.act.toLowerCase()}`}>{user.act}</td>
                    <td>{user.name}</td>
                    <td>{user.username}</td>
                    <td>{user.status}</td>
                    <td>{user.team}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="section right-area2">
          <div className="section-title">Recent Repositories</div>
          <div className="scroll-area">
            <table className="data-table table-col-widths">
              <thead>
                <tr>
                  <th>활동</th>
                  <th>도메인</th>
                  <th>서브그룹</th>
                  <th>전체경로</th>
                  <th>팀</th>
                </tr>
              </thead>
              <tbody>
                {recentRepos.map((repo, i) => (
                  <tr key={i}>
                    <td className={`activity-${repo.act.toLowerCase()}`}>{repo.act}</td>
                    <td>{repo.domain}</td>
                    <td>{repo.subgroup}</td>
                    <td>{repo.fullPath}</td>
                    <td>{repo.team}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="section right-area3">
          <div className="section-title">Recent Jobs</div>
          <div className="scroll-area">
            <table className="data-table table-col-widths">
              <thead>
                <tr>
                  <th>시간</th>
                  <th>잡ID</th>
                  <th>파이프라인명</th>
                  <th>전체경로</th>
                  <th>팀</th>
                </tr>
              </thead>
              <tbody>
                {recentJobs.map((job, i) => (
                  <tr key={i}>
                    <td>{job.time}</td>
                    <td>{job.jobId}</td>
                    <td>{job.pipelineId}</td>
                    <td>{job.fullPath}</td>
                    <td>{job.team}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
       {/* Project Modal */}
      <Modal isOpen={isProjectModalOpen} title="Project" onClose={closeModals}>
        <div className="modal-body">
          <div className="modal-radio-buttons">
            <label>
              <input
                type="radio"
                value="All"
                checked={teamFilter === "All"}
                onChange={(e) => setTeamFilter(e.target.value)}
              />
              All
            </label>
            <label>
              <input
                type="radio"
                value="Running"
                checked={teamFilter === "Running"}
                onChange={(e) => setTeamFilter(e.target.value)}
              />
              Running
            </label>
            <label>
              <input
                type="radio"
                value="Paused"
                checked={teamFilter === "Paused"}
                onChange={(e) => setTeamFilter(e.target.value)}
              />
              Paused
            </label>
          </div>
          <div className="modal-tables-container">
            <ModalTable title="title1" data={filterData(projectModalData, projectFilter)} columns={modalColumns} />
            <ModalTable title="title2" data={filterData(projectModalData, projectFilter)} columns={modalColumns} />
            <ModalTable title="title3" data={filterData(projectModalData, projectFilter)} columns={modalColumns} />
          </div>
        </div>
      </Modal>

      <Modal isOpen={isTeamModalOpen} title="Team" onClose={closeModals}>
        <div className="modal-body">
          <div className="modal-radio-buttons">
            <label>
              <input
                type="radio"
                value="All"
                checked={teamFilter === "All"}
                onChange={(e) => setTeamFilter(e.target.value)}
              />
              All
            </label>
            <label>
              <input
                type="radio"
                value="Running"
                checked={teamFilter === "Running"}
                onChange={(e) => setTeamFilter(e.target.value)}
              />
              Running
            </label>
            <label>
              <input
                type="radio"
                value="Paused"
                checked={teamFilter === "Paused"}
                onChange={(e) => setTeamFilter(e.target.value)}
              />
              Paused
            </label>
          </div>
          <div className="modal-tables-container">
                <ModalTable title="title1" data={filterData(teamModalData, teamFilter)} columns={modalColumns} />
                <ModalTable title="title2" data={filterData(teamModalData, teamFilter)} columns={modalColumns} />
                <ModalTable title="title3" data={filterData(teamModalData, teamFilter)} columns={modalColumns} />
          </div>
        </div>
      </Modal>
    </div>
  );
};