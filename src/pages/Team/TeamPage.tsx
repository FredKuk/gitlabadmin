import React, { useMemo, useState } from "react";
import { useGroupData } from "../Group/hooks/useGroupData";
import "./TeamPage.scss";

// JSON 구조에 맞춘 타입
type DeptTeamRef = { id: number };
type Dept = {
  id: number;
  name: string;
  description?: string;
  has_teams?: DeptTeamRef[];
};

type TeamGroupRef = { id: number; name: string; full_path?: string; web_url?: string };
type Team = {
  id: number;
  name: string;
  description?: string;
  department_id?: number;
  has_groups?: TeamGroupRef[];
};

export const TeamPage: React.FC = () => {
  const { departments, teams } = useGroupData();

  // 팀 id → 팀 객체 맵
  const teamById = useMemo(() => {
    const map = new Map<number, Team>();
    (teams as unknown as Team[]).forEach((t) => map.set(t.id, t));
    return map;
  }, [teams]);

  // 좌측: 부서/팀 (department.has_teams 기준)
  const [expandedDepts, setExpandedDepts] = useState<Set<number>>(new Set());
  const expandAllDepts = () => {
    const all = new Set<number>();
    (departments as unknown as Dept[]).forEach((d) => all.add(d.id));
    setExpandedDepts(all);
  };
  const collapseAllDepts = () => setExpandedDepts(new Set());
  const toggleDept = (id: number) => {
    const next = new Set(expandedDepts);
    next.has(id) ? next.delete(id) : next.add(id);
    setExpandedDepts(next);
  };

  // 우측: 사업(팀) / 팀의 has_groups 표시
  const [expandedBiz, setExpandedBiz] = useState<Set<number>>(new Set());
  const expandAllBiz = () => {
    const all = new Set<number>();
    (teams as unknown as Team[]).forEach((t) => {
      const has = Array.isArray(t.has_groups) && t.has_groups.length > 0;
      if (has) all.add(t.id);
    });
    setExpandedBiz(all);
  };
  const collapseAllBiz = () => setExpandedBiz(new Set());
  const toggleBiz = (teamId: number, hasGroups: boolean) => {
    if (!hasGroups) return;
    const next = new Set(expandedBiz);
    next.has(teamId) ? next.delete(teamId) : next.add(teamId);
    setExpandedBiz(next);
  };

  const handleCreate = (where: "dept" | "biz") => {
    console.log(`create clicked: ${where}`);
    alert(`${where === "dept" ? "부서" : "사업(팀)"} 생성하기는 추후 구현`);
  };

  return (
    <div className="teampage">
      {/* 좌측: 부서/팀 */}
      <div className="panel">
        <div className="panel-header">부서/팀</div>
        <div className="panel-controls">
          <button className="btn green" onClick={expandAllDepts}>전체리스트보기</button>
          <button className="btn red" onClick={collapseAllDepts}>전체리스트접기</button>
          <button className="btn blue" onClick={() => handleCreate("dept")}>생성하기</button>
        </div>
        <div className="panel-content">
          {(departments as unknown as Dept[]).map((dept) => {
            const isOpen = expandedDepts.has(dept.id);
            const teamRefs = dept.has_teams || [];
            const childTeams = teamRefs
              .map((r) => teamById.get(r.id))
              .filter(Boolean) as Team[];

            return (
              <div key={dept.id} className="row">
                <button
                  className={`chip dept ${isOpen ? "open" : ""}`}
                  onClick={() => toggleDept(dept.id)}
                >
                  {dept.name}
                </button>

                {isOpen && childTeams.length > 0 && (
                  <div className="children">
                    {childTeams.map((t) => (
                      <span key={t.id} className="chip team">
                        {t.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="divider" />

      {/* 우측: 사업(팀) → 클릭 시 has_groups 펼침 */}
      <div className="panel">
        <div className="panel-header">사업</div>
        <div className="panel-controls">
          <button className="btn green" onClick={expandAllBiz}>전체리스트보기</button>
          <button className="btn red" onClick={collapseAllBiz}>전체리스트접기</button>
          <button className="btn blue" onClick={() => handleCreate("biz")}>생성하기</button>
        </div>
        <div className="panel-content">
          {(teams as unknown as Team[]).map((t) => {
            const isOpen = expandedBiz.has(t.id);
            const groups = t.has_groups || [];
            const hasGroups = Array.isArray(groups) && groups.length > 0;

            return (
              <div key={t.id} className="row">
                <button
                  className={`chip project ${isOpen ? "open" : ""}`}
                  onClick={() => toggleBiz(t.id, hasGroups)}
                  title={hasGroups ? "클릭하여 펼치기/접기" : "연결된 그룹 없음"}
                >
                  {t.name}
                </button>

                {isOpen && hasGroups && (
                  <div className="children">
                    {groups.map((g) => (
                      <span key={g.id} className="chip shared" title={g.full_path || ""}>
                        {g.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};