import { PathEnum } from '@/enums';
import {
  HiddenInput,
  useFacturaProveedorAsync,
  useForm,
  useXmlReader,
} from '@/hooks';
import { CardLayout } from '@/modules/layout';
import {
  FacturaProveedorMainInterface,
  FacturaProveedorResponseInterface,
  PaginatedResponseType,
} from '@/types';
import { AddCircle, ImportExport, Search } from '@mui/icons-material';
import { Box, Button, Grid } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DialogoBusqueda } from './DialogoBusqueda';
import { QueryClient, QueryClientProvider } from 'react-query';
import { GridRowsProp } from '@mui/x-data-grid';
import { GridColDef } from '@mui/x-data-grid';
import { ColumnsDefinition } from './ColumnDefinition';
import { randomId } from '@mui/x-data-grid-generator';
import FacturaProveedorPaginacion from './FacturaProveedorPaginacion';

export type FacturacionProveedorPageProps = {
  // types...
};

export const FacturacionProveedorPage: React.FC<
  FacturacionProveedorPageProps
> = ({}) => {
  const navigate = useNavigate();

  const { fetchMainPage, fetchXml } = useFacturaProveedorAsync();

  const [pagination, setPagination] = useState<PaginatedResponseType>({
    limit: 0,
    list: [],
    page: 0,
    totalPages: 0,
    totalRecords: 0,
  });

  const { xmlData, setXmlData, handleXmlFile } = useXmlReader();

  const queryClient = new QueryClient();

  const [rows, setRows] = React.useState<GridRowsProp>([]);

  // * * * * * * * * * * * * PAGINACIÓN * * * * * * * * * * * *

  const [open, setOpen] = useState<boolean>(false);

  const [facturaXml, setFacturaXml] =
    useState<FacturaProveedorResponseInterface>();

  const columns: GridColDef[] = ColumnsDefinition({ rows });

  const {
    formState,
    onInputChange,
    onDateChange,
    onAutocompleteChange,
    setFormState,
  } = useForm({
    importOpeningId: null,
    stateIdList: null,
    providerId: null,
    documentNumber: null,
    branchId: null,
    userId: null,
    description: null,
    emissionDate: null,
    emissionEndDate: null,
    creationDate: null,
    creationEndDate: null,
    byCurrentMonth: true,
    page: 0,
    pageSize: 10,
    sortDirection: null,
    sortColumn: null,
  });

  useEffect(() => {
    if (pagination) {
      const facturaList = pagination.list as FacturaProveedorMainInterface[];

      setRows(
        facturaList.map((factura: FacturaProveedorMainInterface) => {
          return {
            id: randomId(),
            providerInvoiceId: factura.providerInvoiceId,
            providerInvoiceNumber: factura.providerInvoiceNumber,
            branchName: factura.branchName,
            providerName: factura.providerName,
            providerInvoiceIssueDate: factura.providerInvoiceIssueDate,
            registrationDate: factura.registrationDate,
            baseIvaZero: factura.baseIvaZero,
            baseIva: factura.baseIva,
            totalTaxes: factura.totalTaxes,
            total: factura.total,
            providerInvoiceStatusName: factura.providerInvoiceStatusName,
            userName: factura.userName,
            voucherTypeCode: factura.voucherTypeCode,
          };
        })
      );
    }
  }, [pagination]);

  useEffect(() => {
    const getMainPage = async () => {
      const paginacion = await fetchMainPage(
        formState.stateIdList,
        formState.importOpeningId,
        formState.providerId,
        formState.documentNumber,
        formState.documentType,
        formState.branchId,
        formState.userId,
        formState.description,
        formState.emissionDate,
        formState.emissionEndDate,
        formState.creationDate,
        formState.creationEndDate,
        formState.byCurrentMonth,
        formState.page,
        formState.pageSize,
        formState.sortDirection,
        formState.sortColumn
      );
      setPagination(paginacion as PaginatedResponseType);
    };
    getMainPage();
  }, []);

  const headerComponents: React.ReactNode = (
    <Box sx={{ mt: 0.5 }}>
      <Button
        variant="contained"
        color="primary"
        sx={{ mr: 1, width: '200px' }}
        startIcon={<AddCircle />}
        onClick={() => {
          navigate(PathEnum.FACTURA_PROVEEDOR + PathEnum.NEW);
        }}
      >
        Nueva Factura
      </Button>
      <Button
        variant="contained"
        color="primary"
        sx={{ mr: 1, width: '200px' }}
        startIcon={<ImportExport />}
        onClick={() => setXmlData(null)}
      >
        Importar Factura
        <HiddenInput type="file" accept=".xml" onChange={handleXmlFile} />
      </Button>
      <Button
        variant="contained"
        color="secondary"
        sx={{ width: '200px' }}
        startIcon={<Search />}
        onClick={() => setOpen(true)}
      >
        Búsqueda Avanzada
      </Button>
    </Box>
  );

  useEffect(() => {
    if (xmlData && xmlData !== null) {
      let xmlElement: any = Object.values(xmlData)[1]
        ? Object.values(xmlData)[1]
        : Object.values(xmlData)[0];

      let foundAttribute = false;

      if (Object.keys(xmlElement).length === 1) {
        while (
          xmlElement &&
          typeof xmlElement === 'object' &&
          !foundAttribute
        ) {
          for (const key in xmlElement) {
            if (Object.prototype.hasOwnProperty.call(xmlElement, key)) {
              const attribute = xmlElement[key];
              if (
                typeof attribute === 'object' &&
                Object.keys(attribute).length > 1
              ) {
                xmlElement = attribute;
                foundAttribute = true;
              } else {
                xmlElement = Object.values(xmlElement)[1]
                  ? Object.values(xmlElement)[1]
                  : Object.values(xmlElement)[0];
                foundAttribute = false;
              }
            }
          }
        }
      }
      const getXml = async () => {
        fetchXml(xmlElement).then((response) => {
          if (response) setFacturaXml(response);
        });
      };
      getXml();
    }
  }, [xmlData]);

  useEffect(() => {
    if (facturaXml) {
      navigate(PathEnum.FACTURA_PROVEEDOR + PathEnum.NEW, {
        state: { facturaXml },
      });
    }
  }, [facturaXml]);

  return (
    <>
      <DialogoBusqueda
        open={open}
        setOpen={setOpen}
        setPagination={setPagination}
        formState={formState}
        onInputChange={onInputChange}
        onDateChange={onDateChange}
        onAutocompleteChange={onAutocompleteChange}
        setFormState={setFormState}
      />
      <CardLayout
        title="FACTURACIÓN PROVEEDOR"
        positionTitle={'left'}
        headerActions={headerComponents}
      >
        <Grid container spacing={2} alignItems="center" sx={{ mt: 0.5 }}>
          <Grid item xs={12}>
            <QueryClientProvider client={queryClient}>
              <FacturaProveedorPaginacion
                columns={columns}
                rows={rows}
                setRows={setRows}
                pagination={pagination}
                setPagination={setPagination}
                formState={formState}
                setFormState={setFormState}
              />
            </QueryClientProvider>
          </Grid>
        </Grid>
      </CardLayout>
    </>
  );
};
