"use client";
import { DocumentTypeEnum, PathEnum } from '@/enums';
import { useAccessDocument, useForm, useSucursalAsync } from '@/hooks';
import { CardLayout } from '@/modules/layout';
import { PaginatedResponseType, SucursalType } from '@/types';
import { AddCircle, OpenInNew, Search } from '@mui/icons-material';
import { Box, Button, Grid, Tooltip } from '@mui/material';
import { GridActionsCellItem, GridColDef, GridRowId, GridRowsProp } from '@mui/x-data-grid';
import { randomId } from '@mui/x-data-grid-generator';
import React, { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { SucursalPaginacion } from './components/SucursalPaginacion';
import { SucursalBusqueda } from './components/SucursalBusqueda';

export type SucursalPageProps = {
	// types...
}

export const SucursalPage: React.FC<SucursalPageProps> = ({ }) => {
	const {
		formState,
		onResetForm,
		setFormState,
		onAutocompleteChange,
		onInputChange
	} = useForm({
		cityId: null,
		regionId: null,
		categoryBranchId: null,
		name: null,
		mnemonic: null,
		isOutlets: false,
		isActive: false,
		page: 0,
		pageSize: 10,
		sortDirection: 'DESC',
		sortColumn: 'id_sucursal',
	});

	const queryClient = new QueryClient();
	const navigate = useNavigate();
	const [open, setOpen] = useState<boolean>(false);
	const [rows, setRows] = React.useState<GridRowsProp>([]);
	const { openDocument } = useAccessDocument();
	const { fetchMainSucursales } = useSucursalAsync();
	const [pagination, setPagination] = useState<PaginatedResponseType>({
		limit: 0,
		list: [],
		page: 0,
		totalPages: 0,
		totalRecords: 0,
	});

	const columns: GridColDef[] = [
		{
			field: 'branchId',
			headerName: 'Nro Sucursal',
			headerClassName: 'super-app-theme--header',
			headerAlign: 'center',
			width: 20,
			cellClassName: 'centered-grid',
			align: 'center',
		},
		{
			field: 'name',
			headerName: 'Nombre',
			type: 'string',
			flex: 1,
			headerClassName: 'super-app-theme--header',
			headerAlign: 'center',
			sortable: false,
			align: 'center',
		},
		{
			field: 'responsible',
			headerName: 'Responsable',
			headerClassName: 'super-app-theme--header',
			headerAlign: 'center',
			align: 'center',
			flex: 1,
		},
		{
			field: 'address',
			headerName: 'Dirección',
			headerClassName: 'super-app-theme--header',
			headerAlign: 'center',
			align: 'center',
			flex: 1,
		},
		{
			field: 'cellphone',
			headerName: 'Celular',
			headerClassName: 'super-app-theme--header',
			headerAlign: 'center',
			align: 'center',
			flex: 1,
		},
		{
			field: 'email',
			headerName: 'Email',
			headerClassName: 'super-app-theme--header',
			headerAlign: 'center',
			align: 'center',
			flex: 1,
		},
		{
			field: 'state',
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
					<Tooltip title="Abrir Sucursal">
						<GridActionsCellItem
							icon={<OpenInNew />}
							label="Abrir Sucursal"
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
					navigate(PathEnum.SUCURSAL + PathEnum.NEW);
				}}
			>
				Nueva Sucursal
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
		const sucursal = rows.find((item) => item.id === id);
		openDocument({
			id: sucursal?.branchId,
			navigation: () =>
				navigate(PathEnum.SUCURSAL + PathEnum.VIEW, {
					state: {
						requestId: sucursal?.branchId,
					},
				}),
			documentType: DocumentTypeEnum.SUCURSAL,
		});
	};

	useEffect(() => {
		if (pagination) {
			const sucursalList = pagination.list as SucursalType[];
			setRows(
				sucursalList.map((sucursal: SucursalType) => {
					return {
						id: randomId(),
						branchId: sucursal.branchId,
						name: sucursal.name,
						responsible: sucursal.responsible,
						address: sucursal.address,
						cellphone: sucursal.cellphone,
						email: sucursal.email,
						state: sucursal.state
					};
				})
			);
		}
	}, [pagination]);

	useEffect(() => {
		const getMainPage = async () => {
			const paginacion = await fetchMainSucursales(
				formState.cityId,
				formState.regionId,
				formState.categoryBranchId,
				formState.name,
				formState.mnemonic,
				formState.isOutlets,
				formState.isActive,
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
			<SucursalBusqueda
				open={open}
				setOpen={setOpen}
				formState={formState}
				setFormState = {setFormState}
				onAutocompleteChange={onAutocompleteChange}
				setPagination={setPagination}
				onResetForm={onResetForm}
				onInputChange={onInputChange}
			/>
			<CardLayout
				title="Sucursales"
				positionTitle={'left'}
				headerActions={headerComponents}
			>
				<Grid container spacing={2} alignItems="center" sx={{ mt: 0.5 }}>
					<Grid item xs={12}>
						<QueryClientProvider client={queryClient}>
							<SucursalPaginacion
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
