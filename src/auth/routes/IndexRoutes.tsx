import { IndexPage } from '@/auth';
import { removeAccents } from '@/functions';
import {
  AsientoViewPage,
  FacturacionProveedorPage,
  FichaProductoPage,
  FichaProveedorPage,
  KardexViewPage,
  ListaMaterialesPage,
  ManageFacturacionProveedorPage,
  ManageMaterialesPage,
  ManageOrdenCompraPage,
  ManageOrdenPedidoPage,
  ManageOrdenProduccionPage,
  ManageProductoPage,
  ManageProveedorPage,
  ManageRecepcionCompraPage,
  ManageSolicitudComprasPage,
  ManageTransferenciaPage,
  MenuPage,
  MenuUsuarioPage,
  OrdenCompraPage,
  OrdenPedidoPage,
  OrdenProduccionPage,
  PlanCuentasPage,
  RecepcionCompraPage,
  ReportesCompras,
  SolicitudCompraPage,
  TipoIngresoPage,
  TransferenciaPage,
  AperturaImportacionPage,
  ListaPedidoPage,
  ManageAperturaImportacionPage,
  ManageListaPedidoPage,
  ManageOrdenCompraExterior,
  RetencionProveedorPage,
  ManageRetencionProveedor,
  ListaEmpaquePage,
  ManageListaEmpaque,
  LiquidacionPage,
  ManageLiquidacion,
  NotaCreditoPage,
  FichaClientePage,
  ManageClientePage,
  ManageNotaCreditoPage,
  PagosPage,
  UsuariosPage,
  ManageUsuariosPage,
  AsientosPage,
  RolPage,
  ManageRolPage,
  ManagePago,
  SesionPage,
  SucursalPage,
  ManageSucuralPage,
  CategoriaClientesPage,
  ManageCategoriaClientesPage,
  GrupoInventariosPage,
  ManageGrupoInventariosPage,
  CajasRecaudadorasPage,
  ManageCajaRecaudadorasPage,
  SubgrupoPage,
  FormasPagoPage,
  FacturacionVentaPage,
  ManageFacturaVentas,
  AutorizacionesSriPage,
  PeriodoContablePage,
  DocumentosAutorizadosPage,
  CuentasBancariasPage,
  ManageCuentasBancariasPage,
  CatalogoBancosPage,
  GuiaRemisionMain,
  CierreCajaMain,
  CierreCajaManage,
  CuentasPorPagarPage,
  GuiaRemisionManage,
  NotaCreditoMain,
  NotaCreditoManage,
  CobrosClientesMain,
  CobrosClientesManage,
  NotaDebitoCMain,
  NotaDebitoManage,
  RetencionManage,
  RetencionMain,
  CierreProduccion,
  EgresoCajaMain,
  CuentasPorCobrarPage,
  KardexDespachoViewPage,
  DepositosMain,
  DepositoManage,
  DepositosTarjetaMain,
} from '@/modules';
import { RootState } from '@/store/types';
import { MenuType } from '@/types';
import { DesktopLayout, Layout } from '@/ui';
import { AnimatePresence } from 'framer-motion';
import { Suspense, lazy, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Route, Routes } from 'react-router-dom';
interface ModuleInterface {
  [key: string]: React.FC<any>;
}

