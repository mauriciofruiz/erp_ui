"use client";
import { useForm, useSesionAsync } from '@/hooks';
import { CardLayout } from '@/modules/layout';
import { PaginatedResponseType, SesionMainType } from '@/types';
import { Close, CloseOutlined, Search } from '@mui/icons-material';
import { Box, Button, Grid, Tooltip } from '@mui/material';
import { GridActionsCellItem, GridColDef, GridRowId, GridRowsProp } from '@mui/x-data-grid';
import { randomId } from '@mui/x-data-grid-generator';
import React, { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { SesionBusqueda } from './components/SesionBusqueda';
import { SesionPaginacion } from './components/SesionPaginacion';
import { ServerResponseType } from '@/store';
import { getAllSessions } from '@/backend';
import { enqueueSnackbar } from 'notistack';

export type SesionPageProps = {
	// types...
}

export const SesionPage: React.FC<SesionPageProps> = ({ }) => {

	const {
		formState,
		onResetForm,
		setFormState,
		onAutocompleteChange
	} = useForm({
		userId: null,
		page: 0,
		pageSize: 10,
		sortDirection: 'DESC',
		sortColumn: 'sessionId',
	});

	const queryClient = new QueryClient();
	const [open, setOpen] = useState<boolean>(false);
	const [rows, setRows] = React.useState<GridRowsProp>([]);
	const { fetchMainSessions, fetchCloseSesionById, fetchCloseAllSesions } = useSesionAsync();
	const [sessionClose, setSessionClose] = useState(false);
	const [allSesionList, setAllSesionList] = useState<SesionMainType[]>([]);
	const [pagination, setPagination] = useState<PaginatedResponseType>({
		limit: 0,
		list: [],
		page: 0,
		totalPages: 0,
		totalRecords: 0,
	});

	const columns: GridColDef[] = [
		{
			field: 'sessionId',
			headerName: 'Nro Session',
			headerClassName: 'super-app-theme--header',
			headerAlign: 'center',
			flex: 1,
			cellClassName: 'centered-grid',
			align: 'center',
		},
		{
			field: 'userId',
			headerName: 'Id Usuario',
			headerClassName: 'super-app-theme--header',
			headerAlign: 'center',
			align: 'center',
			flex: 1,
			sortable: true,
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
			field: 'personName',
			headerName: 'Nombre',
			type: 'string',
			flex: 1,
			headerClassName: 'super-app-theme--header',
			headerAlign: 'center',
			sortable: false,
			align: 'center',
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
					<Tooltip title="Cerrar Sesion">
						<GridActionsCellItem
							icon={<Close />}
							label="Cerrar Sesion"
							className="textPrimary"
							onClick={handleCloseSesionClick(id)}
							color="inherit"
						/>
					</Tooltip>,
				];
			},
		},
	];

	const handleCloseAllSesionsClick = () => {
		const closeSesions = async () => {
			const response = await fetchCloseAllSesions(allSesionList);
			if (response) {
				if (response.status === 200) {
					setSessionClose(true)
				} else {
					setSessionClose(false)
				}
			}
		}
		if (allSesionList.length > 0) {
			closeSesions();
		}
	};

	const headerComponents: React.ReactNode = (
		<Box sx={{ mt: 0.5 }}>
			<Button
				variant="contained"
				color="primary"
				sx={{ mr: 1, width: '200px' }}
				startIcon={<CloseOutlined />}
				onClick={() => handleCloseAllSesionsClick()}
			>
				Finalizar Sesiones
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

	const handleCloseSesionClick = (id: GridRowId) => () => {
		const userId = rows.find((item) => item.id === id);
		const closeSesion = async () => {
			if (userId && userId !== null) {
				const response = await fetchCloseSesionById(userId?.sessionId);
				if (response) {
					if (response.status === 200) {
						setSessionClose(true)
					} else {
						setSessionClose(false)
					}
				}
			}
		}
		closeSesion();
	};


	useEffect(() => {
		if (pagination) {
			const sesionList = pagination.list as SesionMainType[];
			setRows(
				sesionList.map((user: SesionMainType) => {
					return {
						id: randomId(),
						sessionId: user.sessionId,
						userId: user.userId,
						nick: user.nick,
						personName: user.personName,
						state: user.state
					};
				})
			);
		}
	}, [pagination]);

	const fetchAllSesiones = async () => {
        try {
            const response: ServerResponseType | undefined = await getAllSessions();
            if (response) {
                if (response.status === 200) {
                    setAllSesionList(response.message);
                } else {
                    setAllSesionList([]);
                    enqueueSnackbar(
                        `No se pudieron cargar las sesiones: ${response.message}`,
                        { variant: 'error' }
                    );
                }
            }
        } catch (error) {
            enqueueSnackbar('Existió un error de conexión', { variant: 'error' });
        }
    };

	const getMainPage = async () => {
		const paginacion = await fetchMainSessions(
			formState.userId,
			formState.page,
			formState.pageSize,
			formState.sortColumn,
			formState.sortDirection
		);
		setPagination(paginacion as PaginatedResponseType);
	};

	useEffect(() => {
		getMainPage();
		fetchAllSesiones();
	}, []);

	useEffect(() => {
		if (sessionClose) {
			getMainPage();
		}
	}, [sessionClose]);

	return (
		<>
			<SesionBusqueda
				open={open}
				setOpen={setOpen}
				formState={formState}
				onAutocompleteChange={onAutocompleteChange}
				setPagination={setPagination}
				onResetForm={onResetForm}
			/>
			<CardLayout
				title="Sesiones"
				positionTitle={'left'}
				headerActions={headerComponents}
			>
				<Grid container spacing={2} alignItems="center" sx={{ mt: 0.5 }}>
					<Grid item xs={12}>
						<QueryClientProvider client={queryClient}>
							<SesionPaginacion
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

