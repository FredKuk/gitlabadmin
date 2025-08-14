import React, { useState, useRef, useEffect } from "react";
import "./UserPage.scss";

const departments = [
  { id: "1", name: "Dept 1" },
  { id: "2", name: "Dept 2" },
  { id: "3", name: "Dept 3" },
  { id: "4", name: "Dept 4" },
  { id: "5", name: "Dept 5" },
  { id: "6", name: "Dept 6" },
];
const teams = [
  { id: "1", name: "Team 1" },
  { id: "2", name: "Team 2" },
  { id: "3", name: "Team 3" },
  { id: "4", name: "Team 4" },
  { id: "5", name: "Team 5" },
  { id: "6", name: "Team 6" },
];

const authors = [
  { id: "1", name: "author_1" },
  { id: "2", name: "author_2" },
  { id: "3", name: "author_3" },
  { id: "4", name: "author_4" },
  { id: "5", name: "author_5" },
  { id: "6", name: "author_6" },
];

const statuses = [
  { id: "1", name: "Active" },
  { id: "2", name: "Inactive" },
  { id: "3", name: "Others" },
];

// 체크박스 드롭다운 컴포넌트
interface DropdownCheckboxProps {
  label: string;
  options: { id: string; name: string }[];
  onChange: (selectedIds: string[]) => void; // Add onChange prop
}