// ? Cada vez que se cree una nueva página debe ser agregada en este mapeo
const componentMap: ModuleInterface = {
  aperturaimportacion: AperturaImportacionPage,
  aperturaimportacionnew: ManageAperturaImportacionPage,
  aperturaimportacionview: ManageAperturaImportacionPage,
  asiento: AsientosPage,
  asientoview: AsientoViewPage,
  autorizacionessri: AutorizacionesSriPage,
  cajasrecaudadoras: CajasRecaudadorasPage,
  cajasrecaudadorasnew: ManageCajaRecaudadorasPage,
  cajasrecaudadorasview: ManageCajaRecaudadorasPage,
  catalogobancos: CatalogoBancosPage,
  categoriaclientes: CategoriaClientesPage,
  categoriaclientesnew: ManageCategoriaClientesPage,
  categoriaclientesview: ManageCategoriaClientesPage,
  cuentabancarianew: ManageCuentasBancariasPage,
  cuentabancariaview: ManageCuentasBancariasPage,
  cuentasbancarias: CuentasBancariasPage,
  documentosautorizados: DocumentosAutorizadosPage,
  facturacionpdv: FacturacionVentaPage,
  facturacionpdvnew: ManageFacturaVentas,
  facturacionpdvview: ManageFacturaVentas,
  facturacionproveedor: FacturacionProveedorPage,
  facturacionproveedornew: ManageFacturacionProveedorPage,
  facturacionproveedorview: ManageFacturacionProveedorPage,
  fichaclientes: FichaClientePage,
  fichaclientesnew: ManageClientePage,
  fichaclientesview: ManageClientePage,
  fichaproducto: FichaProductoPage,
  fichaproductonew: ManageProductoPage,
  fichaproductoview: ManageProductoPage,
  fichaproveedor: FichaProveedorPage,
  fichaproveedornew: ManageProveedorPage,
  fichaproveedorview: ManageProveedorPage,
  formasdepago: FormasPagoPage,
  grupoinventarios: GrupoInventariosPage,
  grupoinventariosnew: ManageGrupoInventariosPage,
  grupoinventariosview: ManageGrupoInventariosPage,
  guiaremision: GuiaRemisionMain,
  guiaremisionnew: GuiaRemisionManage,
  guiaremisionview: GuiaRemisionManage,
  kardex: KardexViewPage,
  liquidacion: LiquidacionPage,
  liquidacionnew: ManageLiquidacion,
  liquidacionview: ManageLiquidacion,
  listademateriales: ListaMaterialesPage,
  listaempaque: ListaEmpaquePage,
  listaempaquenew: ManageListaEmpaque,
  listaempaqueview: ManageListaEmpaque,
  listamaterialesnew: ManageMaterialesPage,
  listamaterialesview: ManageMaterialesPage,
  listapedido: ListaPedidoPage,
  listapedidonew: ManageListaPedidoPage,
  listapedidoview: ManageListaPedidoPage,
  manejocaja: CierreCajaMain,
  manejocajanew: CierreCajaManage,
  manejocajaview: CierreCajaManage,
  menu: MenuPage,
  menuusuario: MenuUsuarioPage,
  notacreditonew: ManageNotaCreditoPage,
  notacreditoview: ManageNotaCreditoPage,
  notasdecreditodebito: NotaCreditoPage,
  ordencompra: () => OrdenCompraPage({ isForeign: false }),
  ordencompraexterior: () => OrdenCompraPage({ isForeign: true }),
  ordencompraexteriornew: ManageOrdenCompraExterior,
  ordencompraexteriorview: ManageOrdenCompraExterior,
  ordencompranew: ManageOrdenCompraPage,
  ordencompraview: ManageOrdenCompraPage,
  ordendepedido: OrdenPedidoPage,
  ordendepedidonew: ManageOrdenPedidoPage,
  ordendepedidoview: ManageOrdenPedidoPage,
  ordendeproduccion: OrdenProduccionPage,
  ordendeproduccionnew: ManageOrdenProduccionPage,
  ordendeproduccionview: ManageOrdenProduccionPage,
  pagos: PagosPage,
  pagosnew: ManagePago,
  pagosview: ManagePago,
  periodocontable: PeriodoContablePage,
  plancuentas: PlanCuentasPage,
  recepcioncompra: RecepcionCompraPage,
  recepcioncompranew: ManageRecepcionCompraPage,
  recepcioncompraview: ManageRecepcionCompraPage,
  consultasreportes: ReportesCompras,
  retenciones: RetencionProveedorPage,
  retencionesview: ManageRetencionProveedor,
  roles: RolPage,
  rolesnew: ManageRolPage,
  rolesview: ManageRolPage,
  sesion: SesionPage,
  solicitudcompra: SolicitudCompraPage,
  solicitudcompranew: ManageSolicitudComprasPage,
  solicitudcompraview: ManageSolicitudComprasPage,
  subgrupo: SubgrupoPage,
  sucursales: SucursalPage,
  sucursalnew: ManageSucuralPage,
  sucursalview: ManageSucuralPage,
  tipoingreso: TipoIngresoPage,
  transferencia: TransferenciaPage,
  transferencianew: ManageTransferenciaPage,
  transferenciaview: ManageTransferenciaPage,
  usuarios: UsuariosPage,
  usuariosnew: ManageUsuariosPage,
  usuariosview: ManageUsuariosPage,
  cuentasporpagar: CuentasPorPagarPage,
  notacreditocliente: NotaCreditoMain,
  notacreditoclientenew: NotaCreditoManage,
  notacreditoclienteview: NotaCreditoManage,
  cobrosclientes: CobrosClientesMain,
  cobrosclientesview: CobrosClientesManage,
  notadebitocliente: NotaDebitoCMain,
  notadebitoclientenew: NotaDebitoManage,
  notadebitoclienteview: NotaDebitoManage,
  retencionclientes: RetencionMain,
  retencionclientesnew: RetencionManage,
  retencionclientesview: RetencionManage,
  cierreproduccion: CierreProduccion,
  egresocaja: EgresoCajaMain,
  cuentasporcobrar: CuentasPorCobrarPage,
  kardexdespacho: KardexDespachoViewPage,
  depositos: DepositosMain,
  depositosnew: DepositoManage,
  depositosview: DepositoManage,
  depositostarjeta : DepositosTarjetaMain
};
export const IndexRoutes = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  const routes = useMemo(() => {
    return user?.menuList.map((menu: MenuType) => {
      if (!menu.menuState) return null;

      if (menu.menuComponent.includes('Menu')) {
        const Component = DesktopLayout;
        const LazyComponent = lazy(() =>
          Promise.resolve({ default: Component })
        );
        return (
          <Route
            key={menu.menuId}
            path={menu.menuUrl}
            element={
              <Suspense fallback={<div>Loading...</div>}>
                <LazyComponentWrapper component={LazyComponent} />
              </Suspense>
            }
          />
        );
      } else {
        const menuNameWithoutAccentsAndSpaces = removeAccents(menu.menuName)
          .replace(/\s/g, '')
          .toLowerCase();
        const Component = componentMap[menuNameWithoutAccentsAndSpaces];
        if (!Component) return null;

        const LazyComponent = lazy(() =>
          Promise.resolve({ default: Component })
        );
        return (
          <Route
            key={menu.menuId}
            path={menu.menuUrl}
            element={
              <Suspense fallback={<div>Loading...</div>}>
                <LazyComponentWrapper component={LazyComponent} />
              </Suspense>
            }
          />
        );
      }
    });
  }, [user?.menuList]); // Dependencia: user?.menuList

  return (
    <Layout>
      <Routes>
        <Route
          path="/"
          element={
            <AnimatePresence mode="wait">
              <IndexPage />
            </AnimatePresence>
          }
        />
        {routes}
        <Route
          path="/*"
          element={
            <AnimatePresence mode="wait">
              <Navigate to="/" />
            </AnimatePresence>
          }
        />
      </Routes>
    </Layout>
  );
};

interface LazyComponentWrapperProps {
  component: React.ComponentType<any>;
}

const LazyComponentWrapper: React.FC<LazyComponentWrapperProps> = ({
  component: Component,
}) => {
  return <Component />;
};
