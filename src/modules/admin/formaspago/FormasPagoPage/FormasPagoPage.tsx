"use client";
import { useForm, useFormasPagoAsync } from '@/hooks';
import { CardLayout } from '@/modules/layout';
import { FormaDePagoType, PaginatedResponseType } from '@/types';
import { AddCircle, OpenInNew } from '@mui/icons-material';
import { Box, Button, Grid, Tooltip } from '@mui/material';
import { GridActionsCellItem, GridColDef, GridRowId, GridRowsProp } from '@mui/x-data-grid';
import { randomId } from '@mui/x-data-grid-generator';
import { isEqual } from 'lodash';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ManageFormaPagoPage } from '../ManageFormaPagoPage';
import { FormaPagoPaginacion } from './components/FormaPagoPaginacion';
import { setCurrencyNumber } from '@/functions';

export type FormasPagoPageProps = {
	// types...
}

export const initialFormState: FormaDePagoType = {
	paymentCollectionMethodId: '',
	paymentCollectionMethodName: '',
	paymentCollectionMethodAlias: '',
	paymentCollectionMethodDiscount: 0,
	paymentCollectionMethodCode: '',
	paymentCollectionMethodStatus: true
}

export const FormasPagoPage: React.FC<FormasPagoPageProps> = ({ }) => {

	const {
		formState,
		onResetForm,
		setFormState,
		onInputChange,
		onInputJustNumber,
		onBooleanChangeClick
	} = useForm({
		page: 0,
		pageSize: 10,
		sortDirection: 'DESC',
		sortColumn: 'id_formapagocobro'
	});

	const queryClient = new QueryClient();
	const [openNew, setOpenNew] = useState<boolean>(false);
	const [editMode, setEditMode] = useState(false);
	const [createMode, setCreateMode] = useState(true);
	const [rows, setRows] = React.useState<GridRowsProp>([]);
	const [title, setTitle] = useState<string>('');
	const prevFormState = useRef<any | undefined>(undefined);
	const { fetchMainFormasPago } = useFormasPagoAsync();
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
		setTitle('Nueva Forma de Pago');
	};

	const thereIsChanges = useMemo(() => {
		return (
			!isEqual(prevFormState.current, formState)
		);
	}, [formState]);

	const columns: GridColDef[] = [
		{
			field: 'paymentCollectionMethodId',
			headerName: 'Nro Forma Pago',
			headerClassName: 'super-app-theme--header',
			headerAlign: 'center',
			flex: 1,
			cellClassName: 'centered-grid',
			align: 'center',
		},
		{
			field: 'paymentCollectionMethodName',
			headerName: 'Nombre',
			type: 'string',
			flex: 1,
			headerClassName: 'super-app-theme--header',
			headerAlign: 'center',
			sortable: false,
			align: 'center',
		},
		{
			field: 'paymentCollectionMethodDiscount',
			headerName: 'Descuento',
			type: 'string',
			flex: 1,
			headerClassName: 'super-app-theme--header',
			headerAlign: 'center',
			sortable: false,
			align: 'center',
			valueFormatter: (params) =>
				params.value === null ? '' : setCurrencyNumber(Number(params.value)),
		},
		{
			field: 'paymentCollectionMethodStatus',
			headerName: 'Estado',
			align: 'center',
			headerClassName: 'super-app-theme--header',
			headerAlign: 'center',
			flex: 1,
			sortable: false,
			valueFormatter: (params) => {
				const state = params.value
				const stateName = state === true ? 'ACTIVO' : 'INACTIVO';
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
					<Tooltip title="Abrir Forma de Pago">
						<GridActionsCellItem
							icon={<OpenInNew />}
							label="Abrir Forma de Pago"
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
				startIcon={<AddCircle />}
				onClick={() => onNewGrupoInventario()}
			>
				Nueva Forma de Pago
			</Button>
		</Box>
	);

	const handleEditClick = (id: GridRowId) => () => {
		const formaPago = rows.find((item) => item.id === id);
		if (formaPago && formaPago !== null) {
			setTitle('Forma de Pago (Modo Lectura) - N° ' + formaPago.paymentCollectionMethodId);
			setOpenNew(true);
			setCreateMode(false);
			setFormState({
				paymentCollectionMethodId: formaPago.paymentCollectionMethodId,
				paymentCollectionMethodName: formaPago.paymentCollectionMethodName,
				paymentCollectionMethodAlias: formaPago.paymentCollectionMethodAlias,
				paymentCollectionMethodDiscount: formaPago.paymentCollectionMethodDiscount,
				paymentCollectionMethodCode: formaPago.paymentCollectionMethodCode,
				paymentCollectionMethodStatus: formaPago.paymentCollectionMethodStatus
			});
		}
	};

	useEffect(() => {
		if (pagination) {
			const formaPagoList = pagination.list as FormaDePagoType[];
			setRows(
				formaPagoList.map((formaPago: FormaDePagoType) => {
					return {
						id: randomId(),
						paymentCollectionMethodId: formaPago.paymentCollectionMethodId,
						paymentCollectionMethodName: formaPago.paymentCollectionMethodName,
						paymentCollectionMethodAlias: formaPago.paymentCollectionMethodAlias,
						paymentCollectionMethodDiscount: formaPago.paymentCollectionMethodDiscount,
						paymentCollectionMethodCode: formaPago.paymentCollectionMethodCode,
						paymentCollectionMethodStatus: formaPago.paymentCollectionMethodStatus
					};
				})
			);
		}
	}, [pagination]);

	useEffect(() => {
		const getMainPage = async () => {
			const paginacion = await fetchMainFormasPago(
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
			<ManageFormaPagoPage
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
				onBooleanChangeClick = {onBooleanChangeClick}
				onInputJustNumber = {onInputJustNumber}
				setFormState = {setFormState}
			/>
			<CardLayout
				title="FORMAS DE PAGO"
				positionTitle={'left'}
				headerActions={headerComponents}
			>
				<Grid container spacing={2} alignItems="center" sx={{ mt: 0.5 }}>
					<Grid item xs={12}>
						<QueryClientProvider client={queryClient}>
							<FormaPagoPaginacion
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
