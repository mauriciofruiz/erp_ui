"use client";
import { DocumentTypeEnum, PathEnum } from '@/enums';
import { useAccessDocument, useBankAsync, useForm } from '@/hooks';
import { CardLayout } from '@/modules/layout';
import { BancoType, PaginatedResponseType } from '@/types';
import { AddCircle, OpenInNew, Search } from '@mui/icons-material';
import { Box, Button, Grid, Tooltip } from '@mui/material';
import { GridActionsCellItem, GridColDef, GridRowId, GridRowsProp } from '@mui/x-data-grid';
import { randomId } from '@mui/x-data-grid-generator';
import React, { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { CuentasBancariasPaginacion } from './components/CuentasBancariasPaginacion';
import { CuentasBancariasBusqueda } from './components/CuentasBancariasBusqueda';

export type CuentasBancariasProps = {
	// types...
}

export const CuentasBancariasPage: React.FC<CuentasBancariasProps> = ({ }) => {

	const {
		formState,
		onResetForm,
		setFormState,
		onInputChange
	} = useForm({
		bankName: null,
		bankAccountNumber: null,
		page: 0,
		pageSize: 10,
		sortDirection: 'DESC',
		sortColumn: 'idBanco',
	});

	const queryClient = new QueryClient();
	const navigate = useNavigate();
	const [open, setOpen] = useState<boolean>(false);
	const [rows, setRows] = React.useState<GridRowsProp>([]);
	const { openDocument } = useAccessDocument();
	const { fetchMainAccountBank } = useBankAsync();
	const [pagination, setPagination] = useState<PaginatedResponseType>({
		limit: 0,
		list: [],
		page: 0,
		totalPages: 0,
		totalRecords: 0,
	});

	const columns: GridColDef[] = [
		{
			field: 'bankId',
			headerName: 'Nro Banco',
			headerClassName: 'super-app-theme--header',
			headerAlign: 'center',
			flex: 1,
			cellClassName: 'centered-grid',
			align: 'center',
		},
		{
			field: 'bankName',
			headerName: 'Nombre',
			type: 'string',
			flex: 1,
			headerClassName: 'super-app-theme--header',
			headerAlign: 'center',
			sortable: false,
			align: 'center',
		},
		{
			field: 'bankAccountNumber',
			headerName: 'Número Cuenta',
			headerClassName: 'super-app-theme--header',
			headerAlign: 'center',
			align: 'center',
			flex: 1,
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
					navigate(PathEnum.CUENTA_BANCO + PathEnum.NEW);
				}}
			>
				Nuevo Banco
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
		const banco = rows.find((item) => item.id === id);
		openDocument({
			id: banco?.bankId,
			navigation: () =>
				navigate(PathEnum.CUENTA_BANCO + PathEnum.VIEW, {
					state: {
						requestId: banco?.bankId,
					},
				}),
			documentType: DocumentTypeEnum.SUCURSAL,
		});
	};

	useEffect(() => {
		if (pagination) {
			const bankList = pagination.list as BancoType[];
			setRows(
				bankList.map((bank: BancoType) => {
					return {
						id: randomId(),
						bankId: bank.bankId,
						bankName: bank.bankName,
						bankAccountNumber: bank.bankAccountNumber,
					};
				})
			);
		}
	}, [pagination]);

	useEffect(() => {
		const getMainPage = async () => {
			const paginacion = await fetchMainAccountBank(
				formState.bankName,
				formState.bankAccountNumber,
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
			<CuentasBancariasBusqueda
				open={open}
				setOpen={setOpen}
				formState={formState}
				setPagination={setPagination}
				onResetForm={onResetForm}
				onInputChange={onInputChange}
			/>
			<CardLayout
				title="Cuentas Bancarias"
				positionTitle={'left'}
				headerActions={headerComponents}
			>
				<Grid container spacing={2} alignItems="center" sx={{ mt: 0.5 }}>
					<Grid item xs={12}>
						<QueryClientProvider client={queryClient}>
							<CuentasBancariasPaginacion
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
