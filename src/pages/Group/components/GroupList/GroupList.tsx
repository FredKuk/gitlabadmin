import React from "react";
import { Group, Project } from "../../../../types/group";
import {
  ListItem,
  buildListData,
  getNodeColor,
  isSpecialGroup,
} from "../../utils/groupUtils";
import "./GroupList.scss";

interface GroupListProps {
  groups: Group[];
  projects: Project[];
  expandedListNodes: Set<number>;
  showPermissionGroups: boolean;
  showSidePanel: boolean;
  selectedGroup: Group | null;
  onListNodeClick: (item: ListItem) => void;
  onListGroupDetailClick: (item: ListItem, event: React.MouseEvent) => void;
  onTogglePermissionGroups: (show: boolean) => void;
  onExpandAllList: () => void; // 새로 추가
  onCollapseAllList: () => void; // 새로 추가
}

export const GroupList: React.FC<GroupListProps> = ({
  groups,
  projects,
  expandedListNodes,
  showPermissionGroups,
  showSidePanel,
  selectedGroup,
  onListNodeClick,
  onListGroupDetailClick,
  onTogglePermissionGroups,
  onExpandAllList, // 새로 추가
  onCollapseAllList, // 새로 추가
}) => {
  const listData = buildListData(groups, projects, showPermissionGroups);

  // 리스트 아이템 렌더링 함수
  const renderListItem = (
    item: ListItem,
    isVisible: boolean = true
  ): React.ReactNode[] => {
    if (!isVisible) return [];

    const hasChildren = item.children && item.children.length > 0;
    // 프로젝트의 경우 shared_with_groups가 있으면 hasChildren = true
    const hasSharedGroups = item.type === "project" && item.hasSharedGroups && showPermissionGroups;
    const actuallyHasChildren = hasChildren || hasSharedGroups;

    // ID 처리 (string일 수도 있고 number일 수도 있음)
    const itemId = typeof item.id === "string" ? parseInt(item.id) : item.id;

    const isExpanded = expandedListNodes.has(itemId);
    const isSelectedGroup = showSidePanel && selectedGroup?.id === item.id;

    // 들여쓰기 계산 (레벨당 20px)
    const indentWidth = item.level * 20;
    // 노드 길이 계산 (최대 200px에서 레벨당 15px씩 감소, 최소 80px)
    const nodeWidth = Math.max(200 - item.level * 15, 80);

    const isRegularGroup =
      item.type === "group" &&
      !item.isSharedGroup &&
      !isSpecialGroup(item.name);

    const nodeColor = getNodeColor(item.name, item.type);

    const result: React.ReactNode[] = [
      <div
        key={`item-${item.id}`}
        className={`list-item ${item.type} level-${item.level} ${
          isExpanded ? "expanded" : ""
        }`}
        onClick={() => onListNodeClick(item)}
        style={{
          paddingLeft: `${indentWidth}px`,
        }}
      >
        <div className="list-item-content">
          {actuallyHasChildren && (
            <span className="expand-icon">{isExpanded ? "▼" : "▶"}</span>
          )}
          {!actuallyHasChildren && <span className="expand-icon-placeholder"></span>}

          <div
            className={`list-node ${item.type}`}
            style={{
              width: `${nodeWidth}px`,
              backgroundColor: nodeColor,
            }}
          >
            <span className="node-text">
              {item.name.length > 12
                ? `${item.name.substring(0, 12)}...`
                : item.name}
            </span>
          </div>

          <span className="list-item-text">{item.full_path}</span>

          {isRegularGroup && (
            <button
              className={`list-detail-btn ${isSelectedGroup ? "selected" : ""}`}
              onClick={(e) => onListGroupDetailClick(item, e)}
            >
              {isSelectedGroup ? "✓" : "i"}
            </button>
          )}
        </div>
      </div>,
    ];

    // 자식 아이템들 렌더링 (확장된 경우만)
    if (actuallyHasChildren && isExpanded) {
      item.children!.forEach((child) => {
        result.push(...renderListItem(child, true));
      });
    }

    return result;
  };

  return (
    <div className="group-list">
      <div className="list-controls">
        <div className="control-buttons">
          <button
            className="control-btn expand-btn"
            onClick={onExpandAllList}
          >
            전체 리스트 보기
          </button>
          <button
            className="control-btn collapse-btn"
            onClick={onCollapseAllList}
          >
            전체 리스트 접기
          </button>
        </div>

        <div className="control-checkbox">
          <label className="checkbox-container">
            <input
              type="checkbox"
              checked={showPermissionGroups}
              onChange={(e) => onTogglePermissionGroups(e.target.checked)}
            />
            <span className="checkmark"></span>
            권한그룹보기
          </label>
        </div>
      </div>

      <div className="list-container">
        <div className="list-header">그룹 및 프로젝트 목록</div>
        <div className="list-content">
          {listData.map((item) => renderListItem(item))}
        </div>
      </div>
    </div>
  );
};
