export enum AccountTypeEnum {
  ACTIVO = 1,
  PASIVO = 2,
  PATRIMONIO = 3,
  INGRESO = 4,
  COSTOS = 5,
  GASTOS = 6,
  GANANCIAS = 7,
}

export enum AccountProductosEnum {
  CUENTA_INGRESO_IVA = '4.01.01.01.001',
  CUENTA_INGRESO_SIN_IVA = '4.01.01.01.002',
  CUENTA_INVENTARIO = '1.01.03.04.001',
  CUENTA_INVENTARIO_MATERIA_PRIMA = '1.01.03.01.001',
}

interface AccountData {
  id: number;
  number: string;
  name: string;
  typeId: number;
  typeName: string;
}

export const AccountEnum: { [key: string]: AccountData } = {
  PROVEEDORES_NACIONALES_NO_RELACIONADOS: {
    id: 107,
    name: 'PROVEEDORES NACIONALES NO RELACIONADOS ',
    number: '2.01.01.01.001',
    typeId: 2,
    typeName: 'PASIVO',
  },
  ANTICIPO_PROVEEDORES_NACIONALES_NO_RELACIONADOS: {
    id: 51,
    name: 'ANTICIPO PROVEEDORES NACIONALES NO RELACIONADOS ',
    number: '1.01.02.07.001',
    typeId: 1,
    typeName: 'ACTIVO',
  },
  ANTICIPO_PROVEEDORES_EXTERIOR: {
    id: 53,
    name: 'ANTICIPO PROVEEDORES EXTERIOR',
    number: '1.01.02.07.003',
    typeId: 1,
    typeName: 'ACTIVO',
  },
};
