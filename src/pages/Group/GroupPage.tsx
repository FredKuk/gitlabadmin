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
  }, [expandedNodes, expandedProjects, showFullTree, groups, projects]);

  const buildTree = (groupsData: Group[], projectsData: Project[]) => {
    // parent_id가 null인 최상위 그룹들만 (PPA만 보여야 함)
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
        children.push({
          name: group.name, // 그룹은 name만 표시
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
            projectChildren.push({
              name: sharedGroup.group_full_path, // group_full_path로 표현
              attributes: {
                id: -(project.id * 1000 + index), // 고유한 음수 ID 생성
                type: "group",
                full_path: sharedGroup.group_full_path,
                isSharedGroup: true,
              },
            });
          });
        }

        const projectNode: D3TreeNode = {
          name: project.name, // 프로젝트는 name만 표시
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

    const tree = rootGroups.map((rootGroup) => ({
      name: rootGroup.name, // 최상위도 name만
      attributes: {
        id: rootGroup.id,
        type: "group" as const,
        full_path: rootGroup.full_path,
      },
      children: buildChildren(rootGroup.id),
    }));

    setTreeData(tree);
  };

  // 그룹을 접을 때 하위 그룹들도 모두 접기
  const collapseAllChildren = (groupId: number, groupsData: Group[]) => {
    const childGroups = groupsData.filter(
      (group) => group.parent_id === groupId
    );
    const newExpandedNodes = new Set(expandedNodes);

    const removeChildrenRecursively = (parentId: number) => {
      const children = groupsData.filter(
        (group) => group.parent_id === parentId
      );
      children.forEach((child) => {
        newExpandedNodes.delete(child.id);
        removeChildrenRecursively(child.id);
      });
    };

    removeChildrenRecursively(groupId);
    setExpandedNodes(newExpandedNodes);
  };

  const handleNodeClick = (nodeData: any) => {
    const nodeId = nodeData.attributes?.id;
    const nodeType = nodeData.attributes?.type;

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
        setExpandedNodes(newExpandedNodes); // 이 부분이 중요!
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

    return (
      <g>
        <rect
          width="160"
          height="40"
          x="-80"
          y="-20"
          fill={nodeColor}
          rx="8"
          ry="8"
          stroke={
            needsBorder
              ? nodeType === "project"
                ? "#f39c12"
                : "#34495e"
              : "#fff"
          }
          strokeWidth={needsBorder ? "3" : "2"}
          strokeDasharray={
            needsBorder && nodeType === "project" ? "5,5" : "none"
          }
          style={{ cursor: "pointer" }}
          onClick={() => handleNodeClick(nodeDatum)}
        />
        <text
          fill="white"
          strokeWidth="0"
          x="0"
          y="5"
          textAnchor="middle"
          style={{
            font: "bold 11px sans-serif",
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
              y="-10"
              textAnchor="middle"
              style={{
                font: "bold 14px sans-serif",
                cursor: "pointer",
              }}
              onClick={() => handleNodeClick(nodeDatum)}
            >
              {isExpanded ? "−" : "+"}
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
              <label className="checkbox-container">
                <input
                  type="checkbox"
                  checked={showFullTree}
                  onChange={(e) => setShowFullTree(e.target.checked)}
                />
                <span className="checkmark"></span>
                전체 트리 보기
              </label>
            </div>
            <div className="tree-container">
              {treeData.length > 0 && (
                <Tree
                  data={treeData}
                  orientation="horizontal"
                  translate={{ x: 120, y: 300 }}
                  pathFunc="step"
                  renderCustomNodeElement={renderCustomNodeElement}
                  separation={{ siblings: 0.8, nonSiblings: 1.2 }}
                  nodeSize={{ x: 200, y: 80 }}
                  zoom={0.8}
                  collapsible={false}
                />
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
