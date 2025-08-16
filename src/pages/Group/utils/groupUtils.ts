import { Group, Project } from "../../../types/group";

// 권한그룹인지 확인하는 함수
export const isPermissionGroup = (groupName: string): boolean => {
  const name = groupName.includes("/")
    ? groupName.split("/").pop() || groupName
    : groupName;
  return ["alarm", "architect", "developer", "inspector"].includes(
    name.toLowerCase()
  );
};

// 노드 색상 반환 함수
export const getNodeColor = (nodeName: string, nodeType: string): string => {
  if (nodeType === "project") {
    return "#f1c40f"; // 노란색
  }

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

// 특별한 그룹인지 확인
export const isSpecialGroup = (nodeName: string): boolean => {
  const groupName = nodeName.includes("/")
    ? nodeName.split("/").pop() || nodeName
    : nodeName;

  return ["architect", "inspector", "developer", "alarm"].includes(
    groupName.toLowerCase()
  );
};

// 리스트 아이템 인터페이스
export interface ListItem {
  id: number | string;
  name: string;
  type: "group" | "project" | "shared_group";
  level: number;
  full_path: string;
  children: ListItem[];
  isSharedGroup?: boolean;
  hasSharedGroups?: boolean;
}

// D3 트리 노드 인터페이스
export interface D3TreeNode {
  name: string;
  attributes?: {
    id: number;
    type: "group" | "project";
    full_path?: string;
    isSharedGroup?: boolean;
    isVirtualRoot?: boolean;
  };
  children?: D3TreeNode[];
}

// 그룹 상세 정보 인터페이스
export interface GroupDetails {
  department: string;
  team: string;
}

// 유효성 검사 상태 인터페이스
export interface ValidationState {
  [groupId: number]: {
    [field: string]: boolean;
  };
}

// 트리 데이터 구축 함수
export const buildTreeData = (
  groupsData: Group[],
  projectsData: Project[],
  expandedNodes: Set<number>,
  expandedProjects: Set<number>,
  showFullTree: boolean,
  showPermissionGroups: boolean
): D3TreeNode[] => {
  const rootGroups = groupsData.filter((group) => group.parent_id === null);

  const buildChildren = (groupId: number): D3TreeNode[] => {
    if (!showFullTree && !expandedNodes.has(groupId)) {
      return [];
    }

    const children: D3TreeNode[] = [];
    const childGroups = groupsData.filter(
      (group) => group.parent_id === groupId
    );

    childGroups.forEach((group) => {
      if (!showPermissionGroups && isPermissionGroup(group.name)) {
        return;
      }

      children.push({
        name: group.name,
        attributes: {
          id: group.id,
          type: "group",
          full_path: group.full_path,
        },
        children: buildChildren(group.id),
      });
    });

    const childProjects = projectsData.filter(
      (project) => project.namespace.id === groupId
    );
    childProjects.forEach((project) => {
      const projectChildren: D3TreeNode[] = [];

      if (
        project.shared_with_groups &&
        project.shared_with_groups.length > 0 &&
        (showFullTree || expandedProjects.has(project.id))
      ) {
        project.shared_with_groups.forEach((sharedGroup, index) => {
          if (
            !showPermissionGroups &&
            isPermissionGroup(sharedGroup.group_full_path)
          ) {
            return;
          }

          projectChildren.push({
            name: sharedGroup.group_full_path,
            attributes: {
              id: -(project.id * 1000 + index),
              type: "group",
              full_path: sharedGroup.group_full_path,
              isSharedGroup: true,
            },
          });
        });
      }

      const projectNode: D3TreeNode = {
        name: project.name,
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

  let tree: D3TreeNode[];

  if (rootGroups.length === 1) {
    tree = [
      {
        name: rootGroups[0].name,
        attributes: {
          id: rootGroups[0].id,
          type: "group",
          full_path: rootGroups[0].full_path,
        },
        children: buildChildren(rootGroups[0].id),
      },
    ];
  } else if (rootGroups.length > 1) {
    tree = [
      {
        name: "ROOT",
        attributes: {
          id: -999,
          type: "group",
          full_path: "root",
          isVirtualRoot: true,
        },
        children: rootGroups.map((rootGroup) => ({
          name: rootGroup.name,
          attributes: {
            id: rootGroup.id,
            type: "group",
            full_path: rootGroup.full_path,
          },
          children: buildChildren(rootGroup.id),
        })),
      },
    ];
  } else {
    tree = [];
  }

  return tree;
};

// 리스트 데이터 구축 함수
export function buildListData(
  groups: Group[],
  projects: Project[],
  showPermissionGroups: boolean
): ListItem[] {
  const permissionGroupNames = ["alarm", "architect", "developer", "inspector"];

  // 그룹별 하위 그룹과 프로젝트를 저장할 맵
  const groupChildrenMap = new Map<number, { groups: Group[]; projects: Project[] }>();

  // 모든 그룹 초기화
  groups.forEach((group) => {
    groupChildrenMap.set(group.id, { groups: [], projects: [] });
  });

  // 하위 그룹 매핑
  groups.forEach((group) => {
    if (group.parent_id) {
      const parentData = groupChildrenMap.get(group.parent_id);
      if (parentData) {
        parentData.groups.push(group);
      }
    }
  });

  // 프로젝트를 올바른 그룹에 매핑
  projects.forEach((project) => {
    if (project.namespace?.id) {
      const groupData = groupChildrenMap.get(project.namespace.id);
      if (groupData) {
        groupData.projects.push(project);
      }
    }
  });

  // 프로젝트를 ListItem으로 변환
  function projectToListItem(project: Project, level: number): ListItem {
    const children: ListItem[] = [];

    // shared_with_groups를 하위 노드로 추가 (권한그룹보기 체크 시에만)
    if (showPermissionGroups && project.shared_with_groups && Array.isArray(project.shared_with_groups)) {
      project.shared_with_groups.forEach((sharedGroup) => {
        children.push({
          id: `project-${project.id}-shared-${sharedGroup.group_id}`,
          name: sharedGroup.group_name,
          type: "shared_group",
          level: level + 1,
          full_path: sharedGroup.group_full_path,
          children: [],
          isSharedGroup: true,
        });
      });
    }

    return {
      id: project.id,
      name: project.name,
      type: "project",
      level,
      full_path: project.path_with_namespace,
      children,
      hasSharedGroups: project.shared_with_groups && project.shared_with_groups.length > 0,
    };
  }

  // 그룹을 ListItem으로 변환
  function groupToListItem(group: Group, level: number): ListItem | null {
    // 권한그룹은 showPermissionGroups가 false면 필터링
    if (
      permissionGroupNames.includes(group.name) &&
      !showPermissionGroups
    ) {
      return null;
    }

    const children: ListItem[] = [];
    const groupData = groupChildrenMap.get(group.id);

    if (groupData) {
      // 하위 그룹 추가
      groupData.groups.forEach((subgroup) => {
        const childItem = groupToListItem(subgroup, level + 1);
        if (childItem) {
          children.push(childItem);
        }
      });

      // 그룹의 직접 프로젝트 추가
      groupData.projects.forEach((project) => {
        children.push(projectToListItem(project, level + 1));
      });
    }

    return {
      id: group.id,
      name: group.name,
      type: "group",
      level,
      full_path: group.full_path,
      children,
      isSharedGroup: false,
    };
  }

  // 최상위 그룹들 처리 (parent_id가 null인 그룹들)
  const topLevelGroups = groups.filter((group) => !group.parent_id);
  const result: ListItem[] = [];

  topLevelGroups.forEach((group) => {
    const item = groupToListItem(group, 0);
    if (item) {
      result.push(item);
    }
  });

  return result;
}

// 리스트에서 모든 그룹 ID를 재귀적으로 수집하는 함수
export const getAllGroupIdsFromList = (items: ListItem[]): Set<number> => {
  const allIds = new Set<number>();

  const collectIds = (items: ListItem[]) => {
    items.forEach((item) => {
      if (item.type === "group" && !item.isSharedGroup && typeof item.id === "number") {
        allIds.add(item.id);
      }
      if (item.children && item.children.length > 0) {
        collectIds(item.children);
      }
    });
  };

  collectIds(items);
  return allIds;
};

// 리스트 데이터에서 프로젝트 ID들을 수집하는 함수
export const getAllProjectIdsFromList = (items: ListItem[]): Set<number> => {
  const allIds = new Set<number>();

  const collectIds = (items: ListItem[]) => {
    items.forEach((item) => {
          if (item.type === "project" && typeof item.id === "number") {
            allIds.add(item.id);
          }
          if (item.children && item.children.length > 0) {
            collectIds(item.children);
          }
        });
  };

  collectIds(items);
  return allIds;
};
