import { setCurrencyNumber } from "@/functions";
import { FormState, useCommonDataGrid } from "@/hooks";
import { AutocompleteEditAccountCell } from "@/modules/contabilidad/Pagos/pages/components/CustomCells";
import { RootState } from "@/store";
import { GridActionsCellItem, GridRowsProp } from "@mui/x-data-grid";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { InputValueFunction } from "../../../notacredito/NotaCreditoManage/components/CustomCells";
import { Grid, Tooltip } from "@mui/material";
import { CustomNoRowsOverlay, StyledDataGrid } from "@/hooks/useStyleDataGrid";
import { ParametersEnum } from "@/enums";
import { NotaDebitoToolBar } from "./NotaDebitoToolBar";
import { NotaDebitoFooter } from "./NotaDebitoFooter";
import { Delete } from "@mui/icons-material";

export type NotaDebitoDetailsProps = {
  formState: FormState;
  setFormState: React.Dispatch<React.SetStateAction<FormState>>;
  createMode: boolean;
  editMode: boolean;
  rows: GridRowsProp;
  setRows: React.Dispatch<React.SetStateAction<GridRowsProp>>;
};

export const NotaDebitoDetails: React.FC<NotaDebitoDetailsProps> = ({
  formState,
  setFormState,
  createMode,
  editMode,
  rows,
  setRows,
}) => {
  const { sucursales } = useSelector((state: RootState) => state.common);

  const {
    rowModesModel,
    handleRowModesModelChange,
    handleRowEditStop,
    processRowUpdate,
    columns,
    setColumns,
    handleDeleteClick,
  } = useCommonDataGrid(rows, setRows);

  useEffect(() => {
    setColumns([
      {
        field: "accountNumber",
        headerName: "Código Cuenta",
        headerClassName: "super-app-theme--header",
        headerAlign: "center",
        align: "center",
        minWidth: 50,
        flex: 1,
        editable: false,
      },
      {
        field: "accountName",
        headerName: "Cuenta",
        type: "string",
        minWidth: 300,
        flex: 2,
        headerClassName: "super-app-theme--header",
        headerAlign: "center",
        align: "center",
        editable: true,
        renderEditCell: (params) => {
          return (
            <AutocompleteEditAccountCell params={params} setRows={setRows} />
          );
        },
      },
      {
        field: "branchId",
        headerName: "Sucursal",
        headerClassName: "super-app-theme--header",
        headerAlign: "center",
        align: "center",
        minWidth: 70,
        flex: 1,
        type: "singleSelect",
        valueOptions: sucursales.map((sucursal) => ({
          value: sucursal.branchId,
          label: sucursal.name,
        })),
        renderCell: (params) => {
          const sucursal = sucursales.find(
            (sucursal) => sucursal.branchId === params.row.branchId
          );

          return sucursal ? sucursal.name : "Sin Sucursal";
        },
      },
      {
        field: "unitPrice",
        headerName: "Valor ND",
        headerClassName: "super-app-theme--header",
        headerAlign: "center",
        align: "right",
        minWidth: 50,
        flex: 0.8,
        type: "number",
        sortable: false,
        disableColumnMenu: true,
        valueFormatter: (params) => setCurrencyNumber(params.value as number),
        editable: true,
        renderEditCell: (params) => {
          return <InputValueFunction params={params} setRows={setRows} />;
        },
      },
      {
        field: "actions",
        type: "actions",
        headerName: "Acciones",
        align: "center",
        headerClassName: "super-app-theme--header",
        headerAlign: "center",
        flex: 0.5,
        cellClassName: "actions",
        renderCell: ( params ) => {
          if (params.row.detailId == null) {
            return [
              <Tooltip title="Borrar">
                <GridActionsCellItem
                  icon={<Delete />}
                  label="Borrar"
                  onClick={handleDeleteClick(params.row.id)}
                  color="inherit"
                />
              </Tooltip>,
            ];
          }
        },
      }
    ]);

  }, [rows.length]);

  return (
    <Grid item xs={12}>
      <StyledDataGrid
        rows={rows}
        columns={columns}
        editMode={createMode || editMode ? "cell" : undefined}
        rowModesModel={rowModesModel}
        onRowModesModelChange={handleRowModesModelChange}
        onRowEditStop={handleRowEditStop}
        getRowClassName={(params) =>
          params.id === ParametersEnum.ID_ROW_TOTAL
            ? `super-app-theme--true`
            : "super-app-theme--null"
        }
        processRowUpdate={processRowUpdate}
        getRowHeight={() => "auto"}
        columnHeaderHeight={45}
        sx={{ height: rows.length > 0 ? "100%" : 300 }}
        slots={{
          noRowsOverlay: CustomNoRowsOverlay,
          toolbar: NotaDebitoToolBar,
          footer: NotaDebitoFooter,
        }}
        slotProps={{
          toolbar: {
            setRows,
            createMode,
            formState,
          },
          footer: {
            rows,
            setRows,
            formState,
            setFormState,
            createMode,
          },
        }}
      />
    </Grid>
  );
};
