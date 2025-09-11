"use client";
import { useForm, useGrupoInventarioAsync } from '@/hooks';
import { CardLayout } from '@/modules/layout';
import { RootState } from '@/store';
import { PaginatedResponseType, SubgrupoType } from '@/types';
import { AddCircle, OpenInNew, Search } from '@mui/icons-material';
import { Box, Button, Grid, Tooltip } from '@mui/material';
import { GridActionsCellItem, GridColDef, GridRowId, GridRowsProp } from '@mui/x-data-grid';
import { randomId } from '@mui/x-data-grid-generator';
import { isEqual } from 'lodash';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { useSelector } from 'react-redux';
import { SubgrupoPaginacion } from './components/SubgrupoPaginacion';
import { SubgrupoBusqueda } from './components/SubgrupoBusqueda';
import { ManageSubgrupoPage } from '../ManageSubgrupoPage';

export type SubgrupoPageProps = {
	// types...
}

export const initialFormState: SubgrupoType = {
	subgroupId: null,
	groupId: null,
	subgroupName: '',
	subgroupCode: '',
}

export const SubgrupoPage: React.FC<SubgrupoPageProps> = ({ }) => {
	const {
		formState,
		onResetForm,
		setFormState,
		onInputChange,
		onAutocompleteChange
	} = useForm({
		subgroupName: '',
		page: 0,
		pageSize: 10,
		sortDirection: 'DESC',
		sortColumn: 'id_subgrupo'
	});
	const queryClient = new QueryClient();
	const [open, setOpen] = useState<boolean>(false);
	const [openNew, setOpenNew] = useState<boolean>(false);
	const [editMode, setEditMode] = useState(false);
	const [createMode, setCreateMode] = useState(true);
	const [rows, setRows] = React.useState<GridRowsProp>([]);
	const [title, setTitle] = useState<string>('');
	const prevFormState = useRef<any | undefined>(undefined);
	const { fetchMainSubGrupos } = useGrupoInventarioAsync();
	const { grupos } = useSelector((state: RootState) => state.common);
	const [pagination, setPagination] = useState<PaginatedResponseType>({
		limit: 0,
		list: [],
		page: 0,
		totalPages: 0,
		totalRecords: 0,
	});

	const onNewSubgrupo = () => {
		setFormState(initialFormState);
		setOpenNew(true);
		setCreateMode(true);
		setTitle('Nueva Subgrupo');
	};

	const thereIsChanges = useMemo(() => {
		return (
			!isEqual(prevFormState.current, formState)
		);
	}, [formState]);

	const columns: GridColDef[] = [
		{
			field: 'subgroupId',
			headerName: 'Nro Subgrupo',
			headerClassName: 'super-app-theme--header',
			headerAlign: 'center',
			flex: 1,
			cellClassName: 'centered-grid',
			align: 'center',
		},
		{
			field: 'groupId',
			headerName: 'Nro Grupo',
			type: 'string',
			flex: 1,
			headerClassName: 'super-app-theme--header',
			headerAlign: 'center',
			sortable: false,
			align: 'center',
		},
		{
			field: 'subgroupName',
			headerName: 'Nombre',
			type: 'string',
			flex: 1,
			headerClassName: 'super-app-theme--header',
			headerAlign: 'center',
			sortable: false,
			align: 'center',
		},
		{
			field: 'subgroupCode',
			headerName: 'Nemónico',
			headerClassName: 'super-app-theme--header',
			headerAlign: 'center',
			align: 'center',
			flex: 1,
			sortable: true
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
					<Tooltip title="Abrir Subgrupo">
						<GridActionsCellItem
							icon={<OpenInNew />}
							label="Abrir Subgrupo"
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
				onClick={() => onNewSubgrupo()}
			>
				Nuevo Subgrupo
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
		const subgrupo = rows.find((item) => item.id === id);
		if (subgrupo && subgrupo !== null) {
			setTitle('Subgrupo (Modo Lectura) - N° ' + subgrupo.groupId);
			setOpenNew(true);
			setCreateMode(false);
			setFormState({
				subgroupId: subgrupo.subgroupId,
				groupId: subgrupo.groupId,
				subgroupName: subgrupo.subgroupName,
				subgroupCode: subgrupo.subgroupCode,
			});
		}
	};

	useEffect(() => {
		if (pagination) {
			const subgroupList = pagination.list as SubgrupoType[];
			setRows(
				subgroupList.map((subgrupo: SubgrupoType) => {
					return {
						id: randomId(),
						subgroupId: subgrupo.subgroupId,
						groupId: subgrupo.groupId,
						subgroupName: subgrupo.subgroupName,
						subgroupCode: subgrupo.subgroupCode,
					};
				})
			);
		}
	}, [pagination]);

	useEffect(() => {
		const getMainPage = async () => {
			const paginacion = await fetchMainSubGrupos(
				formState.subgroupName,
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
			<SubgrupoBusqueda
				open={open}
				setOpen={setOpen}
				formState={formState}
				onInputChange={onInputChange}
				setPagination={setPagination}
				onResetForm={onResetForm}
			/>
			<ManageSubgrupoPage
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
				grupos = {grupos}
			/>
			<CardLayout
				title="Subgrupo"
				positionTitle={'left'}
				headerActions={headerComponents}
			>
				<Grid container spacing={2} alignItems="center" sx={{ mt: 0.5 }}>
					<Grid item xs={12}>
						<QueryClientProvider client={queryClient}>
							<SubgrupoPaginacion
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

