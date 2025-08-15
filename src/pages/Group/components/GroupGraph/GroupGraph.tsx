import React from "react";
import Tree from "react-d3-tree";
import { Group, Project } from "../../../../types/group";
import {
  D3TreeNode,
  buildTreeData,
  getNodeColor,
  isSpecialGroup,
} from "../../utils/groupUtils";
import "./GroupGraph.scss";

interface GroupGraphProps {
  groups: Group[];
  projects: Project[];
  expandedNodes: Set<number>;
  expandedProjects: Set<number>;
  showFullTree: boolean;
  showPermissionGroups: boolean;
  showSidePanel: boolean;
  selectedGroup: Group | null;
  onNodeClick: (nodeData: any) => void;
  onGroupDetailClick: (groupId: number, event: React.MouseEvent) => void;
  onExpandAll: () => void;
  onCollapseAll: () => void;
  onTogglePermissionGroups: (show: boolean) => void;
}

export const GroupGraph: React.FC<GroupGraphProps> = ({
  groups,
  projects,
  expandedNodes,
  expandedProjects,
  showFullTree,
  showPermissionGroups,
  showSidePanel,
  selectedGroup,
  onNodeClick,
  onGroupDetailClick,
  onExpandAll,
  onCollapseAll,
  onTogglePermissionGroups,
}) => {
  const treeData = buildTreeData(
    groups,
    projects,
    expandedNodes,
    expandedProjects,
    showFullTree,
    showPermissionGroups
  );

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

    // 현재 선택된 그룹인지 확인 (circle 색상 변경용)
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
          onClick={() => onNodeClick(nodeDatum)}
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
          onClick={() => onNodeClick(nodeDatum)}
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
              onClick={() => onNodeClick(nodeDatum)}
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
            fill={isSelectedGroup ? "#28a745" : "#007bff"} // 선택된 상태면 초록색
            stroke="#fff"
            strokeWidth="1"
            style={{ cursor: "pointer" }}
            onClick={(e) => onGroupDetailClick(nodeId, e)}
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
            {isSelectedGroup ? "✓" : "i"} {/* 선택된 상태면 체크 표시 */}
          </text>
        )}
      </g>
    );
  };

  return (
    <div className="group-graph">
      <div className="graph-controls">
        <div className="control-buttons">
          <button className="control-btn expand-btn" onClick={onExpandAll}>
            전체 트리 보기
          </button>
          <button className="control-btn collapse-btn" onClick={onCollapseAll}>
            전체 트리 접기
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

      <div className="graph-container">
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
    </div>
  );
};
