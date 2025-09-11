"use client";
import { AsientoEnum, PathEnum } from '@/enums';
import { setCurrencyNumber } from '@/functions';
import { FormState, useAsientoAsync, useForm } from '@/hooks';
import { CardLayout } from '@/modules/layout';
import { RootState } from '@/store';
import { EntryType, PaginatedResponseType } from '@/types';
import { OpenInNew, Search } from '@mui/icons-material';
import { Box, Button, Grid, SelectChangeEvent, Tooltip } from '@mui/material';
import { GridActionsCellItem, GridColDef, GridRowId, GridRowsProp } from '@mui/x-data-grid';
import { randomId } from '@mui/x-data-grid-generator';
import format from 'date-fns/format';
import React, { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { useSelector } from 'react-redux';
import { AsientoBusqueda } from './components/AsientoBusqueda';
import { AsientosPaginacion } from './components/AsientosPaginacion';

export type AsientosProps = {
	// types...
}

export const AsientosPage: React.FC<AsientosProps> = ({ }) => {
	const {
		onInputChange,
		formState,
		onResetForm,
		setFormState,
		onDateChange,
		onAutocompleteChange,
	} = useForm({
		branchId: null,
		isAutomatic: null,
		startDate: null,
		endDate: null,
		movement: null,
		state: null,
		byCurrentMonth: null,
		page: 0,
		pageSize: 10,
		sortDirection: 'DESC',
		sortColumn: 'creationDate',
	});

	const queryClient = new QueryClient();
	const [open, setOpen] = useState<boolean>(false);
	const [rows, setRows] = React.useState<GridRowsProp>([]);
	const { fetchMainAsiento } = useAsientoAsync();
	const { sucursales } = useSelector((state: RootState) => state.common);
	const [pagination, setPagination] = useState<PaginatedResponseType>({
		limit: 0,
		list: [],
		page: 0,
		totalPages: 0,
		totalRecords: 0,
	});

	const columns: GridColDef[] = [
		{
			field: 'entryId',
			headerName: 'Nro Asiento',
			headerClassName: 'super-app-theme--header',
			headerAlign: 'center',
			flex: 1,
			cellClassName: 'centered-grid',
			align: 'center',
		},
		{
			field: 'branchName',
			headerName: 'Sucursal',
			flex: 1,
			headerClassName: 'super-app-theme--header',
			headerAlign: 'center',
			align: 'center',
			sortable: true,
		},
		{
			field: 'movementType',
			headerName: 'Tipo Movimiento',
			type: 'string',
			flex: 1,
			headerClassName: 'super-app-theme--header',
			headerAlign: 'center',
			sortable: false,
			align: 'center',
		},
		{
			field: 'entryType',
			headerName: 'Tipo',
			type: 'string',
			flex: 1,
			headerClassName: 'super-app-theme--header',
			headerAlign: 'center',
			sortable: false,
			align: 'center',
		},
		{
			field: 'entryDate',
			headerName: 'Fecha',
			headerClassName: 'super-app-theme--header',
			headerAlign: 'center',
			align: 'center',
			flex: 1,
			sortable: true,
			valueFormatter: (params) => {
				const rawDate = params.value;
				const formattedDate = rawDate
					? format(new Date(rawDate), 'dd/MM/yyyy')
					: '';
				return formattedDate;
			},
		},
		{
			field: 'accountingDate',
			headerName: 'Fecha Contable',
			headerClassName: 'super-app-theme--header',
			headerAlign: 'center',
			align: 'center',
			flex: 1,
			sortable: true,
			valueFormatter: (params) => {
				const rawDate = params.value;
				const formattedDate = rawDate
					? format(new Date(rawDate), 'dd/MM/yyyy')
					: '';
				return formattedDate;
			},
		},
		{
			field: 'totalDebit',
			headerName: 'Total Debito',
			width: 100,
			headerClassName: 'super-app-theme--header',
			headerAlign: 'center',
			align: 'center',
			sortable: true,
			valueFormatter: (params) =>
				params.value === undefined ? setCurrencyNumber(0.00) : setCurrencyNumber(Number(params.value)),
		},
		{
			field: 'totalAssets',
			headerName: 'Total Activo',
			width: 100,
			headerClassName: 'super-app-theme--header',
			headerAlign: 'center',
			align: 'center',
			sortable: true,
			valueFormatter: (params) =>
				params.value === undefined ? setCurrencyNumber(0.00) : setCurrencyNumber(Number(params.value)),
		},
		{
			field: 'entryState',
			headerName: 'Estado',
			align: 'center',
			headerClassName: 'super-app-theme--header',
			headerAlign: 'center',
			flex: 1,
			sortable: false,
			valueFormatter: (params) => {
				const state = params.value;
				const stateName = state === AsientoEnum.CONFIRMADO
					? 'NO CONFIRMADO'
					: 'CONFIRMADO';
				return stateName;
			},
		},
		{
			field: 'actions',
			type: 'actions',
			headerName: 'Acciones',
			align: 'center',
			headerClassName: 'super-app-theme--header',
			headerAlign: 'center',
			flex: 1,
			cellClassName: 'actions',
			getActions: ({ id }) => {
				return [
					<Tooltip title="Abrir Asiento">
						<GridActionsCellItem
							icon={<OpenInNew />}
							label="Abrir Asiento"
							className="textPrimary"
							onClick={handleEditClick(id)}
							color="inherit"
						/>
					</Tooltip>,
				];
			},
		},
	];

	const headerComponents: React.ReactNode = (
		<Box sx={{ mt: 0.5 }}>
			<Button
				variant="contained"
				color="secondary"
				sx={{ width: '200px' }}
				startIcon={<Search />}
				onClick={() => setOpen(true)}
			>
				Buscar
			</Button>
		</Box>
	);

	const handleEditClick = (id: GridRowId) => () => {
		const asiento = rows.find((item) => item.id === id);
		const newTab = window.open(
			PathEnum.ASIENTO + '/view' + `/${asiento?.entryId}`, 
			'_blank'
		);
		if (newTab) {
			newTab.focus();
		}
	};

	const handleOnSelect = (event: SelectChangeEvent<any>) => {
		setFormState((prevState: FormState) => ({
			...prevState,
			[event.target.name]: event.target.value,
		}));
	};

	useEffect(() => {
		if (pagination) {
			const asiento = pagination.list as EntryType[];
			setRows(
				asiento.map((asiento: EntryType) => {
					return {
						id: randomId(),
						entryId: asiento.entryId,
						branchName: asiento.branchName,
						movementType: asiento.movementType,
						entryType: asiento.entryType,
						entryDate: asiento.entryDate,
						accountingDate: asiento.accountingDate,
						totalDebit: asiento.totalDebit,
						totalAssets: asiento.totalAssets,
						entryState: asiento.entryState,
					};
				})
			);
		}
	}, [pagination]);

	useEffect(() => {
		const getMainPage = async () => {
			const paginacion = await fetchMainAsiento(
				formState.branchId,
				formState.isAutomatic,
				formState.movement,
				formState.state,
				formState.startDate,
				formState.endDate,
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

	return (
		<>
			<AsientoBusqueda
				open={open}
				setOpen={setOpen}
				formState={formState}
				onDateChange={onDateChange}
				onAutocompleteChange={onAutocompleteChange}
				onInputChange={onInputChange}
				handleOnSelect={handleOnSelect}
				setPagination={setPagination}
				onResetForm={onResetForm}
				sucursales={sucursales}
			/>
			<CardLayout
				title="Asientos"
				positionTitle={'left'}
				headerActions={headerComponents}
			>
				<Grid container spacing={2} alignItems="center" sx={{ mt: 0.5 }}>
					<Grid item xs={12}>
						<QueryClientProvider client={queryClient}>
							<AsientosPaginacion
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


