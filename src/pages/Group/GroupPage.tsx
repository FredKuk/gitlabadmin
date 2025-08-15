import React, { useState, useEffect } from "react";
import "./GroupPage.scss";
import { Group, Project } from "../../types/group";
import groupsData from "../../mock/groups_minimal.json";
import projectsData from "../../mock/project_minimal.json";
import Tree from "react-d3-tree";

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

export const GroupPage: React.FC = () => {
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
  // 사이드 패널 관련 state 추가
  const [showSidePanel, setShowSidePanel] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

  useEffect(() => {
    const loadData = () => {
      try {
        setGroups(groupsData as Group[]);
        setProjects(projectsData as Project[]);
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    if (groups.length > 0) {
      buildTree(groups, projects);
    }
  }, [
    expandedNodes,
    expandedProjects,
    showFullTree,
    showPermissionGroups,
    groups,
    projects,
  ]);

  // 권한그룹인지 확인하는 함수
  const isPermissionGroup = (groupName: string): boolean => {
    const name = groupName.includes("/")
      ? groupName.split("/").pop() || groupName
      : groupName;
    return ["alarm", "architect", "developer", "inspector"].includes(
      name.toLowerCase()
    );
  };

  // 그룹 상세보기 버튼 클릭 핸들러
  const handleGroupDetailClick = (groupId: number, event: React.MouseEvent) => {
    event.stopPropagation(); // 노드 클릭 이벤트 방지
    const group = groups.find((g) => g.id === groupId);
    if (group) {
      setSelectedGroup(group);
      setShowSidePanel(true);
    }
  };

  // 사이드 패널 닫기
  const closeSidePanel = () => {
    setShowSidePanel(false);
    setSelectedGroup(null);
  };

  const buildTree = (groupsData: Group[], projectsData: Project[]) => {
    // parent_id가 null인 최상위 그룹들 찾기
    const rootGroups = groupsData.filter((group) => group.parent_id === null);

    const buildChildren = (groupId: number): D3TreeNode[] => {
      // showFullTree가 false이고 expandedNodes에 없으면 children 반환하지 않음
      if (!showFullTree && !expandedNodes.has(groupId)) {
        return [];
      }

      const children: D3TreeNode[] = [];

      // 하위 그룹들 (parent_id로 찾기)
      const childGroups = groupsData.filter(
        (group) => group.parent_id === groupId
      );

      childGroups.forEach((group) => {
        // 권한그룹 필터링: showPermissionGroups가 false이면 권한그룹 제외
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

      // 해당 그룹에 속한 프로젝트들 (namespace.id로 찾기)
      const childProjects = projectsData.filter(
        (project) => project.namespace.id === groupId
      );
      childProjects.forEach((project) => {
        const projectChildren: D3TreeNode[] = [];

        // shared_with_groups가 있고 프로젝트가 확장된 상태면 추가
        if (
          project.shared_with_groups &&
          project.shared_with_groups.length > 0 &&
          (showFullTree || expandedProjects.has(project.id))
        ) {
          project.shared_with_groups.forEach((sharedGroup, index) => {
            // 권한그룹 필터링: showPermissionGroups가 false이면 권한그룹 제외
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
      // 루트 그룹이 하나면 그대로 사용
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
      // 루트 그룹이 여러 개면 가상 루트 생성
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
      // 가상 루트는 항상 확장된 상태로 설정
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

  // 전체 트리 펼치기 (일회성 작업)
  const expandAllNodes = () => {
    const allGroupIds = new Set<number>();
    const allProjectIds = new Set<number>();

    // 모든 그룹과 프로젝트 ID 수집
    groups.forEach((group) => allGroupIds.add(group.id));
    projects.forEach((project) => allProjectIds.add(project.id));

    setExpandedNodes(allGroupIds);
    setExpandedProjects(allProjectIds);
    // showFullTree는 변경하지 않음 (일회성 작업)
  };

  // 전체 트리 접기 (일회성 작업)
  const collapseAllNodes = () => {
    setExpandedNodes(new Set([-999])); // 가상 루트만 유지
    setExpandedProjects(new Set());
    setShowFullTree(false); // 이것만 false로 변경
  };

  const handleNodeClick = (nodeData: any) => {
    const nodeId = nodeData.attributes?.id;
    const nodeType = nodeData.attributes?.type;
    const isVirtualRoot = nodeData.attributes?.isVirtualRoot;

    // 가상 루트는 클릭해도 동작하지 않음
    if (isVirtualRoot) {
      return;
    }

    if (nodeType === "group" && nodeId && !nodeData.attributes?.isSharedGroup) {
      const newExpandedNodes = new Set(expandedNodes);
      if (expandedNodes.has(nodeId)) {
        newExpandedNodes.delete(nodeId);
        // 그룹을 접을 때 하위 그룹들도 모두 접기
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

  const getNodeColor = (nodeName: string, nodeType: string): string => {
    if (nodeType === "project") {
      return "#f1c40f"; // 노란색
    }

    // shared_with_groups의 경우 full_path에서 마지막 부분만 추출
    const groupName = nodeName.includes("/")
      ? nodeName.split("/").pop() || nodeName
      : nodeName;

    switch (groupName.toLowerCase()) {
      case "architect":
        return "#5d9cec"; // 파란색
      case "inspector":
        return "#e67e22"; // 주황색
      case "developer":
        return "#27ae60"; // 초록색
      case "alarm":
        return "#e74c3c"; // 빨간색
      default:
        return "#2c3e50"; // 기본 회색
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

  const renderCustomNodeElement = ({ nodeDatum }: any) => {
    const isVirtualRoot = nodeDatum.attributes?.isVirtualRoot;

    // 가상 루트는 투명하게 처리
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

    // 긴 텍스트 처리
    const displayName =
      nodeDatum.name.length > 15
        ? `${nodeDatum.name.substring(0, 15)}...`
        : nodeDatum.name;

    // 특별한 그룹인지 확인 (테두리 제외 대상)
    const needsBorder = !isSpecialGroup(nodeDatum.name);

    // 일반 그룹(특별 그룹 제외)인지 확인
    const isRegularGroup =
      nodeType === "group" &&
      !nodeDatum.attributes?.isSharedGroup &&
      !isSpecialGroup(nodeDatum.name) &&
      !isVirtualRoot;

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
        {/* 일반 그룹에만 상세보기 버튼 추가 */}
        {isRegularGroup && (
          <circle
            cx="50"
            cy="8"
            r="8"
            fill="#007bff"
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
            i
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
                      <label>ID:</label>
                      <span>{selectedGroup.id}</span>
                    </div>
                    <div className="info-item">
                      <label>설명:</label>
                      <span>
                        {(selectedGroup as any).description ||
                          "설명이 없습니다."}
                      </span>
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
                      <label>가시성:</label>
                      <span>
                        {(selectedGroup as any).visibility || "설정되지 않음"}
                      </span>
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
            <div className="placeholder">
              LIST 화면은 아직 구현되지 않았습니다.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
