"use client";
import { useAutorizacionesSriAsync, useForm } from '@/hooks';
import { DocumentsAuthType, PaginatedResponseType } from '@/types';
import { Search, Send } from '@mui/icons-material';
import { Box, Button, Grid } from '@mui/material';
import { GridColDef, GridRowsProp } from '@mui/x-data-grid';
import { randomId } from '@mui/x-data-grid-generator';
import format from 'date-fns/format';
import React, { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { AutorizacionesBusqueda } from '../AutorizacionesSriPage/components/AutorizacionesBusqueda';
import { CardLayout } from '@/modules/layout';
import { AutorizacionesPaginacion } from '../AutorizacionesSriPage/components/AutorizacionesPaginacion';

export type DocumentosAutorizadosProps = {
	// types...
}

export const DocumentosAutorizadosPage: React.FC<DocumentosAutorizadosProps> = ({ }) => {

	
	const {
		formState,
		onResetForm,
		setFormState,
		onInputChange,
		onAutocompleteChange
	} = useForm({
		documentNumber: null,
		documentType: null,
		name: null,
		identification: null,
		accesKey: null,
		isAuthorized: true,
		page: 0,
		pageSize: 10,
		sortDirection: null,
		sortColumn: null,
	});

	const queryClient = new QueryClient();
	const [open, setOpen] = useState<boolean>(false);
	const [rows, setRows] = React.useState<GridRowsProp>([]);
	const { fetchMainDocs } = useAutorizacionesSriAsync();
	const [pagination, setPagination] = useState<PaginatedResponseType>({
		limit: 0,
		list: [],
		page: 0,
		totalPages: 0,
		totalRecords: 0,
	});

	const columns: GridColDef[] = [
		{
			field: 'numberDocument',
			headerName: 'Nro Documento',
			headerClassName: 'super-app-theme--header',
			headerAlign: 'center',
			flex: 1,
			cellClassName: 'centered-grid',
			align: 'center',
		},
		{
			field: 'documentTypeName',
			headerName: 'Tipo Documento',
			type: 'string',
			flex: 1,
			headerClassName: 'super-app-theme--header',
			headerAlign: 'center',
			sortable: false,
			align: 'center',
		},
		{
			field: 'documentComercialName',
			headerName: 'Nombre',
			headerClassName: 'super-app-theme--header',
			headerAlign: 'center',
			align: 'center',
			flex: 1,
			sortable: true,
		},
		{
			field: 'documentIdentification',
			headerName: 'Identificaciòn',
			headerClassName: 'super-app-theme--header',
			headerAlign: 'center',
			align: 'center',
			flex: 1,
			sortable: true,
		},
		{
			field: 'issueDate',
			headerName: 'Fecha Emisiòn',
			headerClassName: 'super-app-theme--header',
			headerAlign: 'center',
			align: 'center',
			flex: 1,
			sortable: true,
			valueFormatter: (params) => {
				const rawDate = params.value;
				const formattedDate = rawDate ? format(new Date(rawDate), 'dd/MM/yyyy') : '';
				return formattedDate;
			},
		},
		{
			field: 'accessKey',
			headerName: 'Clave Acceso',
			headerClassName: 'super-app-theme--header',
			headerAlign: 'center',
			align: 'center',
			flex: 1,
			sortable: true,
		},
		{
			field: 'documentStateId',
			headerName: 'Estado',
			align: 'center',
			headerClassName: 'super-app-theme--header',
			headerAlign: 'center',
			flex: 1,
			sortable: false,
			valueFormatter: (params) => {
				const stateUser = params.value
				const stateName = stateUser === 2 ? 'CONFIRMADO' : '';
				return stateName;
			}
		},
	];

	const headerComponents: React.ReactNode = (
		<Box sx={{ mt: 0.5 }}>
			<Button
				variant="contained"
				color="primary"
				sx={{ mr: 1, width: '200px' }}
				startIcon={<Send />}
			// onClick={() => {
			// 	navigate(PathEnum.NOTA_CREDITO + PathEnum.NEW);
			// }}
			>
				Enviar Documentos
			</Button>
			<Button
				variant="contained"
				color="primary"
				sx={{ mr: 1, width: '200px' }}
				startIcon={<Send />}
			// onClick={() => {
			// 	navigate(PathEnum.NOTA_CREDITO + PathEnum.NEW);
			// }}
			>
				Procesar Todos XML
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

	useEffect(() => {
		if (pagination) {
			const docList = pagination.list as DocumentsAuthType[];
			setRows(
				docList.map((doc: DocumentsAuthType) => {
					return {
						id: randomId(),
						numberDocument: doc.numberDocument,
						documentTypeName: doc.documentTypeName,
						documentComercialName: doc.documentComercialName,
						documentIdentification: doc.documentIdentification,
						issueDate: doc.issueDate,
						accessKey: doc.accessKey,
						documentStateId: doc.documentStateId
					};
				})
			);
		}
	}, [pagination]);

	useEffect(() => {
		const getMainPage = async () => {
			const paginacion = await fetchMainDocs(
				formState.documentNumber,
				formState.documentType,
				formState.identification,
				formState.name,
				formState.accesKey,
				formState.isAuthorized,
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
			<AutorizacionesBusqueda
				open={open}
				setOpen={setOpen}
				formState={formState}
				onInputChange={onInputChange}
				setPagination={setPagination}
				onResetForm={onResetForm}
				onAutocompleteChange={onAutocompleteChange}
			/>
			<CardLayout
				title="Documentos Autorizados"
				positionTitle={'left'}
				headerActions={headerComponents}
			>
				<Grid container spacing={2} alignItems="center" sx={{ mt: 0.5 }}>
					<Grid item xs={12}>
						<QueryClientProvider client={queryClient}>
							<AutorizacionesPaginacion
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
