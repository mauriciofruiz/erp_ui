"use client";
import { DocumentTypeEnum, PathEnum } from '@/enums';
import { useAccessDocument, useForm, useRolUsuarioAsync } from '@/hooks';
import { CardLayout } from '@/modules/layout';
import { PaginatedResponseType, RoleInterface } from '@/types';
import { AddCircle, OpenInNew, Search } from '@mui/icons-material';
import { Box, Button, Grid, Tooltip } from '@mui/material';
import { GridActionsCellItem, GridColDef, GridRowId, GridRowsProp } from '@mui/x-data-grid';
import { randomId } from '@mui/x-data-grid-generator';
import React, { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { RolPaginacion } from './components/RolPaginacion';

export type RolPageProps = {
	// types...
}

export const RolPage: React.FC<RolPageProps> = ({ }) => {

	const {
		formState,
		setFormState
	} = useForm({
		page: 0,
		pageSize: 10,
		sortDirection: 'DESC',
		sortColumn: 'idRol',
	});

	const queryClient = new QueryClient();
	const navigate = useNavigate();
	//const [open, setOpen] = useState<boolean>(false);
	const [rows, setRows] = React.useState<GridRowsProp>([]);
	const { openDocument } = useAccessDocument();
	const { fetchMainPageRoles } = useRolUsuarioAsync();
	const [pagination, setPagination] = useState<PaginatedResponseType>({
		limit: 0,
		list: [],
		page: 0,
		totalPages: 0,
		totalRecords: 0,
	});

	const columns: GridColDef[] = [
		{
			field: 'roleId',
			headerName: 'Nro Rol',
			headerClassName: 'super-app-theme--header',
			headerAlign: 'center',
			flex: 1,
			cellClassName: 'centered-grid',
			align: 'center',
		},
		{
			field: 'roleName',
			headerName: 'Partida',
			type: 'string',
			flex: 1,
			headerClassName: 'super-app-theme--header',
			headerAlign: 'center',
			sortable: false,
			align: 'center',
		},
		{
			field: 'roleDescription',
			headerName: 'Proveedor',
			width: 300,
			headerClassName: 'super-app-theme--header',
			headerAlign: 'center',
			align: 'center',
			sortable: true,
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
					<Tooltip title="Abrir Lista Pedido">
						<GridActionsCellItem
							icon={<OpenInNew />}
							label="Abrir Lista Pedido"
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
					navigate(PathEnum.ROLES + PathEnum.NEW);
				}}
			>
				Nuevo Rol
			</Button>
			<Button
				variant="contained"
				color="secondary"
				sx={{ width: '200px' }}
				startIcon={<Search />}
				//onClick={() => setOpen(true)}
			>
				Buscar
			</Button>
		</Box>
	);

	const handleEditClick = (id: GridRowId) => () => {
		const rol = rows.find((item) => item.id === id);
		openDocument({
			id: rol?.roleId,
			navigation: () =>
				navigate(PathEnum.ROLES + PathEnum.VIEW, {
					state: {
						requestId: rol?.roleId,
					},
				}),
			documentType: DocumentTypeEnum.LISTA_PEDIDO,
		});
	};

	useEffect(() => {
		if (pagination) {
			const roleList = pagination.list as RoleInterface[];
			setRows(
				roleList.map((rol: RoleInterface) => {
					return {
						id: randomId(),
						roleId: rol.roleId,
						roleName: rol.roleName,
						roleDescription: rol.roleDescription,
					};
				})
			);
		}
	}, [pagination]);

	useEffect(() => {
		const getMainPage = async () => {
			const paginacion = await fetchMainPageRoles(
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
			<CardLayout
				title="Roles"
				positionTitle={'left'}
				headerActions={headerComponents}
			>
				<Grid container spacing={2} alignItems="center" sx={{ mt: 0.5 }}>
					<Grid item xs={12}>
						<QueryClientProvider client={queryClient}>
							<RolPaginacion
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
