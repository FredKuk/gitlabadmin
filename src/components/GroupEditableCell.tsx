import React, { useState, useEffect, useRef } from "react";

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
        console.log(newValue);
        setInput(newValue);

        // "내용없음"이거나 옵션에 없는 값이면 무조건 invalid
        if (!options.includes(newValue)) {
          console.log(groupId, field, newValue, "invalid");
          setInvalid(groupId, field, true);
        } else {
          console.log(groupId, field, newValue, "valid");
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
    <div ref={ref} style={{ minWidth: 120, width: "100%" }}>
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
                setInvalid(groupId, field, true);
                onChange("내용없음");
              }
            }}
            style={{
              marginBottom: 4,
              padding: "6px 8px",
              borderRadius: 4,
              border: invalid ? "1.5px solid #e74c3c" : "1px solid #dee2e6",
              background: "#fff",
              color: invalid ? "#e74c3c" : "#495057",
              width: "100%",
              fontSize: "14px",
            }}
            placeholder="내용없음"
          />
          <div
            style={{
              background: "#fff",
              border: "1px solid #dee2e6",
              maxHeight: 120,
              overflowY: "auto",
              borderRadius: 4,
              marginTop: 2,
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
          >
            {filteredOptions.length === 0 ? (
              <div style={{ color: "#6c757d", padding: 6, fontSize: "12px" }}>
                일치하는 항목이 없습니다
              </div>
            ) : (
              filteredOptions.map((opt) => (
                <div
                  key={opt}
                  style={{
                    padding: "6px 10px",
                    cursor: "pointer",
                    color: "#495057",
                    fontSize: "14px",
                    borderBottom: "1px solid #f8f9fa",
                  }}
                  onMouseDown={() => handleSelect(opt)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#f8f9fa";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  {opt}
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        <span
          className={[
            "group-editable-cell",
            invalid ? "invalid" : "",
            !invalid && isModifiedState ? "modified" : "",
          ].join(" ")}
          onClick={() => setEditing(true)}
          style={{
            cursor: "pointer",
            padding: "8px",
            backgroundColor: invalid
              ? "#fee"
              : isModifiedState
              ? "#e8f5e8"
              : "white",
            border: "1px solid #dee2e6",
            borderRadius: "4px",
            display: "block",
            color: invalid ? "#e74c3c" : "#495057",
            fontSize: "14px",
            minHeight: "20px",
            transition: "all 0.2s ease",
          }}
          title="클릭하여 편집"
        >
          {invalid ? input : value && value.trim() !== "" ? value : "내용없음"}
        </span>
      )}
    </div>
  );
};
