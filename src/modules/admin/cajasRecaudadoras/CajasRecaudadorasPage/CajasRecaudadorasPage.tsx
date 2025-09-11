"use client";
import { DocumentTypeEnum, PathEnum } from '@/enums';
import { useAccessDocument, useCajaAsync, useForm } from '@/hooks';
import { CardLayout } from '@/modules/layout';
import { RootState } from '@/store';
import { CajaGetType, PaginatedResponseType } from '@/types';
import { AddCircle, OpenInNew, Search } from '@mui/icons-material';
import { Box, Button, Grid, Tooltip } from '@mui/material';
import { GridActionsCellItem, GridColDef, GridRowId, GridRowsProp } from '@mui/x-data-grid';
import { randomId } from '@mui/x-data-grid-generator';
import React, { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { CajasRecaudadorasPaginacion } from './components/CajasRecaudadorasPaginacion';
import { CajasRecaudadorasBusqueda } from './components/CajasRecaudadorasBusqueda';

export type CajasRecaudadorasPageProps = {
	// types...
}

export const CajasRecaudadorasPage: React.FC<CajasRecaudadorasPageProps> = ({ }) => {

	const {
		formState,
		onResetForm,
		setFormState,
		onInputChange,
		onAutocompleteChange
	} = useForm({
		branchId: null,
		name: '',
		page: 0,
		pageSize: 10,
		sortDirection: 'DESC',
		sortColumn: 'idCaja'
	});

	const queryClient = new QueryClient();
	const navigate = useNavigate();
	const [open, setOpen] = useState<boolean>(false);
	const [rows, setRows] = React.useState<GridRowsProp>([]);
	const { openDocument } = useAccessDocument();
	const { fetchMainCajas } = useCajaAsync();
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
			field: 'cashBoxId',
			headerName: 'Nro Caja',
			headerClassName: 'super-app-theme--header',
			headerAlign: 'center',
			flex: 1,
			cellClassName: 'centered-grid',
			align: 'center',
		},
		{
			field: 'cashBoxName',
			headerName: 'Nombre',
			type: 'string',
			flex: 1,
			headerClassName: 'super-app-theme--header',
			headerAlign: 'center',
			sortable: false,
			align: 'center',
		},
		{
			field: 'branchId',
			headerName: 'Sucursal',
			headerClassName: 'super-app-theme--header',
			headerAlign: 'center',
			align: 'center',
			flex: 1,
			sortable: true,
			valueFormatter: (params) => {
				const branchId = params.value;
				const branchName = branchId
					? sucursales.find((item) => item.branchId === branchId)?.name
					: '';
				return branchName;
			},
		},
		{
			field: 'cashBoxState',
			headerName: 'Estado',
			align: 'center',
			headerClassName: 'super-app-theme--header',
			headerAlign: 'center',
			flex: 1,
			sortable: false,
			valueFormatter: (params) => {
				const stateUser = params.value
				const stateName = stateUser === true ? 'ACTIVO' : 'INACTIVO';
				return stateName;
			}
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
					<Tooltip title="Abrir Caja">
						<GridActionsCellItem
							icon={<OpenInNew />}
							label="Abrir Caja"
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
				color="primary"
				sx={{ mr: 1, width: '200px' }}
				startIcon={<AddCircle />}
				onClick={() => {
					navigate(PathEnum.CAJA + PathEnum.NEW);
				}}
			>
				Nueva Caja
			</Button>
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
		const caja = rows.find((item) => item.id === id);
		openDocument({
			id: caja?.cashBoxId,
			navigation: () =>
				navigate(PathEnum.CAJA + PathEnum.VIEW, {
					state: {
						requestId: caja?.cashBoxId,
					},
				}),
			documentType: DocumentTypeEnum.CAJA,
		});
	};

	useEffect(() => {
		if (pagination) {
			const cajaList = pagination.list as CajaGetType[];
			setRows(
				cajaList.map((caja: CajaGetType) => {
					return {
						id: randomId(),
						cashBoxId: caja.cashBoxId,
						branchId: caja.branchId,
						cashBoxName: caja.cashBoxName,
						cashBoxState: caja.cashBoxState
					};
				})
			);
		}
	}, [pagination]);

	useEffect(() => {
		const getMainPage = async () => {
			const paginacion = await fetchMainCajas(
				formState.branchId,
				formState.name,
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
			<CajasRecaudadorasBusqueda
				open={open}
				setOpen={setOpen}
				formState={formState}
				onAutocompleteChange={onAutocompleteChange}
				setPagination={setPagination}
				onResetForm={onResetForm}
				onInputChange = {onInputChange}
				sucursales={sucursales}
			/>
			<CardLayout
				title="Cajas Recaudadoras"
				positionTitle={'left'}
				headerActions={headerComponents}
			>
				<Grid container spacing={2} alignItems="center" sx={{ mt: 0.5 }}>
					<Grid item xs={12}>
						<QueryClientProvider client={queryClient}>
							<CajasRecaudadorasPaginacion
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
