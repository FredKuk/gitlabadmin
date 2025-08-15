export interface Group {
  id: number;
  name: string;
  path: string;
  full_name: string;
  full_path: string;
  created_at: string;
  parent_id: number | null;
  web_url: string;
}

export interface Project {
  id: number;
  name: string;
  name_with_namespace: string;
  path: string;
  path_with_namespace: string;
  created_at: string;
  default_branch: string;
  web_url: string;
  namespace: {
    id: number;
    name: string;
    path: string;
    kind: string;
    full_path: string;
    parent_id: number;
  };
  shared_with_groups: Array<{
    group_id: number;
    group_name: string;
    group_full_path: string;
    group_access_level: number;
    expires_at: string | null;
  }>;
}

export interface TreeNode {
  type: "group" | "project";
  data: Group | Project;
  children: TreeNode[];
  level: number;
}
