import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import {
  DepartmentType,
  GrupoType,
  PositionType,
  ProjectType,
  RoleInterface,
  SubgrupoType,
  SucursalType,
  TaxRateInterface,
} from '@/types';

export type CommonState = {
  positions: PositionType[];
  departments: DepartmentType[];
  sucursales: SucursalType[];
  grupos: GrupoType[];
  subgrupos: SubgrupoType[];
  impuestos: TaxRateInterface[];
  roles: RoleInterface[];
  projects: ProjectType[];
};

const initialState: CommonState = {
  positions: [],
  sucursales: [],
  departments: [],
  grupos: [],
  subgrupos: [],
  impuestos: [],
  roles: [],
  projects: [],
};

export const commonSlice = createSlice({
  name: 'common',
  initialState,
  reducers: {
    setPositions: (
      state: CommonState,
      action: PayloadAction<PositionType[]>
    ) => {
      state.positions = action.payload;
    },
    setSucursales: (
      state: CommonState,
      action: PayloadAction<SucursalType[]>
    ) => {
      state.sucursales = action.payload;
    },
    setDepartments: (
      state: CommonState,
      action: PayloadAction<DepartmentType[]>
    ) => {
      state.departments = action.payload;
    },
    setGrupos: (state: CommonState, action: PayloadAction<GrupoType[]>) => {
      state.grupos = action.payload;
    },
    setSubgrupos: (
      state: CommonState,
      action: PayloadAction<SubgrupoType[]>
    ) => {
      state.subgrupos = action.payload;
    },
    setImpuestos: (
      state: CommonState,
      action: PayloadAction<TaxRateInterface[]>
    ) => {
      state.impuestos = action.payload;
    },
    setRoles: (state: CommonState, action: PayloadAction<RoleInterface[]>) => {
      state.roles = action.payload;
    },
    setProjects: (state: CommonState, action: PayloadAction<ProjectType[]>) => {
      state.projects = action.payload;
    },
  },
});

export const {
  setPositions,
  setDepartments,
  setSucursales,
  setGrupos,
  setSubgrupos,
  setImpuestos,
  setRoles,
  setProjects,
} = commonSlice.actions;
