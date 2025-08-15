import React from "react";
import { Group } from "../../../../types/group";
import { GroupEditableCell } from "../GroupEditableCell/GroupEditableCell";
import { GroupDetails } from "../../utils/groupUtils";
import "./GroupSidePanel.scss";

interface GroupSidePanelProps {
  selectedGroup: Group | null;
  groupDetails: { [key: number]: GroupDetails };
  departments: string[];
  teams: string[];
  onCellChange: (field: "department" | "team", value: string) => void;
  getCurrentValidation: (field: string) => boolean;
  setInvalid: (groupId: number, field: string, isInvalid: boolean) => void;
  onClose: () => void;
}

export const GroupSidePanel: React.FC<GroupSidePanelProps> = ({
  selectedGroup,
  groupDetails,
  departments,
  teams,
  onCellChange,
  getCurrentValidation,
  setInvalid,
  onClose,
}) => {
  if (!selectedGroup) return null;

  return (
    <div className="group-side-panel">
      <div className="side-panel-header">
        <h3>그룹 상세정보</h3>
        <button className="close-btn" onClick={onClose}>
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
            onChange={(value) => onCellChange("department", value)}
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
            onChange={(value) => onCellChange("team", value)}
            invalid={getCurrentValidation("team")}
            setInvalid={setInvalid}
            groupId={selectedGroup.id}
            field="team"
          />
        </div>
        <div className="info-item">
          <label>생성일:</label>
          <span>{new Date(selectedGroup.created_at).toLocaleDateString()}</span>
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
  );
};
