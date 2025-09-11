"use client";
import { setCurrencyNumber } from '@/functions';
import { useCategoriaClienteAsync, useForm } from '@/hooks';
import { CardLayout } from '@/modules/layout';
import { ClientCategoryType, PaginatedResponseType } from '@/types';
import { AddCircle, OpenInNew, Search } from '@mui/icons-material';
import { Box, Button, Grid, Tooltip } from '@mui/material';
import { GridActionsCellItem, GridColDef, GridRowId, GridRowsProp } from '@mui/x-data-grid';
import { randomId } from '@mui/x-data-grid-generator';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ManageCategoriaClientesPage } from '../ManageCategoriaClientesPage';
import { CategoriaClienteBusqueda } from './components/CategoriaClienteBusqueda';
import { CategoriaClientePaginacion } from './components/CategoriaClientePaginacion';
import { isEqual } from 'lodash';

export type CategoriaClientesPageProps = {
	// types...
}

export const initialFormState: ClientCategoryType = {
	clientCategoryId: null,
	clientCategoryName: '',
	clientCategoryDiscount: 0,
	specialCategory: false,
	categoryActive: true
}

export const CategoriaClientesPage: React.FC<CategoriaClientesPageProps> = ({ }) => {

	const {
		formState,
		onResetForm,
		setFormState,
		onInputChange,
		onBooleanChangeClick
	} = useForm({
		clientCategoryName: '',
		page: 0,
		pageSize: 10,
		sortDirection: 'DESC',
		sortColumn: 'id_categoriacliente'
	});

	const queryClient = new QueryClient();
	const [open, setOpen] = useState<boolean>(false);
	const [openNew, setOpenNew] = useState<boolean>(false);
	const [editMode, setEditMode] = useState(false);
	const [createMode, setCreateMode] = useState(true);
	const [rows, setRows] = React.useState<GridRowsProp>([]);
	const { fetchMainCategorias } = useCategoriaClienteAsync();
	const [title, setTitle] = useState<string>('');
	const prevFormState = useRef<any | undefined>(undefined);
	const [pagination, setPagination] = useState<PaginatedResponseType>({
		limit: 0,
		list: [],
		page: 0,
		totalPages: 0,
		totalRecords: 0,
	});

	const onNewCategoriaCliente = () => {
		setFormState(initialFormState);
		setOpenNew(true);
		setCreateMode(true);
		setTitle('Nueva Categoría Cliente');
	};

	const thereIsChanges = useMemo(() => {
		return (
			!isEqual(prevFormState.current, formState)
		);
	}, [formState]);

	const columns: GridColDef[] = [
		{
			field: 'clientCategoryId',
			headerName: 'Nro Cataegoría',
			headerClassName: 'super-app-theme--header',
			headerAlign: 'center',
			flex: 1,
			cellClassName: 'centered-grid',
			align: 'center',
		},
		{
			field: 'clientCategoryName',
			headerName: 'Nombre',
			type: 'string',
			flex: 1,
			headerClassName: 'super-app-theme--header',
			headerAlign: 'center',
			sortable: false,
			align: 'center',
		},
		{
			field: 'clientCategoryDiscount',
			headerName: 'Descuento',
			headerClassName: 'super-app-theme--header',
			headerAlign: 'center',
			align: 'center',
			flex: 1,
			sortable: true,
			valueFormatter: (params) =>
				params.value === null ? '' : setCurrencyNumber(Number(params.value)),
		},
		{
			field: 'specialCategory',
			headerName: 'Cateogría Especial',
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
			field: 'categoryActive',
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
					<Tooltip title="Abrir Categoría">
						<GridActionsCellItem
							icon={<OpenInNew />}
							label="Abrir Categoría"
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
				onClick={() => onNewCategoriaCliente()}
			>
				Nueva Categoría Cliente
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
		const categoria = rows.find((item) => item.id === id);
		if (categoria && categoria !== null) {
			setTitle('Categoría Cliente (Modo Lectura) - N° ' + categoria.clientCategoryId);
			setOpenNew(true);
			setCreateMode(false);
			setFormState({
				clientCategoryId: categoria.clientCategoryId,
				clientCategoryName: categoria.clientCategoryName,
				clientCategoryDiscount: categoria.clientCategoryDiscount,
				specialCategory: categoria.specialCategory,
				categoryActive: categoria.categoryActive
			});
		}
	};

	useEffect(() => {
		if (pagination) {
			const categoryList = pagination.list as ClientCategoryType[];
			setRows(
				categoryList.map((category: ClientCategoryType) => {
					return {
						id: randomId(),
						clientCategoryId: category.clientCategoryId,
						clientCategoryName: category.clientCategoryName,
						clientCategoryDiscount: category.clientCategoryDiscount,
						specialCategory: category.specialCategory,
						categoryActive: category.categoryActive
					};
				})
			);
		}
	}, [pagination]);

	useEffect(() => {
		const getMainPage = async () => {
			const paginacion = await fetchMainCategorias(
				formState.clientCategoryName,
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
			<CategoriaClienteBusqueda
				open={open}
				setOpen={setOpen}
				formState={formState}
				onInputChange={onInputChange}
				setPagination={setPagination}
				onResetForm={onResetForm}
			/>
			<ManageCategoriaClientesPage
				openNew={openNew}
				setOpenNew={setOpenNew}
				formState={formState}
				setFormState={setFormState}
				onInputChange={onInputChange}
				onResetForm={onResetForm}
				onBooleanChangeClick={onBooleanChangeClick}
				createMode = {createMode}
				editMode = {editMode}
				setEditMode={setEditMode}
				title = {title}
				setTitle={setTitle}
				thereIsChanges ={thereIsChanges}
			/>
			<CardLayout
				title="Categoría Clientes"
				positionTitle={'left'}
				headerActions={headerComponents}
			>
				<Grid container spacing={2} alignItems="center" sx={{ mt: 0.5 }}>
					<Grid item xs={12}>
						<QueryClientProvider client={queryClient}>
							<CategoriaClientePaginacion
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
