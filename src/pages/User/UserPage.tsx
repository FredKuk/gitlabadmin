import React, { useState, useRef, useEffect } from 'react';
import './UserPage.scss';

// 체크박스 드롭다운 컴포넌트
interface DropdownCheckboxProps {
  label: string;
  options: { id: string; name: string }[];
}

const DropdownCheckbox: React.FC<DropdownCheckboxProps> = ({ label, options }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownRef]);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleCheckboxChange = (id: string) => {
    setSelectedItems(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedItems.length === options.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(options.map(option => option.id));
    }
  };

  const getLabel = () => {
    if (selectedItems.length === 0 || selectedItems.length === options.length) {
      return `모든 ${label.split(' ')[1]}`;
    }
    return `선택 ${label.split(' ')[1]}`;
  };

  return (
    <div className="dropdown-checkbox" ref={dropdownRef}>
      <button onClick={toggleDropdown} className={`dropdown-toggle ${isOpen ? 'open' : ''}`}>
        {getLabel()}
        <span className="arrow">{isOpen ? '▲' : '▼'}</span>
      </button>
      {isOpen && (
        <div className="dropdown-menu">
          <label className="checkbox-item all-checkbox">
            <input
              type="checkbox"
              checked={selectedItems.length === options.length}
              onChange={handleSelectAll}
            />
            <span>전체 선택</span>
          </label>
          {options.map(option => (
            <label key={option.id} className="checkbox-item">
              <input
                type="checkbox"
                checked={selectedItems.includes(option.id)}
                onChange={() => handleCheckboxChange(option.id)}
              />
              <span>{option.name}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

// ProjectModal 컴포넌트
interface ProjectModalProps {
  onClose: () => void;
  mockProjectData: {
    inProgress: { id: number; name: string; start: string; end: string }[];
    completed: { id: number; name: string; start: string; end: string }[];
  };
}

const ProjectModal: React.FC<ProjectModalProps> = ({ onClose, mockProjectData }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div className="modal-overlay">
      <div className="project-modal-content" ref={modalRef}>
        <div className="modal-header">
          <h3>프로젝트 상세</h3>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body">
          <div className="modal-section">
            <h4>참여중인 프로젝트</h4>
            <div className="modal-table-content">
              <div className="modal-table-header project-header">
                <span>#</span>
                <span>프로젝트명</span>
                <span>시작</span>
                <span>종료</span>
              </div>
              {mockProjectData.inProgress.map((project, index) => (
                <div className="modal-table-row project-row" key={index}>
                  <span>{project.id}</span>
                  <span>{project.name}</span>
                  <span>{project.start}</span>
                  <span>{project.end}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="modal-section">
            <h4>종료된 프로젝트</h4>
            <div className="modal-table-content">
              <div className="modal-table-header project-header">
                <span>#</span>
                <span>프로젝트명</span>
                <span>시작</span>
                <span>종료</span>
              </div>
              {mockProjectData.completed.map((project, index) => (
                <div className="modal-table-row project-row" key={index}>
                  <span>{project.id}</span>
                  <span>{project.name}</span>
                  <span>{project.start}</span>
                  <span>{project.end}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// GroupModal 컴포넌트
interface GroupModalProps {
  onClose: () => void;
  mockGroupData: {
    id: number;
    fullPath: string;
    adminTeam: string;
    project: string;
    permission: string;
    date: string;
  }[];
}

const GroupModal: React.FC<GroupModalProps> = ({ onClose, mockGroupData }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div className="modal-overlay">
      <div className="group-modal-content" ref={modalRef}>
        <div className="modal-header">
          <h3>GROUP 상세</h3>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body">
          <div className="modal-section">
            <h4>그룹 목록</h4>
            <div className="group-modal-table-content">
              <div className="modal-table-header group-header">
                <span>#</span>
                <span>fullpath</span>
                <span>관리팀</span>
                <span>프로젝트</span>
                <span>권한</span>
                <span>날짜</span>
              </div>
              {mockGroupData.map((group, index) => (
                <div className="modal-table-row group-row" key={index}>
                  <span>{group.id}</span>
                  <span>{group.fullPath}</span>
                  <span>{group.adminTeam}</span>
                  <span>{group.project}</span>
                  <span>{group.permission}</span>
                  <span>{group.date}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// 메인 UserPage 컴포넌트
export const UserPage = () => {
  const [startDate, setStartDate] = useState('2020.01.01');
  const [endDate, setEndDate] = useState('2025.08.12');
  const [numberInput, setNumberInput] = useState('');
  const [searchText, setSearchText] = useState('');
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);

  const mockDepartments = [
    { id: '1', name: '부서 A' },
    { id: '2', name: '부서 B' },
    { id: '3', name: '부서 C' },
  ];
  const mockTeams = [
    { id: 't1', name: '팀 1' },
    { id: 't2', name: '팀 2' },
    { id: 't3', name: '팀 3' },
  ];
  const mockEmployees = [
    { id: 'e1', name: '직원 1' },
    { id: 'e2', name: '직원 2' },
    { id: 'e3', name: '직원 3' },
  ];
  const mockProjects = [
    { id: 'p1', name: '프로젝트 A' },
    { id: 'p2', name: '프로젝트 B' },
    { id: 'p3', name: '프로젝트 C' },
  ];
  const mockGroups = [
    { id: 'g1', name: '그룹 1' },
    { id: 'g2', name: '그룹 2' },
    { id: 'g3', name: '그룹 3' },
  ];
  const mockStatuses = [
    { id: 'active', name: '활성화' },
    { id: 'inactive', name: '비활성화' },
    { id: 'other', name: '그외' },
  ];

  const mockTableData = Array.from({ length: 15 }).map((_, index) => ({
    id: 55 - index,
    name: `Teamuser ${55 - index}`,
    username: `user_${55 - index}`,
    status: index % 2 === 0 ? 'Active' : 'Inactive',
    createdAt: `2024-02-2${index % 10}`,
    department: `Dept ${index % 3 + 1}`,
    team: `Team ${index % 2 + 1}`,
  }));

  const mockProjectData = {
    inProgress: [
      { id: 5, name: '프로젝트 E', start: '2024.01.01', end: '2024.12.31' },
      { id: 4, name: '프로젝트 F', start: '2023.07.15', end: '2024.11.30' },
      { id: 5, name: '프로젝트 E', start: '2024.01.01', end: '2024.12.31' },
      { id: 4, name: '프로젝트 F', start: '2023.07.15', end: '2024.11.30' },
      { id: 5, name: '프로젝트 E', start: '2024.01.01', end: '2024.12.31' },
      { id: 4, name: '프로젝트 F', start: '2023.07.15', end: '2024.11.30' },
      { id: 5, name: '프로젝트 E', start: '2024.01.01', end: '2024.12.31' },
      { id: 4, name: '프로젝트 F', start: '2023.07.15', end: '2024.11.30' },
      { id: 5, name: '프로젝트 E', start: '2024.01.01', end: '2024.12.31' },
      { id: 4, name: '프로젝트 F', start: '2023.07.15', end: '2024.11.30' },
      { id: 5, name: '프로젝트 E', start: '2024.01.01', end: '2024.12.31' },
      { id: 4, name: '프로젝트 F', start: '2023.07.15', end: '2024.11.30' },
      { id: 5, name: '프로젝트 E', start: '2024.01.01', end: '2024.12.31' },
      { id: 4, name: '프로젝트 F', start: '2023.07.15', end: '2024.11.30' },
    ],
    completed: [
      { id: 3, name: '프로젝트 G', start: '2022.03.01', end: '2023.06.30' },
      { id: 2, name: '프로젝트 H', start: '2021.01.01', end: '2022.01.31' },
      { id: 3, name: '프로젝트 G', start: '2022.03.01', end: '2023.06.30' },
      { id: 2, name: '프로젝트 H', start: '2021.01.01', end: '2022.01.31' },
      { id: 3, name: '프로젝트 G', start: '2022.03.01', end: '2023.06.30' },
      { id: 2, name: '프로젝트 H', start: '2021.01.01', end: '2022.01.31' },
      { id: 3, name: '프로젝트 G', start: '2022.03.01', end: '2023.06.30' },
      { id: 2, name: '프로젝트 H', start: '2021.01.01', end: '2022.01.31' },
      { id: 3, name: '프로젝트 G', start: '2022.03.01', end: '2023.06.30' },
      { id: 2, name: '프로젝트 H', start: '2021.01.01', end: '2022.01.31' },
      { id: 3, name: '프로젝트 G', start: '2022.03.01', end: '2023.06.30' },
      { id: 2, name: '프로젝트 H', start: '2021.01.01', end: '2022.01.31' },
    ]
  };

  const mockGroupData = Array.from({ length: 20 }).map((_, index) => ({
    id: 10 + index,
    fullPath: `/path/to/group${10 + index}`,
    adminTeam: `Admin Team ${index % 3 + 1}`,
    project: `Project ${index % 2 + 1}`,
    permission: index % 4 === 0 ? '읽기' : index % 4 === 1 ? '쓰기' : '관리',
    date: `2024.01.0${index % 9 + 1}`,
  }));


  const handleProjectViewClick = () => {
    setIsProjectModalOpen(true);
  };

  const handleGroupViewClick = () => {
    setIsGroupModalOpen(true);
  };

  return (
    <div className="user-page">
      <div className="top-section">
        <div className="filter-container">
          <DropdownCheckbox label="모든 부서" options={mockDepartments} />
          <DropdownCheckbox label="모든 팀" options={mockTeams} />
          <DropdownCheckbox label="모든 직원" options={mockEmployees} />
          <DropdownCheckbox label="모든 프로젝트" options={mockProjects} />
          <DropdownCheckbox label="모든 그룹" options={mockGroups} />
          <DropdownCheckbox label="모든 상태" options={mockStatuses} />

          <div className="date-input-group">
            <input
              type="text"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="date-input"
            />
            <input
              type="text"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="date-input"
            />
            <input
              type="number"
              placeholder="숫자입력"
              value={numberInput}
              onChange={(e) => setNumberInput(e.target.value)}
              className="number-input"
            />
          </div>
        </div>
        <div className="search-group">
          <input
            type="text"
            placeholder="텍스트입력(검색어)"
            className="search-input"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <button className="search-button">검색</button>
          <button className="save-button">저장</button>
        </div>
      </div>

      <div className="content-area">
        <div className="table-wrapper full-width-table">
          <h3 className="table-title">User List</h3>
          <div className="table-content">
            <div className="table-header">
              <span>#</span>
              <span>name</span>
              <span>username</span>
              <span>status</span>
              <span>created at</span>
              <span>department</span>
              <span>team</span>
              <span>project</span>
              <span>group</span>
            </div>
            {mockTableData.map(row => (
              <div className="table-row" key={row.id}>
                <span>{row.id}</span>
                <span>{row.name}</span>
                <span>{row.username}</span>
                <span>{row.status}</span>
                <span>{row.createdAt}</span>
                <span>{row.department}</span>
                <span>{row.team}</span>
                <span>
                  <button className="view-button" onClick={handleProjectViewClick}>View</button>
                </span>
                <span>
                  <button className="view-button" onClick={handleGroupViewClick}>View</button>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {isProjectModalOpen && (
        <ProjectModal onClose={() => setIsProjectModalOpen(false)} mockProjectData={mockProjectData} />
      )}
      {isGroupModalOpen && (
        <GroupModal onClose={() => setIsGroupModalOpen(false)} mockGroupData={mockGroupData} />
      )}
    </div>
  );
};