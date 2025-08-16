import React, { useState, useEffect } from "react";
import { Group } from "../../types/group";
import { useGroupData } from "./hooks/useGroupData";
import { GroupGraph } from "./components/GroupGraph/GroupGraph";
import { GroupList } from "./components/GroupList/GroupList";
import { GroupSidePanel } from "./components/GroupSidePanel/GroupSidePanel";
import {
  ListItem,
  buildListData,
  getAllGroupIdsFromList,
} from "./utils/groupUtils";
import "./GroupPage.scss";

export const GroupPage: React.FC = () => {
  const {
    groups,
    projects,
    departments,
    teams,
    groupDetails,
    isLoading,
    updateGroupDetails,
    setInvalid,
    getCurrentValidation,
  } = useGroupData();

  // 탭 상태
  const [activeTab, setActiveTab] = useState<"GRAPH" | "LIST">("GRAPH");

  // 그래프 뷰 상태
  const [expandedNodes, setExpandedNodes] = useState<Set<number>>(new Set());
  const [expandedProjects, setExpandedProjects] = useState<Set<number>>(
    new Set()
  );
  const [showFullTree, setShowFullTree] = useState(false);

  // 리스트 뷰 상태
  const [expandedListNodes, setExpandedListNodes] = useState<Set<number>>(
    new Set()
  );

  // 공통 상태
  const [showPermissionGroups, setShowPermissionGroups] = useState(false);
  const [showSidePanel, setShowSidePanel] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

  // 가상 루트 자동 확장 처리
  useEffect(() => {
    if (groups.length > 0) {
      const rootGroups = groups.filter((group) => group.parent_id === null);
      if (rootGroups.length > 1) {
        const newExpandedNodes = new Set(expandedNodes);
        newExpandedNodes.add(-999); // 가상 루트 ID
        if (!expandedNodes.has(-999)) {
          setExpandedNodes(newExpandedNodes);
        }
      }
    }
  }, [groups, expandedNodes]);

  // 그래프 뷰 핸들러들
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

  const handleGroupDetailClick = (groupId: number, event: React.MouseEvent) => {
    event.stopPropagation();

    // 이미 같은 그룹이 선택되어 있으면 닫기
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

  const expandAllNodes = () => {
    const allGroupIds = new Set<number>();
    const allProjectIds = new Set<number>();
    groups.forEach((group) => allGroupIds.add(group.id));
    projects.forEach((project) => allProjectIds.add(project.id));
    setExpandedNodes(allGroupIds);
    setExpandedProjects(allProjectIds);
  };

  const collapseAllNodes = () => {
    setExpandedNodes(new Set([-999])); // 가상 루트만 유지
    setExpandedProjects(new Set());
    setShowFullTree(false);
  };

  // 리스트 뷰 핸들러들
  const handleListNodeClick = (item: ListItem) => {
    // 그룹이거나 프로젝트이고, shared_group이 아닌 경우 토글
    if ((item.type === "group" && !item.isSharedGroup) || item.type === "project") {
      const itemId = typeof item.id === "string" ? 
        parseInt(item.id) : item.id;
      
      const newExpandedNodes = new Set(expandedListNodes);
      if (expandedListNodes.has(itemId)) {
        newExpandedNodes.delete(itemId);
      } else {
        newExpandedNodes.add(itemId);
      }
      setExpandedListNodes(newExpandedNodes);
    }
  };

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

  // 새로 추가된 리스트 전체 보기/접기 핸들러들
  const handleExpandAllList = () => {
    if (groups.length === 0) return;

    // 현재 리스트 데이터 기준으로 모든 그룹 ID 수집
    const listData = buildListData(groups, projects, showPermissionGroups);
    const allGroupIds = getAllGroupIdsFromList(listData);

    setExpandedListNodes(allGroupIds);
  };

  const handleCollapseAllList = () => {
    setExpandedListNodes(new Set());
  };

  // 공통 핸들러들
  const closeSidePanel = () => {
    setShowSidePanel(false);
    setSelectedGroup(null);
  };

  const handleCellChange = (field: "department" | "team", value: string) => {
    if (!selectedGroup) return;
    updateGroupDetails(selectedGroup.id, field, value);
  };

  const handleGetCurrentValidation = (field: string): boolean => {
    if (!selectedGroup) return false;
    return getCurrentValidation(selectedGroup.id, field);
  };

  const handleTogglePermissionGroups = (show: boolean) => {
    setShowPermissionGroups(show);
  };

  if (isLoading) {
    return (
      <div className="group-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

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
        <div
          className={`main-content ${showSidePanel ? "with-side-panel" : ""}`}
        >
          <div className="view-container">
            {activeTab === "GRAPH" ? (
              <GroupGraph
                groups={groups}
                projects={projects}
                expandedNodes={expandedNodes}
                expandedProjects={expandedProjects}
                showFullTree={showFullTree}
                showPermissionGroups={showPermissionGroups}
                showSidePanel={showSidePanel}
                selectedGroup={selectedGroup}
                onNodeClick={handleNodeClick}
                onGroupDetailClick={handleGroupDetailClick}
                onExpandAll={expandAllNodes}
                onCollapseAll={collapseAllNodes}
                onTogglePermissionGroups={handleTogglePermissionGroups}
              />
            ) : (
              <GroupList
                groups={groups}
                projects={projects}
                expandedListNodes={expandedListNodes}
                showPermissionGroups={showPermissionGroups}
                showSidePanel={showSidePanel}
                selectedGroup={selectedGroup}
                onListNodeClick={handleListNodeClick}
                onListGroupDetailClick={handleListGroupDetailClick}
                onTogglePermissionGroups={handleTogglePermissionGroups}
                onExpandAllList={handleExpandAllList} // 새로 추가
                onCollapseAllList={handleCollapseAllList} // 새로 추가
              />
            )}
          </div>

          {showSidePanel && (
            <GroupSidePanel
              selectedGroup={selectedGroup}
              groupDetails={groupDetails}
              departments={departments}
              teams={teams}
              onCellChange={handleCellChange}
              getCurrentValidation={handleGetCurrentValidation}
              setInvalid={setInvalid}
              onClose={closeSidePanel}
            />
          )}
        </div>
      </div>
    </div>
  );
};
