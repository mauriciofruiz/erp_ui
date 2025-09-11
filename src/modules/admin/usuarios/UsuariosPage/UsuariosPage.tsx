"use client";
import { DocumentTypeEnum, PathEnum } from '@/enums';
import { useAccessDocument, useForm, useUserAsync } from '@/hooks';
import { CardLayout } from '@/modules/layout';
import { RootState } from '@/store';
import { PaginatedResponseType, UserType } from '@/types';
import { OpenInNew, Search } from '@mui/icons-material';
import { Box, Button, Grid, Tooltip } from '@mui/material';
import { GridActionsCellItem, GridColDef, GridRowId, GridRowsProp } from '@mui/x-data-grid';
import { randomId } from '@mui/x-data-grid-generator';
import React, { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { UsuariosPaginacion } from './components/UsuariosPaginacion';
import { UsuariosBusqueda } from './components/UsuariosBusqueda';

export type UsuariosPageProps = {
	// types...
}

export const UsuariosPage: React.FC<UsuariosPageProps> = ({ }) => {

	const {
		formState,
		onResetForm,
		setFormState,
		onAutocompleteChange,
	} = useForm({
		nick: null,
		status: null,
		name: null,
		identificaction: null,
		page: 0,
		pageSize: 10,
		sortDirection: null,
		sortColumn: null,
	});

	const queryClient = new QueryClient();
	const navigate = useNavigate();
	const [open, setOpen] = useState<boolean>(false);
	const [rows, setRows] = React.useState<GridRowsProp>([]);
	const { openDocument } = useAccessDocument();
	const { sucursales } = useSelector((state: RootState) => state.common);
	const { fetchMainUsers } = useUserAsync();
	const [pagination, setPagination] = useState<PaginatedResponseType>({
		limit: 0,
		list: [],
		page: 0,
		totalPages: 0,
		totalRecords: 0,
	});

	const columns: GridColDef[] = [
		{
			field: 'userId',
			headerName: 'Nro Usuario',
			headerClassName: 'super-app-theme--header',
			headerAlign: 'center',
			flex: 1,
			cellClassName: 'centered-grid',
			align: 'center',
		},
		{
			field: 'nick',
			headerName: 'Nick',
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
					<Tooltip title="Abrir Usuario">
						<GridActionsCellItem
							icon={<OpenInNew />}
							label="Abrir Usuario"
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
		const userId = rows.find((item) => item.id === id);
		openDocument({
			id: userId?.userId,
			navigation: () =>
				navigate(PathEnum.USUARIO + PathEnum.VIEW, {
					state: {
						requestId: userId?.userId,
					},
				}),
			documentType: DocumentTypeEnum.USUARIO,
		});
	};

	useEffect(() => {
		if (pagination) {
			const userList = pagination.list as UserType[];
			setRows(
				userList.map((user: UserType) => {
					return {
						id: randomId(),
						userId: user.userId,
						nick: user.nick,
						branchId: user.branchId,
						state: user.state
					};
				})
			);
		}
	}, [pagination]);

	useEffect(() => {
		const getMainPage = async () => {
			const paginacion = await fetchMainUsers(
				formState.nick,
				formState.status,
				formState.name,
				formState.identification,
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
			<UsuariosBusqueda
				open={open}
				setOpen={setOpen}
				formState={formState}
				onAutocompleteChange={onAutocompleteChange}
				setPagination={setPagination}
				onResetForm={onResetForm}
			/>
			<CardLayout
				title="Usuarios"
				positionTitle={'left'}
				headerActions={headerComponents}
			>
				<Grid container spacing={2} alignItems="center" sx={{ mt: 0.5 }}>
					<Grid item xs={12}>
						<QueryClientProvider client={queryClient}>
							<UsuariosPaginacion
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

