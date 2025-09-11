import { useCommonGeneric, useDepositosAsync, useForm } from "@/hooks";
import { DialogoBusqueda } from "./components/DialogoBusqueda";
import { ColumnDefinition } from "./components/ColumnDefinition";
import { DepositoMainType, PaginatedResponseType } from "@/types";
import { GridColDef, GridRowsProp } from "@mui/x-data-grid";
import { randomId } from "@mui/x-data-grid-generator";
import React, { useEffect } from "react";
import { useState } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { CardLayout } from "@/modules/layout";
import { PathEnum } from "@/enums";
import { Grid } from "@mui/material";
import { Paginacion } from "./components/Paginacion";

export type DepositosProps = {
  // types...
};

export const DepositosMain: React.FC<DepositosProps> = ({}) => {
  const { fetchMainPage } = useDepositosAsync();

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

  const columns: GridColDef[] = ColumnDefinition({ rows });

  const {
    formState,
    onInputChange,
    onDateChange,
    onAutocompleteChange,
    setFormState,
  } = useForm({
    depositId: null,
    documentNumber: null,
    bankId: null,
    amount: null,
    startDate: null,
    endDate: null,
    registrationStartDate: null,
    registrationEndDate: null,
    branchId: null,
    statusListIds: null,
    currentMonth: true,
    page: 0,
    pageSize: 10,
    sortDirection: null,
    sortField: null,
  });

  useEffect(() => {
    if (pagination) {
      const documentList = pagination.list as DepositoMainType[];

      if (!documentList) setRows([]);
      else {
        setRows(
          documentList.map((doc: DepositoMainType) => {
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
        formState.depositId,
        formState.documentNumber,
        formState.bankId,
        formState.amount,
        formState.startDate,
        formState.endDate,
        formState.registrationStartDate,
        formState.registrationEndDate,
        formState.branchId,
        formState.statusListIds,
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
        title="Depósitos"
        positionTitle={"left"}
        headerActions={headerComponents({
          navigatePath: PathEnum.DEPOSITOS + PathEnum.NEW,
          firstButtonName: "Nuevo Depósito",
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
