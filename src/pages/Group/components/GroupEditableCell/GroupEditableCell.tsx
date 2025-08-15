import React, { useState, useEffect, useRef } from "react";
import "./GroupEditableCell.scss";

interface GroupEditableCellProps {
  value: string;
  options: string[];
  onChange: (val: string) => void;
  invalid: boolean;
  setInvalid: (groupId: number, field: string, isInvalid: boolean) => void;
  groupId: number;
  field: string;
  isModified?: boolean;
}

export const GroupEditableCell: React.FC<GroupEditableCellProps> = ({
  value,
  options,
  onChange,
  invalid,
  setInvalid,
  groupId,
  field,
  isModified = false,
}) => {
  const [editing, setEditing] = useState(false);
  const [input, setInput] = useState(
    value && value.trim() !== "" ? value : "내용없음"
  );
  const [isModifiedState, setIsModified] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setInput(value && value.trim() !== "" ? value : "내용없음");
    setIsModified(false);
  }, [value]);

  useEffect(() => {
    if (!editing) return;
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        let newValue = input && input.trim() !== "" ? input : "내용없음";
        setInput(newValue);

        if (!options.includes(newValue)) {
          setInvalid(groupId, field, true);
        } else {
          setInvalid(groupId, field, false);
        }
        onChange(newValue);
        setIsModified(true);
        setEditing(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [editing, input, options, onChange, groupId, field, setInvalid]);

  const filteredOptions = options.filter((opt) =>
    opt.toLowerCase().includes(input.toLowerCase())
  );

  const handleSelect = (option: string) => {
    setInput(option);
    setInvalid(groupId, field, false);
    onChange(option);
    setIsModified(true);
    setEditing(false);
  };

  return (
    <div ref={ref} className="group-editable-cell-container">
      {editing ? (
        <div className="editing-container">
          <input
            type="text"
            value={input === "내용없음" ? "" : input}
            autoFocus
            onChange={(e) => setInput(e.target.value)}
            onBlur={() => {
              if (!input || input.trim() === "") {
                setInput("내용없음");
                setInvalid(groupId, field, true);
                onChange("내용없음");
              }
            }}
            className={`edit-input ${invalid ? "invalid" : ""}`}
            placeholder="내용없음"
          />
          <div className="options-dropdown">
            {filteredOptions.length === 0 ? (
              <div className="no-match">일치하는 항목이 없습니다</div>
            ) : (
              filteredOptions.map((opt) => (
                <div
                  key={opt}
                  className="option-item"
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
          className={`group-editable-cell ${invalid ? "invalid" : ""} ${
            !invalid && isModifiedState ? "modified" : ""
          }`}
          onClick={() => setEditing(true)}
          title="클릭하여 편집"
        >
          {invalid ? input : value && value.trim() !== "" ? value : "내용없음"}
        </span>
      )}
    </div>
  );
};
