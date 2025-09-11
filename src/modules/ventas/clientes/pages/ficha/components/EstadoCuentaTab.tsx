"use client";
import { FormState, useCommonDataGrid } from "@/hooks";
import React, { useEffect } from "react";
import { Grid } from "@mui/material";
import { TabPanel } from "@/functions";
import { GridRowsProp } from "@mui/x-data-grid";
import { CustomNoRowsOverlay, StyledDataGrid } from "@/hooks/useStyleDataGrid";
import { LabeledInputNumber } from "@/modules/layout";

type EstadoCuentaTabProps = {
  formState: FormState;
  setFormState: React.Dispatch<React.SetStateAction<FormState>>;
  createMode: boolean;
  editMode: boolean;
  tabIndex: number;
  rows: GridRowsProp;
  setRows: React.Dispatch<React.SetStateAction<GridRowsProp>>;
};

export const EstadoCuentaTab: React.FC<EstadoCuentaTabProps> = ({
  formState,
  createMode,
  editMode,
  tabIndex,
  rows,
  setRows,
}) => {
  const {
    rowModesModel,
    handleRowModesModelChange,
    handleRowEditStop,
    processRowUpdate,
    columns,
    setColumns,
  } = useCommonDataGrid(rows, setRows);

  //?**********************************TABLA FACTUAS***************************************//
  useEffect(() => {
    setColumns([
      {
        field: "invoiceNumber",
        headerName: "Nro de Factura",
        headerClassName: "super-app-theme--header",
        headerAlign: "center",
        align: "center",
        cellClassName: "centered-grid",
        flex: 1,
      },
      {
        field: "issueDateInvoice",
        headerName: "Fecha Emisión",
        headerClassName: "super-app-theme--header",
        headerAlign: "center",
        align: "center",
        cellClassName: "centered-grid",
        type: "number",
        flex: 1,
      },
      {
        field: "dueDateInvoice",
        headerName: "Fecha Vencimiento",
        headerClassName: "super-app-theme--header",
        headerAlign: "center",
        align: "center",
        cellClassName: "centered-grid",
        type: "number",
        flex: 1,
      },
      {
        field: "daysCredit",
        headerName: "Días Crédito",
        headerClassName: "super-app-theme--header",
        headerAlign: "center",
        align: "center",
        cellClassName: "centered-grid",
        type: "number",
        flex: 1,
      },
      {
        field: "daysLate",
        headerName: "Días Mora",
        headerClassName: "super-app-theme--header",
        headerAlign: "center",
        align: "center",
        cellClassName: "centered-grid",
        type: "number",
        flex: 1,
      },
      {
        field: "invoiceValue",
        headerName: "Valor Factura",
        headerClassName: "super-app-theme--header",
        headerAlign: "center",
        align: "center",
        cellClassName: "centered-grid",
        type: "number",
        flex: 1,
      },
      {
        field: "quotaValue",
        headerName: "Valor Cuota",
        headerClassName: "super-app-theme--header",
        headerAlign: "center",
        align: "center",
        cellClassName: "centered-grid",
        type: "number",
        flex: 1,
      },
      {
        field: "balanceFee",
        headerName: "Saldo Cuota",
        headerClassName: "super-app-theme--header",
        headerAlign: "center",
        align: "center",
        cellClassName: "centered-grid",
        type: "number",
        flex: 1,
      },
    ]);
  }, [rows.length]);

  return (
    <>
      <TabPanel value={tabIndex} index={5}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={4}>
            <LabeledInputNumber
              label="Saldo Pendiente"
              inputNumberProps={{
                value: formState.statementAccount?.totalInvoiceValue,
                min: 0,
                defaultValue: 0,
                controls: false,
                precision: 2,
                prefix: "$",
                readOnly: true,
              }}
            />
          </Grid>
          <Grid item xs={4}>
            <LabeledInputNumber
              label="Saldo a favor"
              inputNumberProps={{
                value: formState.statementAccount?.totalAdvances,
                min: 0,
                defaultValue: 0,
                controls: false,
                precision: 2,
                prefix: "$",
                readOnly: true,
              }}
            />
          </Grid>
          <Grid item xs={4}>
            <LabeledInputNumber
              label="Total Cartera"
              inputNumberProps={{
                value: formState.statementAccount?.totalBalanceFee,
                min: 0,
                defaultValue: 0,
                controls: false,
                precision: 2,
                prefix: "$",
                readOnly: true,
              }}
            />
          </Grid>
          <Grid item xs={4}>
            <LabeledInputNumber
              label="Total facturas vencidas"
              inputNumberProps={{
                value: formState.statementAccount?.totalOverdue,
                min: 0,
                defaultValue: 0,
                controls: false,
                precision: 2,
                prefix: "$",
                readOnly: true,
              }}
            />
          </Grid>
          <Grid item xs={4}>
            <LabeledInputNumber
              label="Total facturas vigentes"
              inputNumberProps={{
                value: formState.statementAccount?.totalCurrent,
                min: 0,
                defaultValue: 0,
                controls: false,
                precision: 2,
                prefix: "$",
                readOnly: true,
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <StyledDataGrid
              rows={rows}
              columns={columns}
              editMode={createMode || editMode ? "row" : undefined}
              rowModesModel={rowModesModel}
              onRowModesModelChange={handleRowModesModelChange}
              onRowEditStop={handleRowEditStop}
              processRowUpdate={processRowUpdate}
              getRowClassName={(params) =>
                params !== null ? `super-app-theme--null` : ""
              }
              rowHeight={30}
              columnHeaderHeight={45}
              hideFooter
              slots={{
                noRowsOverlay: CustomNoRowsOverlay,
              }}
              sx={{ height: rows.length > 0 ? "100%" : 200 }}
            />
          </Grid>
          <Grid item xs={4}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12}>
                <LabeledInputNumber
                  label="Total Vigente"
                  inputNumberProps={{
                    value: formState.statementAccount?.totalCurrent,
                    min: 0,
                    defaultValue: 0,
                    controls: false,
                    precision: 2,
                    prefix: "$",
                    readOnly: true,
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <LabeledInputNumber
                  label="Total de 1 a 30"
                  inputNumberProps={{
                    value: formState.statementAccount?.total1to30,
                    min: 0,
                    defaultValue: 0,
                    controls: false,
                    precision: 2,
                    prefix: "$",
                    readOnly: true,
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <LabeledInputNumber
                  label="Total de 31 a 60"
                  inputNumberProps={{
                    value: formState.statementAccount?.total31to60,
                    min: 0,
                    defaultValue: 0,
                    controls: false,
                    precision: 2,
                    prefix: "$",
                    readOnly: true,
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <LabeledInputNumber
                  label="Total de 61 a 90"
                  inputNumberProps={{
                    value: formState.statementAccount?.total61to90,
                    min: 0,
                    defaultValue: 0,
                    controls: false,
                    precision: 2,
                    prefix: "$",
                    readOnly: true,
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <LabeledInputNumber
                  label="Total +91"
                  inputNumberProps={{
                    value: formState.statementAccount?.total91more,
                    min: 0,
                    defaultValue: 0,
                    controls: false,
                    precision: 2,
                    prefix: "$",
                    readOnly: true,
                  }}
                />
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={4} />
          <Grid item xs={4}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} />
              <Grid item xs={12} />
              <Grid item xs={12} />
              <Grid item xs={12} />
              <Grid item xs={12} />
              <Grid item xs={12} />
              <Grid item xs={12} />
              <Grid item xs={12} />
              <Grid item xs={12} />
              <Grid item xs={12} />
              <Grid item xs={12} />
              <Grid item xs={12} />
              <Grid item xs={12} />
              <Grid item xs={12} />
            </Grid>
          </Grid>
        </Grid>
      </TabPanel>
    </>
  );
};
