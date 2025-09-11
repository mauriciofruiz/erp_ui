import { ModuloEnum } from "@/enums";
import { FormState, StyledDatePicker, usePeriodosAsync, useStyles } from "@/hooks";
import { PaperComponent } from "@/modules/layout";
import { PaginatedResponseType, PeriodInterface } from "@/types";
import { Search } from "@mui/icons-material";
import { Box, Button, Dialog, DialogContent, DialogTitle, Grid } from "@mui/material";
import { GridColDef, GridRowsProp } from "@mui/x-data-grid";
import { randomId } from "@mui/x-data-grid-generator";
import format from "date-fns/format";
import React, { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { PeriodoDetallePaginacion } from "./PeriodoDetallePaginacion";

export type PeriodoDetalleProps = {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    formState: FormState
    setFormState: React.Dispatch<React.SetStateAction<FormState>>;
    onResetForm: () => void;
    onDateChange: (value: Date, name: string) => void
    title: string
    modulos: {
        label: string;
        value: ModuloEnum;
    }[]
}

export const PeriodoDetalle: React.FC<PeriodoDetalleProps> = ({
    open,
    setOpen,
    formState,
    // onResetForm,
    onDateChange,
    setFormState,
    title,
    modulos
}) => {

    const styles = useStyles();
    const queryClient = new QueryClient();
    const [rowsDetail, setRowsDetail] = React.useState<GridRowsProp>([]);
    const { fetchDetallePeriodo } = usePeriodosAsync();
    const [pagination, setPagination] = useState<PaginatedResponseType>({
        limit: 0,
        list: [],
        page: 0,
        totalPages: 0,
        totalRecords: 0,
    });

    const columns: GridColDef[] = [
        {
            field: 'moduleId',
            headerName: 'Módulo',
            headerClassName: 'super-app-theme--header',
            headerAlign: 'center',
            flex: 1,
            cellClassName: 'centered-grid',
            align: 'center',
            valueFormatter: (params) => {
                const idModulo = params.value;
                const moduloName = idModulo ? modulos.find(a => a.value === idModulo)?.label : '';
                return moduloName;
            },
        },
        {
            field: 'closingPeriodDate',
            headerName: 'Fecha Cierre Periódo',
            headerClassName: 'super-app-theme--header',
            headerAlign: 'center',
            align: 'center',
            flex: 1,
            sortable: true,
            valueFormatter: (params) => {
                const rawDate = params.value;
                const formattedDate = rawDate ? format(new Date(rawDate), 'dd/MM/yyyy') : '';
                return formattedDate;
            },
        },
        {
            field: 'previousPeriodDate',
            headerName: 'Fecha Previa',
            headerClassName: 'super-app-theme--header',
            headerAlign: 'center',
            align: 'center',
            flex: 1,
            sortable: true,
            valueFormatter: (params) => {
                const rawDate = params.value;
                const formattedDate = rawDate ? format(new Date(rawDate), 'dd/MM/yyyy') : '';
                return formattedDate;
            },
        }
    ];

    const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const getResult = async () => {
            const paginacion = await fetchDetallePeriodo(
                formState.moduleId,
                formState.startDate !== null ? format(formState.startDate, 'dd/MM/yyyy') : null,
                formState.endDate !== null ? format(formState.startDate, 'dd/MM/yyyy') : null,
                formState.page,
                formState.pageSize,
                formState.sortDirection,
                formState.sortColumn
            );
            setPagination(paginacion as PaginatedResponseType);
        };
        getResult();
        //onResetForm();
        //setOpen(false);
    };


    const headerComponents: React.ReactNode = (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <form onSubmit={onSubmit}>
                <Grid container spacing={2} alignItems="center" sx={{ mt: 1 }}>
                    <Grid item xs={5}>
                        <StyledDatePicker
                            label="Fecha Inicio"
                            views={['year', 'month', 'day']}
                            format="dd/MM/yyyy"
                            maxDate={formState.endDate}
                            value={formState.startDate !== null ? formState.startDate : null}
                            onChange={(value) => onDateChange(value as Date, 'startDate')}
                            slotProps={{
                                textField: {
                                    className: styles.genericFieldStyle,
                                    sx: {
                                        minWidth: '100%',
                                    },
                                    InputProps: {
                                        className: styles.textWhiteStyle,
                                    },
                                    InputLabelProps: {
                                        className: styles.textGreenStyle,
                                        shrink: formState.startDate ? true : false,
                                    },
                                },
                            }}
                        />
                    </Grid>
                    <Grid item xs={5}>
                        <StyledDatePicker
                            label="Fecha Fin"
                            views={['year', 'month', 'day']}
                            format="dd/MM/yyyy"
                            maxDate={new Date()}
                            value={formState.endDate !== null ? formState.endDate : null}
                            onChange={(value) => onDateChange(value as Date, 'endDate')}
                            slotProps={{
                                textField: {
                                    className: styles.genericFieldStyle,
                                    sx: {
                                        minWidth: '100%',
                                    },
                                    InputProps: {
                                        className: styles.textWhiteStyle,
                                    },
                                    InputLabelProps: {
                                        className: styles.textGreenStyle,
                                        shrink: formState.endDate ? true : false,
                                    },
                                },
                            }}
                        />
                    </Grid>
                    <Grid item xs={2}>
                        <Button
                            variant="contained"
                            color="secondary"
                            sx={{ width: '150px' }}
                            startIcon={<Search />}
                            type="submit"
                        >
                            Buscar
                        </Button>
                    </Grid>
                </Grid>
            </form>
        </Box>
    );

    useEffect(() => {
        if (pagination) {
            const periodoList = pagination.list as PeriodInterface[];
            setRowsDetail(
                periodoList.map((periodo: PeriodInterface) => {
                    return {
                        id: randomId(),
                        moduleId: periodo.moduleId,
                        periodId: periodo.periodId,
                        closingPeriodDate: periodo.closingPeriodDate,
                        previousPeriodDate: periodo.previousPeriodDate,
                    };
                })
            );
        }
    }, [pagination]);

    useEffect(() => {
        const getMainPage = async () => {
            const paginacion = await fetchDetallePeriodo(
                formState.moduleId,
                formState.startDate ,
                formState.endDate ,
                formState.page,
                formState.pageSize,
                formState.sortDirection,
                formState.sortColumn
            );
            setPagination(paginacion as PaginatedResponseType);
        };
        getMainPage();
    }, []);

    return (
        <>
            <Dialog
                open={open}
                onClose={() => setOpen(false)}
                PaperComponent={PaperComponent}
                aria-labelledby="draggable-dialog-title"
                maxWidth="lg"
                fullWidth
            >
                <DialogContent>
                    <DialogTitle
                        style={{
                            cursor: 'move',
                            textAlign: 'center',
                        }}
                        id="draggable-dialog-title"
                        sx={{ mt: 2 }}
                    >
                        {title}
                    </DialogTitle>
                    {headerComponents}
                    <Grid container spacing={2} alignItems="center" sx={{ mt: 0.5 }}>
                        <Grid item xs={12}>
                            <QueryClientProvider client={queryClient}>
                                {/* <form onSubmit={onSubmit}> */}
                                <PeriodoDetallePaginacion
                                    columns={columns}
                                    rows={rowsDetail}
                                    setRows={setRowsDetail}
                                    pagination={pagination}
                                    setPagination={setPagination}
                                    formState={formState}
                                    setFormState={setFormState}
                                />
                                {/* </form> */}
                            </QueryClientProvider>
                        </Grid>
                    </Grid>
                </DialogContent>
            </Dialog>
        </>
    )
}
