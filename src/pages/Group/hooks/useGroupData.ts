import { useState, useEffect } from "react";
import { Group, Project } from "../../../types/group";
import groupsData from "../../../mock/groups_minimal.json";
import projectsData from "../../../mock/project_minimal.json";
import departmentsData from "../../../mock/departments.json";
import teamsData from "../../../mock/teams.json";
import { GroupDetails, ValidationState } from "../utils/groupUtils";

export const useGroupData = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [teams, setTeams] = useState<string[]>([]);
  const [groupDetails, setGroupDetails] = useState<{
    [key: number]: GroupDetails;
  }>({});
  const [validationState, setValidationState] = useState<ValidationState>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = () => {
      try {
        setGroups(groupsData as Group[]);
        setProjects(projectsData as Project[]);
        setDepartments(departmentsData as string[]);
        setTeams(teamsData as string[]);

        const initialDetails: { [key: number]: GroupDetails } = {};
        const initialValidation: ValidationState = {};

        (groupsData as Group[]).forEach((group) => {
          initialDetails[group.id] = {
            department: "개발부서",
            team: "프론트엔드팀",
          };

          initialValidation[group.id] = {
            department: false,
            team: false,
          };
        });

        setGroupDetails(initialDetails);
        setValidationState(initialValidation);
        setIsLoading(false);
      } catch (error) {
        console.error("Error loading data:", error);
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const updateGroupDetails = (
    groupId: number,
    field: "department" | "team",
    value: string
  ) => {
    setGroupDetails((prev) => ({
      ...prev,
      [groupId]: {
        ...prev[groupId],
        [field]: value,
      },
    }));
  };

  const setInvalid = (groupId: number, field: string, isInvalid: boolean) => {
    setValidationState((prev) => ({
      ...prev,
      [groupId]: {
        ...prev[groupId],
        [field]: isInvalid,
      },
    }));
  };

  const getCurrentValidation = (groupId: number, field: string): boolean => {
    return validationState[groupId]?.[field] || false;
  };

  return {
    groups,
    projects,
    departments,
    teams,
    groupDetails,
    validationState,
    isLoading,
    updateGroupDetails,
    setInvalid,
    getCurrentValidation,
  };
};
