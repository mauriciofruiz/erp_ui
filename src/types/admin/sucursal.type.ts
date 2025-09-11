import { BodegaGetInterface } from "../inventario";

export type SucursalType = {
  address: string;
  branchCategoryId: string;
  branchId: number | null;
  cellphone: string;
  cityId: number | null;
  email: string;
  email2: string;
  isOutlet: boolean;
  nemonic: string;
  name: string;
  phone: string;
  phone2: string;
  regionId: number | null;
  responsible: string;
  state: boolean;
  thermalPrinting: boolean;
  branchCode: string;
};

export type SucursalPostType = {
  address: string;
  branchCategoryId: string;
  branchId: number | null;
  cellphone: string;
  cityId: number | null;
  email: string;
  email2: string;
  isOutlet: boolean;
  mnemonic: string;
  name: string;
  phone: string;
  phone2: string;
  regionId: number | null;
  responsible: string;
  state: boolean;
  thermalPrinting: boolean;
  branchCode: string;
  wareHouseDetail: BodegaGetInterface[]
};

