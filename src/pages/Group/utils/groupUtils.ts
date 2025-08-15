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
  id: number;
  name: string;
  type: "group" | "project";
  full_path: string;
  level: number;
  parent_id?: number | null;
  children?: ListItem[];
  isSharedGroup?: boolean;
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
export const buildListData = (
  groupsData: Group[],
  projectsData: Project[],
  showPermissionGroups: boolean
): ListItem[] => {
  const rootGroups = groupsData.filter((group) => group.parent_id === null);

  const buildListChildren = (parentId: number, level: number): ListItem[] => {
    const items: ListItem[] = [];

    const childGroups = groupsData.filter(
      (group) => group.parent_id === parentId
    );
    childGroups.forEach((group) => {
      if (!showPermissionGroups && isPermissionGroup(group.name)) {
        return;
      }

      const groupItem: ListItem = {
        id: group.id,
        name: group.name,
        type: "group",
        full_path: group.full_path,
        level: level,
        parent_id: group.parent_id,
        children: buildListChildren(group.id, level + 1),
      };

      items.push(groupItem);
    });

    const childProjects = projectsData.filter(
      (project) => project.namespace.id === parentId
    );
    childProjects.forEach((project) => {
      const projectItem: ListItem = {
        id: project.id,
        name: project.name,
        type: "project",
        full_path: project.path_with_namespace,
        level: level,
        children: [],
      };

      items.push(projectItem);

      if (project.shared_with_groups && project.shared_with_groups.length > 0) {
        project.shared_with_groups.forEach((sharedGroup, index) => {
          if (
            !showPermissionGroups &&
            isPermissionGroup(sharedGroup.group_full_path)
          ) {
            return;
          }

          const sharedItem: ListItem = {
            id: -(project.id * 1000 + index),
            name: sharedGroup.group_full_path,
            type: "group",
            full_path: sharedGroup.group_full_path,
            level: level + 1,
            isSharedGroup: true,
          };

          projectItem.children?.push(sharedItem);
        });
      }
    });

    return items;
  };

  const listItems: ListItem[] = rootGroups.map((rootGroup) => ({
    id: rootGroup.id,
    name: rootGroup.name,
    type: "group" as const,
    full_path: rootGroup.full_path,
    level: 0,
    parent_id: rootGroup.parent_id,
    children: buildListChildren(rootGroup.id, 1),
  }));

  return listItems;
};
