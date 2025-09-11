import { useCommonGeneric, useForm, useNotaDebitoCAsync } from "@/hooks";
import { NotaDebitoClienteMain, PaginatedResponseType } from "@/types";
import { GridColDef, GridRowsProp } from "@mui/x-data-grid";
import React, { useEffect } from "react";
import { useState } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { ColumnsDefinition } from "./components/ColumnDefinition";
import { randomId } from "@mui/x-data-grid-generator";
import { DialogoBusqueda } from "./components/DialogoBusqueda";
import { CardLayout } from "@/modules/layout";
import { Grid } from "@mui/material";
import { Paginacion } from "./components/Paginacion";
import { PathEnum } from "@/enums";

export type NotaDebitoMainProps = {
  // types...
};

export const NotaDebitoCMain: React.FC<NotaDebitoMainProps> = ({}) => {
  const { fetchMainPage } = useNotaDebitoCAsync();

  const [pagination, setPagination] = useState<PaginatedResponseType>({
    limit: 0,
    list: [],
    page: 0,
    totalPages: 0,
    totalRecords: 0,
  });

  const queryClient = new QueryClient();

  const [rows, setRows] = React.useState<GridRowsProp>([]);

  const { headerComponents } = useCommonGeneric();

  // * * * * * * * * * * * * PAGINACIÓN * * * * * * * * * * * *

  const [open, setOpen] = useState<boolean>(false);

  const columns: GridColDef[] = ColumnsDefinition({ rows });

  const {
    formState,
    onInputChange,
    onDateChange,
    onAutocompleteChange,
    setFormState,
  } = useForm({
    documentStatusId: null,
    clientId: null,
    documentNumber: null,
    invoiceNumber: null,
    branchId: null,
    ndTypeId: null,
    startDate: null,
    endDate: null,
    currentMonth: true,
    page: 0,
    pageSize: 10,
    sortDirection: null,
    sortField: null,
  });

  useEffect(() => {
    if (pagination) {
      const documentList = pagination.list as NotaDebitoClienteMain[];

      if (!documentList) setRows([]);
      else {
        setRows(
          documentList.map((doc: NotaDebitoClienteMain) => {
            return {
              id: randomId(),
              ...doc,
            };
          })
        );
      }
    }
  }, [pagination]);

  useEffect(() => {
    const getMainPage = async () => {
      const paginacion = await fetchMainPage(
        formState.documentStatusId,
        formState.clientId,
        formState.documentNumber,
        formState.invoiceNumber,
        formState.branchId,
        formState.ncTypeId,
        formState.startDate,
        formState.endDate,
        formState.currentMonth,
        formState.page,
        formState.pageSize,
        formState.sortDirection,
        formState.sortField
      );
      setPagination(paginacion as PaginatedResponseType);
    };
    getMainPage();
  }, []);

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
        title="Notas De Débito"
        positionTitle={"left"}
        headerActions={headerComponents({
          navigatePath: PathEnum.NOTA_DEBITO_CLIENTE + PathEnum.NEW,
          firstButtonName: "Nueva ND",
          setOpen: setOpen,
        })}>
        <Grid container spacing={2} alignItems="center" sx={{ mt: 0.5 }}>
          <Grid item xs={12}>
            <QueryClientProvider client={queryClient}>
              <Paginacion
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
