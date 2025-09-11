"use client";
import { useForm, useGrupoInventarioAsync } from '@/hooks';
import { CardLayout } from '@/modules/layout';
import { AccountType, GrupoType, PaginatedResponseType } from '@/types';
import { AddCircle, OpenInNew, Search } from '@mui/icons-material';
import { Box, Button, Grid, Tooltip } from '@mui/material';
import { GridActionsCellItem, GridColDef, GridRowId, GridRowsProp } from '@mui/x-data-grid';
import { randomId } from '@mui/x-data-grid-generator';
import { isEqual } from 'lodash';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { GrupoInventarioPaginacion } from './components/GrupoInventarioPaginacion';
import { GrupoInventarioBusuqeda } from './components/GrupoInventarioBusuqeda';
import { ManageGrupoInventariosPage } from '../ManageGrupoInventariosPage';

export type GrupoInventariosPageProps = {
	// types...
}

export const initialFormState: GrupoType = {
	groupId: null,
	groupName: '',
	groupCode: '',
	incomeAccountGroupId: null,
	inventoryAccountGroupId: null,
	costAccountGroupId: null
}

export const GrupoInventariosPage: React.FC<GrupoInventariosPageProps> = ({ }) => {

	const {
		formState,
		onResetForm,
		setFormState,
		onInputChange,
		onAutocompleteChange
	} = useForm({
		groupName: '',
		page: 0,
		pageSize: 10,
		sortDirection: 'DESC',
		sortColumn: 'id_grupo'
	});

	const queryClient = new QueryClient();
	const [open, setOpen] = useState<boolean>(false);
	const [openNew, setOpenNew] = useState<boolean>(false);
	const [editMode, setEditMode] = useState(false);
	const [createMode, setCreateMode] = useState(true);
	const [rows, setRows] = React.useState<GridRowsProp>([]);
	const [title, setTitle] = useState<string>('');
	const prevFormState = useRef<any | undefined>(undefined);
	const { fetchMainGrupos } = useGrupoInventarioAsync();
	const [cuentasList, setCuentasList] = useState<AccountType[]>([]);
	const [pagination, setPagination] = useState<PaginatedResponseType>({
		limit: 0,
		list: [],
		page: 0,
		totalPages: 0,
		totalRecords: 0,
	});

	const onNewGrupoInventario = () => {
		setFormState(initialFormState);
		setOpenNew(true);
		setCreateMode(true);
		setTitle('Nuevo Grupo Inventario');
		setCuentasList([]);
	};

	const thereIsChanges = useMemo(() => {
		return (
			!isEqual(prevFormState.current, formState)
		);
	}, [formState]);

	const columns: GridColDef[] = [
		{
			field: 'groupId',
			headerName: 'Nro Grupo',
			headerClassName: 'super-app-theme--header',
			headerAlign: 'center',
			flex: 1,
			cellClassName: 'centered-grid',
			align: 'center',
		},
		{
			field: 'groupName',
			headerName: 'Nombre',
			type: 'string',
			flex: 1,
			headerClassName: 'super-app-theme--header',
			headerAlign: 'center',
			sortable: false,
			align: 'center',
		},
		{
			field: 'groupCode',
			headerName: 'Nemónico',
			type: 'string',
			flex: 1,
			headerClassName: 'super-app-theme--header',
			headerAlign: 'center',
			sortable: false,
			align: 'center',
		},
		{
			field: 'incomeAccountGroupId',
			headerName: 'Cuenta Ingreso',
			headerClassName: 'super-app-theme--header',
			headerAlign: 'center',
			align: 'center',
			flex: 1,
			sortable: true
		},
		{
			field: 'inventoryAccountGroupId',
			headerName: 'Cuenta Inventario',
			align: 'center',
			headerClassName: 'super-app-theme--header',
			headerAlign: 'center',
			flex: 1,
			sortable: false
		},
		{
			field: 'costAccountGroupId',
			headerName: 'Cuenta Costo',
			align: 'center',
			headerClassName: 'super-app-theme--header',
			headerAlign: 'center',
			flex: 1,
			sortable: false
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
					<Tooltip title="Abrir Grupo Inventario">
						<GridActionsCellItem
							icon={<OpenInNew />}
							label="Abrir Grupo Inventario"
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
				onClick={() => onNewGrupoInventario()}
			>
				Nuevo Grupo Inventario
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
		const grupo = rows.find((item) => item.id === id);
		if (grupo && grupo !== null) {
			setTitle('Grupo Inventario (Modo Lectura) - N° ' + grupo.groupId);
			setOpenNew(true);
			setCreateMode(false);
			setFormState({
				groupId: grupo.groupId,
				groupName: grupo.groupName,
				groupCode: grupo.groupCode,
				incomeAccountGroupId: grupo.incomeAccountGroupId,
				inventoryAccountGroupId: grupo.inventoryAccountGroupId,
				costAccountGroupId: grupo.costAccountGroupId
			});
		}
	};

	useEffect(() => {
		if (pagination) {
			const groupList = pagination.list as GrupoType[];
			setRows(
				groupList.map((grupo: GrupoType) => {
					return {
						id: randomId(),
						groupId: grupo.groupId,
						groupName: grupo.groupName,
						groupCode: grupo.groupCode,
						incomeAccountGroupId: grupo.incomeAccountGroupId,
						inventoryAccountGroupId: grupo.inventoryAccountGroupId,
						costAccountGroupId: grupo.costAccountGroupId
					};
				})
			);
		}
	}, [pagination]);

	useEffect(() => {
		const getMainPage = async () => {
			const paginacion = await fetchMainGrupos(
				formState.groupName,
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
			<GrupoInventarioBusuqeda
				open={open}
				setOpen={setOpen}
				formState={formState}
				onInputChange={onInputChange}
				setPagination={setPagination}
				onResetForm={onResetForm}
			/>
			<ManageGrupoInventariosPage
				openNew={openNew}
				setOpenNew={setOpenNew}
				formState={formState}
				onInputChange={onInputChange}
				onResetForm={onResetForm}
				createMode={createMode}
				editMode={editMode}
				setEditMode={setEditMode}
				title={title}
				setTitle={setTitle}
				thereIsChanges={thereIsChanges}
				onAutocompleteChange={onAutocompleteChange}
				cuentasList = {cuentasList}
				setCuentasList = {setCuentasList}
			/>
			<CardLayout
				title="Grupo Inventarios"
				positionTitle={'left'}
				headerActions={headerComponents}
			>
				<Grid container spacing={2} alignItems="center" sx={{ mt: 0.5 }}>
					<Grid item xs={12}>
						<QueryClientProvider client={queryClient}>
							<GrupoInventarioPaginacion
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