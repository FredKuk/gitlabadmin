import React, { useState } from "react";

interface EditableCellProps {
  value: string;
  onSave: (value: string) => void;
  type?: "text" | "email" | "number";
}

export const EditableCell: React.FC<EditableCellProps> = ({
  value,
  onSave,
  type = "text",
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentValue, setCurrentValue] = useState(value);

  const handleSave = () => {
    onSave(currentValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setCurrentValue(value);
    setIsEditing(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
        <input
          type={type}
          value={currentValue}
          onChange={(e) => setCurrentValue(e.target.value)}
          onKeyDown={handleKeyPress}
          onBlur={handleSave}
          autoFocus
          style={{
            padding: "2px 4px",
            border: "1px solid #ccc",
            borderRadius: "3px",
            fontSize: "14px",
          }}
        />
      </div>
    );
  }

  return (
    <span
      onClick={() => setIsEditing(true)}
      style={{
        cursor: "pointer",
        padding: "2px 4px",
        borderRadius: "3px",
        backgroundColor: "transparent",
        border: "1px solid transparent",
      }}
      title="클릭하여 편집"
    >
      {value || "클릭하여 입력"}
    </span>
  );
};