const DropdownCheckbox: React.FC<DropdownCheckboxProps> = ({
  label,
  options,
  onChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  useEffect(() => {
    onChange(selectedItems); // Notify parent component when selectedItems change
  }, [selectedItems, onChange]);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleCheckboxChange = (id: string) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedItems.length === options.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(options.map((option) => option.id));
    }
  };

  const getLabel = () => {
    if (selectedItems.length === 0 || selectedItems.length === options.length) {
      return `모든 ${label.split(" ")[1]}`;
    }
    return `선택 ${label.split(" ")[1]}`;
  };

  return (
    <div className="dropdown-checkbox" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className={`dropdown-toggle ${isOpen ? "open" : ""}`}
      >
        {getLabel()}
        <span className="arrow">{isOpen ? "▲" : "▼"}</span>
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
          {options.map((option) => (
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

const ProjectModal: React.FC<ProjectModalProps> = ({
  onClose,
  mockProjectData,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  return (
    <div className="modal-overlay">
      <div className="project-modal-content" ref={modalRef}>
        <div className="modal-header">
          <h3>프로젝트 상세</h3>
          <button className="modal-close" onClick={onClose}>
            &times;
          </button>
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
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  return (
    <div className="modal-overlay">
      <div className="group-modal-content" ref={modalRef}>
        <div className="modal-header">
          <h3>GROUP 상세</h3>
          <button className="modal-close" onClick={onClose}>
            &times;
          </button>
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

function EditableCell({
  value,
  options,
  onChange,
  invalid,
  setInvalid,
  rowId,
  field,
}: {
  value: string;
  options: string[];
  onChange: (val: string) => void;
  invalid: boolean;
  setInvalid: (rowId: number, field: string, isInvalid: boolean) => void;
  rowId: number;
  field: string;
}) {
  const [editing, setEditing] = useState(false);
  const [input, setInput] = useState(
    value && value.trim() !== "" ? value : "내용없음"
  );
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setInput(value && value.trim() !== "" ? value : "내용없음");
  }, [value]);

  useEffect(() => {
    if (!editing) return;
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        let newValue = input && input.trim() !== "" ? input : "내용없음";
        console.log(newValue);
        setInput(newValue);
        // "내용없음"이거나 옵션에 없는 값이면 무조건 invalid
        if (!options.includes(newValue)) {
          console.log(rowId, field, newValue, "invalid");
          setInvalid(rowId, field, true);
        } else {
          console.log(rowId, field, newValue, "valid");
          setInvalid(rowId, field, false);
        }
        onChange(newValue);
        setEditing(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [editing, input, options, onChange, rowId, field, setInvalid]);

  const filteredOptions = options.filter((opt) =>
    opt.toLowerCase().includes(input.toLowerCase())
  );

  const handleSelect = (option: string) => {
    setInput(option);
    setInvalid(rowId, field, false);
    onChange(option);
    setEditing(false);
  };

  return (
    <div ref={ref} style={{ minWidth: 120 }}>
      {editing ? (
        <div>
          <input
            type="text"
            value={input === "내용없음" ? "" : input}
            autoFocus
            onChange={(e) => setInput(e.target.value)}
            onBlur={() => {
              // input이 비거나 공백만 있으면 "내용없음"으로
              if (!input || input.trim() === "") {
                setInput("내용없음");
                setInvalid(rowId, field, true);
                onChange("내용없음");
              }
            }}
            style={{
              marginBottom: 4,
              padding: "4px 8px",
              borderRadius: 4,
              border: invalid ? "1.5px solid #e74c3c" : "1px solid #4a4a4a",
              background: "#383838",
              color: invalid ? "#e74c3c" : "#e0e0e0",
              width: "100%",
            }}
            placeholder="내용없음"
          />
          <div
            style={{
              background: "#383838",
              border: "1px solid #4a4a4a",
              maxHeight: 120,
              overflowY: "auto",
              borderRadius: 4,
              marginTop: 2,
            }}
          >
            {filteredOptions.length === 0 ? (
              <div style={{ color: "#aaa", padding: 6 }}>No match</div>
            ) : (
              filteredOptions.map((opt) => (
                <div
                  key={opt}
                  style={{
                    padding: "6px 10px",
                    cursor: "pointer",
                    color: "#e0e0e0",
                  }}
                  onMouseDown={() => handleSelect(opt)}
                >
                  {opt}
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        <span
          style={{
            color: invalid
              ? "#e74c3c"
              : value && value.trim() !== ""
              ? "#e0e0e0"
              : "#aaa",
            cursor: "pointer",
            fontWeight: invalid ? "bold" : undefined,
          }}
          onClick={() => setEditing(true)}
        >
          {invalid ? input : value && value.trim() !== "" ? value : "내용없음"}
        </span>
      )}
    </div>
  );
}

// 메인 UserPage 컴포넌트
export const UserPage = () => {
  const [startDate, setStartDate] = useState("2020.01.01");
  const [endDate, setEndDate] = useState("2025.08.12");
  const [numberInput, setNumberInput] = useState("");
  const [searchText, setSearchText] = useState("");
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [selectedAuthors, setSelectedAuthors] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);

  const [filters, setFilters] = useState({
    department: "모든 부서",
    team: "모든 팀",
    author: "모든 권한",
    status: "모든 상태",
    startDate: "",
    endDate: "",
    search: "",
  });

  const mockProjects = [
    { id: "p1", name: "프로젝트 A" },
    { id: "p2", name: "프로젝트 B" },
    { id: "p3", name: "프로젝트 C" },
  ];
  const mockGroups = [
    { id: "g1", name: "그룹 1" },
    { id: "g2", name: "그룹 2" },
    { id: "g3", name: "그룹 3" },
  ];

  // 1. mockTableData에 author, lastLogin 필드 추가
  const mockTableData = Array.from({ length: 55 }).map((_, index) => ({
    id: 55 - index,
    name: `Teamuser ${55 - index}`,
    username: `user_${55 - index}`,
    author: `author_${(index % 5) + 1}`,
    status: index % 2 === 0 ? "Active" : "Inactive",
    createdAt: `2024-02-${((index % 28) + 1).toString().padStart(2, "0")}`,
    lastLogin: `2024-03-${((index % 28) + 1).toString().padStart(2, "0")}`,
    department: `Dept ${(index % 3) + 1}`,
    team: `Team ${(index % 2) + 1}`,
  }));

  const mockProjectData = {
    inProgress: [
      { id: 5, name: "프로젝트 E", start: "2024.01.01", end: "2024.12.31" },
      { id: 4, name: "프로젝트 F", start: "2023.07.15", end: "2024.11.30" },
      { id: 5, name: "프로젝트 E", start: "2024.01.01", end: "2024.12.31" },
      { id: 4, name: "프로젝트 F", start: "2023.07.15", end: "2024.11.30" },
      { id: 5, name: "프로젝트 E", start: "2024.01.01", end: "2024.12.31" },
      { id: 4, name: "프로젝트 F", start: "2023.07.15", end: "2024.11.30" },
      { id: 5, name: "프로젝트 E", start: "2024.01.01", end: "2024.12.31" },
      { id: 4, name: "프로젝트 F", start: "2023.07.15", end: "2024.11.30" },
      { id: 5, name: "프로젝트 E", start: "2024.01.01", end: "2024.12.31" },
      { id: 4, name: "프로젝트 F", start: "2023.07.15", end: "2024.11.30" },
      { id: 5, name: "프로젝트 E", start: "2024.01.01", end: "2024.12.31" },
      { id: 4, name: "프로젝트 F", start: "2023.07.15", end: "2024.11.30" },
      { id: 5, name: "프로젝트 E", start: "2024.01.01", end: "2024.12.31" },
      { id: 4, name: "프로젝트 F", start: "2023.07.15", end: "2024.11.30" },
    ],
    completed: [
      { id: 3, name: "프로젝트 G", start: "2022.03.01", end: "2023.06.30" },
      { id: 2, name: "프로젝트 H", start: "2021.01.01", end: "2022.01.31" },
      { id: 3, name: "프로젝트 G", start: "2022.03.01", end: "2023.06.30" },
      { id: 2, name: "프로젝트 H", start: "2021.01.01", end: "2022.01.31" },
      { id: 3, name: "프로젝트 G", start: "2022.03.01", end: "2023.06.30" },
      { id: 2, name: "프로젝트 H", start: "2021.01.01", end: "2022.01.31" },
      { id: 3, name: "프로젝트 G", start: "2022.03.01", end: "2023.06.30" },
      { id: 2, name: "프로젝트 H", start: "2021.01.01", end: "2022.01.31" },
      { id: 3, name: "프로젝트 G", start: "2022.03.01", end: "2023.06.30" },
      { id: 2, name: "프로젝트 H", start: "2021.01.01", end: "2022.01.31" },
      { id: 3, name: "프로젝트 G", start: "2022.03.01", end: "2023.06.30" },
      { id: 2, name: "프로젝트 H", start: "2021.01.01", end: "2022.01.31" },
    ],
  };

  const mockGroupData = Array.from({ length: 20 }).map((_, index) => ({
    id: 10 + index,
    fullPath: `/path/to/group${10 + index}`,
    adminTeam: `Admin Team ${(index % 3) + 1}`,
    project: `Project ${(index % 2) + 1}`,
    permission: index % 4 === 0 ? "읽기" : index % 4 === 1 ? "쓰기" : "관리",
    date: `2024.01.0${(index % 9) + 1}`,
  }));

  const handleProjectViewClick = () => {
    setIsProjectModalOpen(true);
  };

  const handleGroupViewClick = () => {
    setIsGroupModalOpen(true);
  };

  // 테이블 데이터 상태 관리
  const [tableData, setTableData] = useState(
    mockTableData.map((row) => ({
      ...row,
      department: row.department || "내용없음",
      team: row.team || "내용없음",
    }))
  );

  // invalid 상태 관리
  const [invalidMap, setInvalidMap] = useState<{ [key: string]: boolean }>({});

  const setInvalid = (rowId: number, field: string, isInvalid: boolean) => {
    setInvalidMap((prev) => ({
      ...prev,
      [`${rowId}_${field}`]: isInvalid,
    }));
  };

  const handleCellChange = (
    rowId: number,
    field: "department" | "team",
    value: string
  ) => {
    setTableData((prev) =>
      prev.map((row) => (row.id === rowId ? { ...row, [field]: value } : row))
    );
  };

  const hasInvalid = Object.values(invalidMap).some((v) => v);

  const handleSave = () => {
    if (hasInvalid) {
      alert("잘못된 값이 있습니다. 빨간색 셀을 확인하세요.");
      return;
    }
    // 저장 로직...
    alert("저장 완료!");
  };

  const columns = [
    { key: "id", label: "#" },
    { key: "name", label: "name" },
    { key: "username", label: "username" },
    { key: "author", label: "author" },
    { key: "status", label: "status" },
    { key: "createdAt", label: "created at" },
    { key: "lastLogin", label: "last login" },
    { key: "department", label: "department" },
    { key: "team", label: "team" },
    { key: "project", label: "project", sortable: false },
    { key: "group", label: "group", sortable: false },
  ];

  // 2. 정렬 및 필터링 적용
  const handleHeaderClick = (key: string, sortable = true) => {
    if (!sortable) return;
    setSortConfig((prev) =>
      prev && prev.key === key
        ? { key, direction: prev.direction === "asc" ? "desc" : "asc" }
        : { key, direction: "asc" }
    );
  };

  const handleSearch = () => {
    setFilters((prev) => ({ ...prev, search: searchText }));
  };

  // 3. 필터링 및 정렬된 데이터
  const filteredData = tableData
    .filter((row) => {
      // 검색어
      if (filters.search) {
        const search = filters.search.toLowerCase();
        if (
          !row.name.toLowerCase().includes(search) &&
          !row.username.toLowerCase().includes(search)
        )
          return false;
      }

      // Departments filter
      if (
        selectedDepartments.length > 0 &&
        !selectedDepartments.some((deptId) => {
          const selectedDept = departments.find((d) => d.id === deptId);
          return selectedDept ? row.department === selectedDept.name : false;
        })
      ) {
        return false;
      }

      // Teams filter
      if (
        selectedTeams.length > 0 &&
        !selectedTeams.some((teamId) => {
          const selectedTeam = teams.find((t) => t.id === teamId);
          return selectedTeam ? row.team === selectedTeam.name : false;
        })
      ) {
        return false;
      }

      // Authors filter
      if (
        selectedAuthors.length > 0 &&
        !selectedAuthors.some((authorId) => {
          const selectedAuthor = authors.find((a) => a.id === authorId);
          return selectedAuthor ? row.author === selectedAuthor.name : false;
        })
      ) {
        return false;
      }

      // Statuses filter
      if (
        selectedStatuses.length > 0 &&
        !selectedStatuses.some((statusId) => {
          const selectedStatus = statuses.find((s) => s.id === statusId);
          return selectedStatus ? row.status === selectedStatus.name : false;
        })
      ) {
        return false;
      }

      // 날짜
      if (filters.startDate && row.createdAt < filters.startDate) return false;
      if (filters.endDate && row.createdAt > filters.endDate) return false;

      return true;
    })
    .sort((a, b) => {
      if (!sortConfig) return 0;
      const { key, direction } = sortConfig;
      // 타입 안전하게 any로 캐스팅
      let aValue = (a as any)[key];
      let bValue = (b as any)[key];

      // 날짜 비교 (createdAt, lastLogin)
      if (key === "createdAt" || key === "lastLogin") {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      if (aValue == null) return 1;
      if (bValue == null) return -1;

      if (aValue < bValue) return direction === "asc" ? -1 : 1;
      if (aValue > bValue) return direction === "asc" ? 1 : -1;
      return 0;
    });

  return (
    <div className="user-page">
      <div className="top-section">
        <div className="filter-container">
          {/* 드롭다운에서 onChange 시 setFilters로 값 변경 */}
          {/* 예시: */}
          {/* <DropdownCheckbox label="모든 부서" options={mockDepartments} onChange={val => setFilters(f => ({ ...f, department: val }))} /> */}
          {/* 아래는 기존 코드 유지, 실제로는 onChange 연결 필요 */}
          <DropdownCheckbox
            label="모든 부서"
            options={departments}
            onChange={setSelectedDepartments}
          />
          <DropdownCheckbox
            label="모든 팀"
            options={teams}
            onChange={setSelectedTeams}
          />
          <DropdownCheckbox
            label="모든 권한"
            options={authors}
            onChange={setSelectedAuthors}
          />
          <DropdownCheckbox
            label="모든 프로젝트"
            options={mockProjects}
            onChange={() => {}}
          />
          <DropdownCheckbox
            label="모든 그룹"
            options={mockGroups}
            onChange={() => {}}
          />
          <DropdownCheckbox
            label="모든 상태"
            options={statuses}
            onChange={setSelectedStatuses}
          />

          <div className="date-input-group">
            <input
              type="text"
              value={filters.startDate}
              onChange={(e) =>
                setFilters((f) => ({ ...f, startDate: e.target.value }))
              }
              className="date-input"
              placeholder="시작일"
            />
            <input
              type="text"
              value={filters.endDate}
              onChange={(e) =>
                setFilters((f) => ({ ...f, endDate: e.target.value }))
              }
              className="date-input"
              placeholder="종료일"
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
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearch();
              }
            }}
          />
          <button className="search-button" onClick={handleSearch}>
            검색
          </button>
          <button className="save-button" onClick={handleSave}>
            저장
          </button>
        </div>
      </div>

      <div className="content-area">
        <div className="table-wrapper full-width-table">
          <h3 className="table-title">User List</h3>
          <div className="table-content">
            <div className="table-header">
              <span onClick={() => handleHeaderClick("id")}>#</span>
              <span onClick={() => handleHeaderClick("name")}>name</span>
              <span onClick={() => handleHeaderClick("username")}>
                username
              </span>
              <span onClick={() => handleHeaderClick("author")}>author</span>
              <span onClick={() => handleHeaderClick("status")}>status</span>
              <span onClick={() => handleHeaderClick("createdAt")}>
                created at
              </span>
              <span onClick={() => handleHeaderClick("lastLogin")}>
                last login
              </span>
              <span onClick={() => handleHeaderClick("department")}>
                department
              </span>
              <span onClick={() => handleHeaderClick("team")}>team</span>
              <span>project</span>
              <span>group</span>
            </div>
            {filteredData.map((row) => (
              <div className="table-row" key={row.id}>
                <span>{row.id}</span>
                <span>{row.name}</span>
                <span>{row.username}</span>
                <span>{row.author}</span>
                <span>{row.status}</span>
                <span>{row.createdAt}</span>
                <span>{row.lastLogin}</span>
                <span>
                  <EditableCell
                    value={row.department}
                    options={departments.map((d) => d.name)}
                    onChange={(val) =>
                      handleCellChange(row.id, "department", val)
                    }
                    invalid={!!invalidMap[`${row.id}_department`]}
                    setInvalid={setInvalid}
                    rowId={row.id}
                    field="department"
                  />
                </span>
                <span>
                  <EditableCell
                    value={row.team}
                    options={teams.map((t) => t.name)}
                    onChange={(val) => handleCellChange(row.id, "team", val)}
                    invalid={!!invalidMap[`${row.id}_team`]}
                    setInvalid={setInvalid}
                    rowId={row.id}
                    field="team"
                  />
                </span>
                <span>
                  <button
                    className="view-button"
                    onClick={handleProjectViewClick}
                  >
                    View
                  </button>
                </span>
                <span>
                  <button
                    className="view-button"
                    onClick={handleGroupViewClick}
                  >
                    View
                  </button>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {isProjectModalOpen && (
        <ProjectModal
          onClose={() => setIsProjectModalOpen(false)}
          mockProjectData={mockProjectData}
        />
      )}
      {isGroupModalOpen && (
        <GroupModal
          onClose={() => setIsGroupModalOpen(false)}
          mockGroupData={mockGroupData}
        />
      )}
    </div>
  );
};
