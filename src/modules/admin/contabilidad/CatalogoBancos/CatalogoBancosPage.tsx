"use client";
import { useCatalogBankAsync, useForm } from '@/hooks';
import { CardLayout } from '@/modules/layout';
import { BankType, PaginatedResponseType } from '@/types';
import { AddCircle, OpenInNew, Search } from '@mui/icons-material';
import { Box, Button, Grid, Tooltip } from '@mui/material';
import { GridActionsCellItem, GridColDef, GridRowId, GridRowsProp } from '@mui/x-data-grid';
import { randomId } from '@mui/x-data-grid-generator';
import { isEqual } from 'lodash';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { CatalogoBancosBusqueda } from './components/CatalogoBancosBusqueda';
import { CatalogoBancosPaginacion } from './components/CatalogoBancosPaginacion';
import { ManageCatalogoBancosPage } from './components/ManageCatalogoBancosPage';

export type CatalogoBancosPageProps = {
	// types...
}

export const initialFormState: BankType = {
	bankCatalogCode: '',
	bankCatalogId: null,
	bankCatalogName: '',
	bankStatus: true
}


export const CatalogoBancosPage: React.FC<CatalogoBancosPageProps> = ({ }) => {

	const {
		formState,
		onResetForm,
		setFormState,
		onInputChange,
	} = useForm({
		bankCatalogName: null,
		bankCatalogCode: null,
		page: 0,
		pageSize: 10,
		sortDirection: 'DESC',
		sortColumn: 'idBancoCat'
	});

	const queryClient = new QueryClient();
	const [open, setOpen] = useState<boolean>(false);
	const [openNew, setOpenNew] = useState<boolean>(false);
	const [editMode, setEditMode] = useState(false);
	const [createMode, setCreateMode] = useState(true);
	const [rows, setRows] = React.useState<GridRowsProp>([]);
	const [title, setTitle] = useState<string>('');
	const prevFormState = useRef<any | undefined>(undefined);
	const { fetchMainCatalogBanks } = useCatalogBankAsync();
	const [pagination, setPagination] = useState<PaginatedResponseType>({
		limit: 0,
		list: [],
		page: 0,
		totalPages: 0,
		totalRecords: 0,
	});

	const onNewCatalogBank = () => {
		setFormState(initialFormState);
		setOpenNew(true);
		setCreateMode(true);
		setTitle('Nuevo Catálogo Banco');
	};

	const thereIsChanges = useMemo(() => {
		return (
			!isEqual(prevFormState.current, formState)
		);
	}, [formState]);

	const columns: GridColDef[] = [
		{
			field: 'bankCatalogId',
			headerName: 'Nro Catálogo',
			headerClassName: 'super-app-theme--header',
			headerAlign: 'center',
			flex: 1,
			cellClassName: 'centered-grid',
			align: 'center',
		},
		{
			field: 'bankCatalogName',
			headerName: 'Nombre',
			type: 'string',
			flex: 1,
			headerClassName: 'super-app-theme--header',
			headerAlign: 'center',
			sortable: false,
			align: 'center',
		},
		{
			field: 'bankCatalogCode',
			headerName: 'Código',
			type: 'string',
			flex: 1,
			headerClassName: 'super-app-theme--header',
			headerAlign: 'center',
			sortable: false,
			align: 'center',
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
					<Tooltip title="Abrir Catalogo Banco">
						<GridActionsCellItem
							icon={<OpenInNew />}
							label="Abrir Catalogo Banco"
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
				onClick={() => onNewCatalogBank()}
			>
				Nuevo Catálogo Banco
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
		const catalogo = rows.find((item) => item.id === id);
		if (catalogo && catalogo !== null) {
			setTitle('Grupo Inventario (Modo Lectura) - N° ' + catalogo.bankCatalogId);
			setOpenNew(true);
			setCreateMode(false);
			setFormState({
				bankCatalogCode: catalogo.bankCatalogCode,
				bankCatalogId: catalogo.bankCatalogId,
				bankCatalogName: catalogo.bankCatalogName,
				bankStatus: catalogo.bankStatus
			});
		}
	};

	useEffect(() => {
		if (pagination) {
			const catalogoList = pagination.list as BankType[];
			setRows(
				catalogoList.map((catalogo: BankType) => {
					return {
						id: randomId(),
						bankCatalogCode: catalogo.bankCatalogCode,
						bankCatalogId: catalogo.bankCatalogId,
						bankCatalogName: catalogo.bankCatalogName,
					};
				})
			);
		}
	}, [pagination]);

	useEffect(() => {
		const getMainPage = async () => {
			const paginacion = await fetchMainCatalogBanks(
				formState.bankCatalogName,
				formState.bankCatalogCode,
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
			<CatalogoBancosBusqueda
				open={open}
				setOpen={setOpen}
				formState={formState}
				onInputChange={onInputChange}
				setPagination={setPagination}
				onResetForm={onResetForm}
			/>
			<ManageCatalogoBancosPage
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
			/>
			<CardLayout
				title="Catálogo Bancos"
				positionTitle={'left'}
				headerActions={headerComponents}
			>
				<Grid container spacing={2} alignItems="center" sx={{ mt: 0.5 }}>
					<Grid item xs={12}>
						<QueryClientProvider client={queryClient}>
							<CatalogoBancosPaginacion
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
