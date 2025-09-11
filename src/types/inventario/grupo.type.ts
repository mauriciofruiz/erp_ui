export type GrupoType = {
  groupId: number | null;
  groupName: string;
  groupCode: string;
  incomeAccountGroupId: number | null;
  inventoryAccountGroupId: number | null;
  costAccountGroupId: number | null;
};

export type SubgrupoType = {
  subgroupId: number | null;
  groupId: number | null;
  subgroupName: string;
  subgroupCode: string;
};
