import React, { useState, useEffect } from "react";
import "./GroupPage.scss";
import { Group, Project } from "../../types/group";
import groupsData from "../../mock/groups_minimal.json";
import projectsData from "../../mock/project_minimal.json";
import departmentsData from "../../mock/departments.json";
import teamsData from "../../mock/teams.json";
import Tree from "react-d3-tree";
import { GroupEditableCell } from "../../components/GroupEditableCell";

// 리스트 아이템 인터페이스 추가
interface ListItem {
  id: number;
  name: string;
  type: "group" | "project";
  full_path: string;
  level: number;
  parent_id?: number | null;
  children?: ListItem[];
  isSharedGroup?: boolean;
}

// 기존 인터페이스들...
interface D3TreeNode {
  name: string;
  attributes?: {
    id: number;
    type: "group" | "project";
    full_path?: string;
    isSharedGroup?: boolean;
    isVirtualRoot?: boolean;
  };
  children?: D3TreeNode[];
}

interface GroupDetails {
  department: string;
  team: string;
}

interface ValidationState {
  [groupId: number]: {
    [field: string]: boolean;
  };
}

export const GroupPage: React.FC = () => {
  // 기존 state들...
  const [groups, setGroups] = useState<Group[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeTab, setActiveTab] = useState<"GRAPH" | "LIST">("GRAPH");
  const [treeData, setTreeData] = useState<D3TreeNode[]>([]);
  const [expandedNodes, setExpandedNodes] = useState<Set<number>>(new Set());
  const [expandedProjects, setExpandedProjects] = useState<Set<number>>(
    new Set()
  );
  const [showFullTree, setShowFullTree] = useState(false);
  const [showPermissionGroups, setShowPermissionGroups] = useState(false);
  const [showSidePanel, setShowSidePanel] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [groupDetails, setGroupDetails] = useState<{
    [key: number]: GroupDetails;
  }>({});
  const [departments, setDepartments] = useState<string[]>([]);
  const [teams, setTeams] = useState<string[]>([]);
  const [validationState, setValidationState] = useState<ValidationState>({});

  // 리스트 뷰를 위한 새로운 state들
  const [listData, setListData] = useState<ListItem[]>([]);
  const [expandedListNodes, setExpandedListNodes] = useState<Set<number>>(
    new Set()
  );

  // 기존 useEffect들...
  useEffect(() => {
    const loadData = () => {
      try {
        setGroups(groupsData as Group[]);
        setProjects(projectsData as Project[]);
        setDepartments(departmentsData as string[]);
        setTeams(teamsData as string[]);

        const initialDetails: { [key: number]: GroupDetails } = {};
        const initialValidation: ValidationState = {};

        (groupsData as Group[]).forEach((group) => {
          initialDetails[group.id] = {
            department: "개발부서",
            team: "프론트엔드팀",
          };

          initialValidation[group.id] = {
            department: false,
            team: false,
          };
        });

        setGroupDetails(initialDetails);
        setValidationState(initialValidation);
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    if (groups.length > 0) {
      buildTree(groups, projects);
      buildListData(groups, projects);
    }
  }, [
    expandedNodes,
    expandedProjects,
    showFullTree,
    showPermissionGroups,
    groups,
    projects,
  ]);

  // 리스트 데이터 구축 함수
  const buildListData = (groupsData: Group[], projectsData: Project[]) => {
    const rootGroups = groupsData.filter((group) => group.parent_id === null);

    const buildListChildren = (parentId: number, level: number): ListItem[] => {
      const items: ListItem[] = [];

      // 하위 그룹들 추가
      const childGroups = groupsData.filter(
        (group) => group.parent_id === parentId
      );
      childGroups.forEach((group) => {
        if (!showPermissionGroups && isPermissionGroup(group.name)) {
          return;
        }

        const groupItem: ListItem = {
          id: group.id,
          name: group.name,
          type: "group",
          full_path: group.full_path,
          level: level,
          parent_id: group.parent_id,
          children: buildListChildren(group.id, level + 1),
        };

        items.push(groupItem);
      });

      // 프로젝트들 추가
      const childProjects = projectsData.filter(
        (project) => project.namespace.id === parentId
      );
      childProjects.forEach((project) => {
        const projectItem: ListItem = {
          id: project.id,
          name: project.name,
          type: "project",
          full_path: project.path_with_namespace,
          level: level,
          children: [],
        };

        items.push(projectItem);

        // shared_with_groups 처리
        if (
          project.shared_with_groups &&
          project.shared_with_groups.length > 0
        ) {
          project.shared_with_groups.forEach((sharedGroup, index) => {
            if (
              !showPermissionGroups &&
              isPermissionGroup(sharedGroup.group_full_path)
            ) {
              return;
            }

            const sharedItem: ListItem = {
              id: -(project.id * 1000 + index),
              name: sharedGroup.group_full_path,
              type: "group",
              full_path: sharedGroup.group_full_path,
              level: level + 1,
              isSharedGroup: true,
            };

            projectItem.children?.push(sharedItem);
          });
        }
      });

      return items;
    };

    const listItems: ListItem[] = rootGroups.map((rootGroup) => ({
      id: rootGroup.id,
      name: rootGroup.name,
      type: "group" as const,
      full_path: rootGroup.full_path,
      level: 0,
      parent_id: rootGroup.parent_id,
      children: buildListChildren(rootGroup.id, 1),
    }));

    setListData(listItems);
  };

  // 리스트 노드 클릭 핸들러
  const handleListNodeClick = (item: ListItem) => {
    if (item.type === "group" && !item.isSharedGroup) {
      const newExpandedNodes = new Set(expandedListNodes);
      if (expandedListNodes.has(item.id)) {
        newExpandedNodes.delete(item.id);
      } else {
        newExpandedNodes.add(item.id);
      }
      setExpandedListNodes(newExpandedNodes);
    }
  };

  // 리스트 상세보기 버튼 클릭 핸들러
  const handleListGroupDetailClick = (
    item: ListItem,
    event: React.MouseEvent
  ) => {
    event.stopPropagation();

    if (showSidePanel && selectedGroup?.id === item.id) {
      closeSidePanel();
      return;
    }

    const group = groups.find((g) => g.id === item.id);
    if (group) {
      setSelectedGroup(group);
      setShowSidePanel(true);
    }
  };

  // 리스트 아이템 렌더링 함수
  const renderListItem = (
    item: ListItem,
    isVisible: boolean = true
  ): React.ReactNode[] => {
    if (!isVisible) return [];

    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedListNodes.has(item.id);
    const isSelectedGroup = showSidePanel && selectedGroup?.id === item.id;

    // 들여쓰기 계산 (레벨당 20px)
    const indentWidth = item.level * 20;
    // 노드 길이 계산 (최대 200px에서 레벨당 15px씩 감소, 최소 80px)
    const nodeWidth = Math.max(200 - item.level * 15, 80);

    const isRegularGroup =
      item.type === "group" &&
      !item.isSharedGroup &&
      !isSpecialGroup(item.name);

    const result: React.ReactNode[] = [
      <div
        key={`item-${item.id}`}
        className={`list-item ${item.type} level-${item.level} ${
          isExpanded ? "expanded" : ""
        }`}
        onClick={() => handleListNodeClick(item)}
        style={{
          paddingLeft: `${indentWidth}px`,
          display: "flex",
          alignItems: "center",
          height: "32px",
          cursor: "pointer",
          borderBottom: "1px solid #f0f0f0",
        }}
      >
        <div
          className="list-item-content"
          style={{ display: "flex", alignItems: "center", flex: 1 }}
        >
          {hasChildren && (
            <span
              className="expand-icon"
              style={{ marginRight: "8px", width: "12px", textAlign: "center" }}
            >
              {isExpanded ? "▼" : "▶"}
            </span>
          )}
          {!hasChildren && (
            <span style={{ marginRight: "8px", width: "12px" }}></span>
          )}

          <div
            className={`list-node ${item.type}`}
            style={{
              width: `${nodeWidth}px`,
              height: "24px",
              backgroundColor:
                item.type === "project"
                  ? "#f1c40f"
                  : getNodeColor(item.name, item.type),
              borderRadius: "4px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: "12px",
              fontWeight: "bold",
              marginRight: "12px",
              border: item.type === "project" ? "1px solid #f39c12" : "none",
            }}
          >
            <span
              style={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                maxWidth: `${nodeWidth - 16}px`,
              }}
            >
              {item.name.length > 12
                ? `${item.name.substring(0, 12)}...`
                : item.name}
            </span>
          </div>

          <span
            className="list-item-text"
            style={{ fontSize: "14px", color: "#495057" }}
          >
            {item.full_path}
          </span>

          {isRegularGroup && (
            <button
              className={`list-detail-btn ${isSelectedGroup ? "selected" : ""}`}
              onClick={(e) => handleListGroupDetailClick(item, e)}
              style={{
                marginLeft: "auto",
                marginRight: "8px",
                width: "20px",
                height: "20px",
                borderRadius: "50%",
                border: "none",
                backgroundColor: isSelectedGroup ? "#28a745" : "#007bff",
                color: "white",
                fontSize: "10px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {isSelectedGroup ? "✓" : "i"}
            </button>
          )}
        </div>
      </div>,
    ];

    // 자식 아이템들 렌더링 (확장된 경우만)
    if (hasChildren && isExpanded) {
      item.children!.forEach((child) => {
        result.push(...renderListItem(child, true));
      });
    }

    return result;
  };

  // 기존 함수들 (권한그룹 확인, 색상 등)...
  const isPermissionGroup = (groupName: string): boolean => {
    const name = groupName.includes("/")
      ? groupName.split("/").pop() || groupName
      : groupName;
    return ["alarm", "architect", "developer", "inspector"].includes(
      name.toLowerCase()
    );
  };

  const getNodeColor = (nodeName: string, nodeType: string): string => {
    if (nodeType === "project") {
      return "#f1c40f";
    }

    const groupName = nodeName.includes("/")
      ? nodeName.split("/").pop() || nodeName
      : nodeName;

    switch (groupName.toLowerCase()) {
      case "architect":
        return "#5d9cec";
      case "inspector":
        return "#e67e22";
      case "developer":
        return "#27ae60";
      case "alarm":
        return "#e74c3c";
      default:
        return "#2c3e50";
    }
  };

  const isSpecialGroup = (nodeName: string): boolean => {
    const groupName = nodeName.includes("/")
      ? nodeName.split("/").pop() || nodeName
      : nodeName;
    return ["architect", "inspector", "developer", "alarm"].includes(
      groupName.toLowerCase()
    );
  };

  // 기존 핸들러들...
  const handleGroupDetailClick = (groupId: number, event: React.MouseEvent) => {
    event.stopPropagation();
    if (showSidePanel && selectedGroup?.id === groupId) {
      closeSidePanel();
      return;
    }
    const group = groups.find((g) => g.id === groupId);
    if (group) {
      setSelectedGroup(group);
      setShowSidePanel(true);
    }
  };

  const closeSidePanel = () => {
    setShowSidePanel(false);
    setSelectedGroup(null);
  };

  const handleCellChange = (field: "department" | "team", value: string) => {
    if (!selectedGroup) return;
    setGroupDetails((prev) => ({
      ...prev,
      [selectedGroup.id]: {
        ...prev[selectedGroup.id],
        [field]: value,
      },
    }));
  };

  const setInvalid = (groupId: number, field: string, isInvalid: boolean) => {
    setValidationState((prev) => ({
      ...prev,
      [groupId]: {
        ...prev[groupId],
        [field]: isInvalid,
      },
    }));
  };

  const getCurrentValidation = (field: string): boolean => {
    if (!selectedGroup) return false;
    return validationState[selectedGroup.id]?.[field] || false;
  };

  // 기존 Tree 관련 함수들...
  const buildTree = (groupsData: Group[], projectsData: Project[]) => {
    // 기존 buildTree 로직 유지...
    const rootGroups = groupsData.filter((group) => group.parent_id === null);

    const buildChildren = (groupId: number): D3TreeNode[] => {
      if (!showFullTree && !expandedNodes.has(groupId)) {
        return [];
      }

      const children: D3TreeNode[] = [];
      const childGroups = groupsData.filter(
        (group) => group.parent_id === groupId
      );

      childGroups.forEach((group) => {
        if (!showPermissionGroups && isPermissionGroup(group.name)) {
          return;
        }

        children.push({
          name: group.name,
          attributes: {
            id: group.id,
            type: "group",
            full_path: group.full_path,
          },
          children: buildChildren(group.id),
        });
      });

      const childProjects = projectsData.filter(
        (project) => project.namespace.id === groupId
      );
      childProjects.forEach((project) => {
        const projectChildren: D3TreeNode[] = [];

        if (
          project.shared_with_groups &&
          project.shared_with_groups.length > 0 &&
          (showFullTree || expandedProjects.has(project.id))
        ) {
          project.shared_with_groups.forEach((sharedGroup, index) => {
            if (
              !showPermissionGroups &&
              isPermissionGroup(sharedGroup.group_full_path)
            ) {
              return;
            }

            projectChildren.push({
              name: sharedGroup.group_full_path,
              attributes: {
                id: -(project.id * 1000 + index),
                type: "group",
                full_path: sharedGroup.group_full_path,
                isSharedGroup: true,
              },
            });
          });
        }

        const projectNode: D3TreeNode = {
          name: project.name,
          attributes: {
            id: project.id,
            type: "project",
            full_path: project.path_with_namespace,
          },
          children: projectChildren,
        };

        children.push(projectNode);
      });

      return children;
    };

    let tree: D3TreeNode[];

    if (rootGroups.length === 1) {
      tree = [
        {
          name: rootGroups[0].name,
          attributes: {
            id: rootGroups[0].id,
            type: "group",
            full_path: rootGroups[0].full_path,
          },
          children: buildChildren(rootGroups[0].id),
        },
      ];
    } else if (rootGroups.length > 1) {
      tree = [
        {
          name: "ROOT",
          attributes: {
            id: -999,
            type: "group",
            full_path: "root",
            isVirtualRoot: true,
          },
          children: rootGroups.map((rootGroup) => ({
            name: rootGroup.name,
            attributes: {
              id: rootGroup.id,
              type: "group",
              full_path: rootGroup.full_path,
            },
            children: buildChildren(rootGroup.id),
          })),
        },
      ];
      const newExpandedNodes = new Set(expandedNodes);
      newExpandedNodes.add(-999);
      if (!expandedNodes.has(-999)) {
        setExpandedNodes(newExpandedNodes);
      }
    } else {
      tree = [];
    }

    setTreeData(tree);
  };

  const expandAllNodes = () => {
    const allGroupIds = new Set<number>();
    const allProjectIds = new Set<number>();
    groups.forEach((group) => allGroupIds.add(group.id));
    projects.forEach((project) => allProjectIds.add(project.id));
    setExpandedNodes(allGroupIds);
    setExpandedProjects(allProjectIds);
  };

  const collapseAllNodes = () => {
    setExpandedNodes(new Set([-999]));
    setExpandedProjects(new Set());
    setShowFullTree(false);
  };

  const handleNodeClick = (nodeData: any) => {
    const nodeId = nodeData.attributes?.id;
    const nodeType = nodeData.attributes?.type;
    const isVirtualRoot = nodeData.attributes?.isVirtualRoot;

    if (isVirtualRoot) {
      return;
    }

    if (nodeType === "group" && nodeId && !nodeData.attributes?.isSharedGroup) {
      const newExpandedNodes = new Set(expandedNodes);
      if (expandedNodes.has(nodeId)) {
        newExpandedNodes.delete(nodeId);
        const removeChildrenRecursively = (parentId: number) => {
          const children = groups.filter(
            (group) => group.parent_id === parentId
          );
          children.forEach((child) => {
            newExpandedNodes.delete(child.id);
            removeChildrenRecursively(child.id);
          });
        };
        removeChildrenRecursively(nodeId);
        setExpandedNodes(newExpandedNodes);
      } else {
        newExpandedNodes.add(nodeId);
        setExpandedNodes(newExpandedNodes);
      }
    } else if (nodeType === "project" && nodeId) {
      const newExpandedProjects = new Set(expandedProjects);
      if (expandedProjects.has(nodeId)) {
        newExpandedProjects.delete(nodeId);
      } else {
        newExpandedProjects.add(nodeId);
      }
      setExpandedProjects(newExpandedProjects);
    }
  };

  const renderCustomNodeElement = ({ nodeDatum }: any) => {
    // 기존 renderCustomNodeElement 로직 유지...
    const isVirtualRoot = nodeDatum.attributes?.isVirtualRoot;

    if (isVirtualRoot) {
      return (
        <g>
          <circle r="5" fill="transparent" stroke="transparent" />
        </g>
      );
    }

    const nodeColor = getNodeColor(
      nodeDatum.name,
      nodeDatum.attributes?.type || "group"
    );
    const hasChildren = nodeDatum.children && nodeDatum.children.length > 0;
    const nodeType = nodeDatum.attributes?.type;
    const nodeId = nodeDatum.attributes?.id;

    let isExpanded = false;
    if (nodeType === "group" && !nodeDatum.attributes?.isSharedGroup) {
      isExpanded = expandedNodes.has(nodeId);
    } else if (nodeType === "project") {
      isExpanded = expandedProjects.has(nodeId);
    }

    const displayName =
      nodeDatum.name.length > 15
        ? `${nodeDatum.name.substring(0, 15)}...`
        : nodeDatum.name;
    const needsBorder = !isSpecialGroup(nodeDatum.name);
    const isRegularGroup =
      nodeType === "group" &&
      !nodeDatum.attributes?.isSharedGroup &&
      !isSpecialGroup(nodeDatum.name) &&
      !isVirtualRoot;
    const isSelectedGroup = showSidePanel && selectedGroup?.id === nodeId;

    return (
      <g>
        <rect
          width="160"
          height="28"
          x="-80"
          y="-14"
          fill={nodeColor}
          rx="6"
          ry="6"
          stroke={
            needsBorder
              ? nodeType === "project"
                ? "#f39c12"
                : "#34495e"
              : "#fff"
          }
          strokeWidth={needsBorder ? "2" : "1"}
          strokeDasharray={
            needsBorder && nodeType === "project" ? "4,4" : "none"
          }
          style={{ cursor: "pointer" }}
          onClick={() => handleNodeClick(nodeDatum)}
        />
        <text
          fill="white"
          strokeWidth="0"
          x="0"
          y="3"
          textAnchor="middle"
          style={{
            font: "bold 10px sans-serif",
            cursor: "pointer",
          }}
          onClick={() => handleNodeClick(nodeDatum)}
        >
          {displayName}
        </text>
        {hasChildren &&
          !showFullTree &&
          !nodeDatum.attributes?.isSharedGroup && (
            <text
              fill="white"
              strokeWidth="0"
              x="65"
              y="-8"
              textAnchor="middle"
              style={{
                font: "bold 12px sans-serif",
                cursor: "pointer",
              }}
              onClick={() => handleNodeClick(nodeDatum)}
            >
              {isExpanded ? "−" : "+"}
            </text>
          )}
        {isRegularGroup && (
          <circle
            cx="50"
            cy="8"
            r="8"
            fill={isSelectedGroup ? "#28a745" : "#007bff"}
            stroke="#fff"
            strokeWidth="1"
            style={{ cursor: "pointer" }}
            onClick={(e) => handleGroupDetailClick(nodeId, e)}
          />
        )}
        {isRegularGroup && (
          <text
            x="50"
            y="12"
            textAnchor="middle"
            fill="white"
            style={{
              font: "bold 10px sans-serif",
              cursor: "pointer",
              pointerEvents: "none",
            }}
          >
            {isSelectedGroup ? "✓" : "i"}
          </text>
        )}
      </g>
    );
  };

  return (
    <div className="group-page">
      <div className="tab-container">
        <button
          className={`tab ${activeTab === "GRAPH" ? "active" : ""}`}
          onClick={() => setActiveTab("GRAPH")}
        >
          GRAPH
        </button>
        <button
          className={`tab ${activeTab === "LIST" ? "active" : ""}`}
          onClick={() => setActiveTab("LIST")}
        >
          LIST
        </button>
      </div>

      <div className="content-area">
        {activeTab === "GRAPH" ? (
          <div className="graph-view">
            <div className="controls">
              <div className="control-buttons">
                <button
                  className="control-btn expand-btn"
                  onClick={expandAllNodes}
                >
                  전체 트리 보기
                </button>
                <button
                  className="control-btn collapse-btn"
                  onClick={collapseAllNodes}
                >
                  전체 트리 접기
                </button>
              </div>

              <div className="control-checkbox">
                <label className="checkbox-container">
                  <input
                    type="checkbox"
                    checked={showPermissionGroups}
                    onChange={(e) => setShowPermissionGroups(e.target.checked)}
                  />
                  <span className="checkmark"></span>
                  권한그룹보기
                </label>
              </div>
            </div>

            <div
              className={`main-content ${
                showSidePanel ? "with-side-panel" : ""
              }`}
            >
              <div className="tree-container">
                {treeData.length > 0 && (
                  <Tree
                    data={treeData}
                    orientation="horizontal"
                    translate={{ x: 100, y: 50 }}
                    pathFunc="step"
                    renderCustomNodeElement={renderCustomNodeElement}
                    separation={{ siblings: 0.6, nonSiblings: 0.9 }}
                    nodeSize={{ x: 200, y: 65 }}
                    zoom={0.8}
                    collapsible={false}
                    enableLegacyTransitions={false}
                    transitionDuration={0}
                    scaleExtent={{ min: 0.3, max: 3 }}
                  />
                )}
              </div>

              {/* 사이드 패널 */}
              {showSidePanel && selectedGroup && (
                <div className="side-panel">
                  <div className="side-panel-header">
                    <h3>그룹 상세정보</h3>
                    <button className="close-btn" onClick={closeSidePanel}>
                      ×
                    </button>
                  </div>
                  <div className="side-panel-content">
                    <div className="info-item">
                      <label>그룹명:</label>
                      <span>{selectedGroup.name}</span>
                    </div>
                    <div className="info-item">
                      <label>전체 경로:</label>
                      <span>{selectedGroup.full_path}</span>
                    </div>
                    <div className="info-item">
                      <label>부서명:</label>
                      <GroupEditableCell
                        value={groupDetails[selectedGroup.id]?.department || ""}
                        options={departments}
                        onChange={(value) =>
                          handleCellChange("department", value)
                        }
                        invalid={getCurrentValidation("department")}
                        setInvalid={setInvalid}
                        groupId={selectedGroup.id}
                        field="department"
                      />
                    </div>
                    <div className="info-item">
                      <label>팀명:</label>
                      <GroupEditableCell
                        value={groupDetails[selectedGroup.id]?.team || ""}
                        options={teams}
                        onChange={(value) => handleCellChange("team", value)}
                        invalid={getCurrentValidation("team")}
                        setInvalid={setInvalid}
                        groupId={selectedGroup.id}
                        field="team"
                      />
                    </div>
                    <div className="info-item">
                      <label>생성일:</label>
                      <span>
                        {new Date(
                          selectedGroup.created_at
                        ).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="info-item">
                      <label>ID:</label>
                      <span>{selectedGroup.id}</span>
                    </div>
                    {selectedGroup.parent_id && (
                      <div className="info-item">
                        <label>상위 그룹 ID:</label>
                        <span>{selectedGroup.parent_id}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="list-view">
            <div className="list-controls">
              <div className="control-checkbox">
                <label className="checkbox-container">
                  <input
                    type="checkbox"
                    checked={showPermissionGroups}
                    onChange={(e) => setShowPermissionGroups(e.target.checked)}
                  />
                  <span className="checkmark"></span>
                  권한그룹보기
                </label>
              </div>
            </div>

            <div
              className={`list-main-content ${
                showSidePanel ? "with-side-panel" : ""
              }`}
            >
              <div className="list-container">
                <div
                  className="list-header"
                  style={{
                    textAlign: "center",
                    padding: "10px",
                    backgroundColor: "#f8f9fa",
                    borderBottom: "2px solid #dee2e6",
                    fontWeight: "bold",
                    fontSize: "16px",
                  }}
                >
                  그룹 및 프로젝트 목록
                </div>
                <div className="list-content">
                  {listData.map((item) => renderListItem(item))}
                </div>
              </div>

              {/* 사이드 패널 (GRAPH와 동일) */}
              {showSidePanel && selectedGroup && (
                <div className="side-panel">
                  <div className="side-panel-header">
                    <h3>그룹 상세정보</h3>
                    <button className="close-btn" onClick={closeSidePanel}>
                      ×
                    </button>
                  </div>
                  <div className="side-panel-content">
                    <div className="info-item">
                      <label>그룹명:</label>
                      <span>{selectedGroup.name}</span>
                    </div>
                    <div className="info-item">
                      <label>전체 경로:</label>
                      <span>{selectedGroup.full_path}</span>
                    </div>
                    <div className="info-item">
                      <label>부서명:</label>
                      <GroupEditableCell
                        value={groupDetails[selectedGroup.id]?.department || ""}
                        options={departments}
                        onChange={(value) =>
                          handleCellChange("department", value)
                        }
                        invalid={getCurrentValidation("department")}
                        setInvalid={setInvalid}
                        groupId={selectedGroup.id}
                        field="department"
                      />
                    </div>
                    <div className="info-item">
                      <label>팀명:</label>
                      <GroupEditableCell
                        value={groupDetails[selectedGroup.id]?.team || ""}
                        options={teams}
                        onChange={(value) => handleCellChange("team", value)}
                        invalid={getCurrentValidation("team")}
                        setInvalid={setInvalid}
                        groupId={selectedGroup.id}
                        field="team"
                      />
                    </div>
                    <div className="info-item">
                      <label>생성일:</label>
                      <span>
                        {new Date(
                          selectedGroup.created_at
                        ).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="info-item">
                      <label>ID:</label>
                      <span>{selectedGroup.id}</span>
                    </div>
                    {selectedGroup.parent_id && (
                      <div className="info-item">
                        <label>상위 그룹 ID:</label>
                        <span>{selectedGroup.parent_id}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
