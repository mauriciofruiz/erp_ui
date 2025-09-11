"use client";
import { FormState, useForm, useMenuAsync } from '@/hooks';
import { CardLayout } from '@/modules/layout';
import { MenuType, PaginatedResponseType } from '@/types';
import { AddCircle, OpenInNew, Search } from '@mui/icons-material';
import { Box, Button, Grid, SelectChangeEvent, Tooltip } from '@mui/material';
import { GridActionsCellItem, GridColDef, GridRowId, GridRowsProp } from '@mui/x-data-grid';
import { randomId } from '@mui/x-data-grid-generator';
import React, { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { BusquedaAvanzadaMenu } from './components/BusquedaAvanzadaMenu';
import { MenuPaginacion } from './components/MenuPaginacion';
import { MenuForm } from './components/MenuForm';

export type MenuPageProps = {
	// types...
}

export const MenuPage: React.FC<MenuPageProps> = ({ }) => {

	const {
		formState,
		onResetForm,
		setFormState,
		onInputChange,
		onInputJustNumber,
		onAutocompleteChange
	} = useForm({
		menuId: null,
		menuName: null,
		menuLevel: null,
		menuFatherId: null,
		menuComponent: null,
		menuUrl: '',
		menuIcon: '',
		page: 0,
		pageSize: 10,
		sortDirection: 'ASC',
		sortColumn: 'menuName',
	});

	const queryClient = new QueryClient();
	const [open, setOpen] = useState<boolean>(false);
	const [openNew, setOpenNew] = useState<boolean>(false);
	const [rows, setRows] = React.useState<GridRowsProp>([]);
	const [menuList, setMenuList] = useState<MenuType[]>([]);
	const { fetchMainMenus } = useMenuAsync();
	const [pagination, setPagination] = useState<PaginatedResponseType>({
		limit: 0,
		list: [],
		page: 0,
		totalPages: 0,
		totalRecords: 0,
	});

	const onNewMenu = () => {
		setFormState({
			menuId: null,
			menuName: '',
			menuLevel: 1,
			menuFatherId: '',
			menuIcon: '',
			menuUrl: '',
			menuComponent: '',
		});

		setOpenNew(true);
	};

	const handleEditClick = (id: GridRowId) => () => {
		const menu = rows.find((item) => item.id === id);
		if (menu && menu !== null) {
			setOpenNew(true);
			setFormState({
				menuId: menu.menuId,
				menuName: menu.menuName,
				menuLevel: menu.menuLevel,
				menuFatherId: menu.menuFatherId,
				menuIcon: menu.menuIcon,
				menuUrl: menu.menuUrl,
				menuComponent: menu.menuComponent,
			});
		}
	};

	const handleOnSelect = (event: SelectChangeEvent<any>) => {
		setFormState((prevState: FormState) => ({
			...prevState,
			[event.target.name]: event.target.value,
		}));
	};


	const columns: GridColDef[] = [
		{
			field: 'menuId',
			headerName: 'Nro Menu',
			headerClassName: 'super-app-theme--header',
			headerAlign: 'center',
			flex: 1,
			cellClassName: 'centered-grid',
			align: 'center',
		},
		{
			field: 'menuName',
			headerName: 'Nombre',
			type: 'string',
			flex: 1,
			headerClassName: 'super-app-theme--header',
			headerAlign: 'center',
			sortable: false,
			align: 'center',
		},
		{
			field: 'menuFatherId',
			headerName: 'Padre',
			headerClassName: 'super-app-theme--header',
			headerAlign: 'center',
			align: 'center',
			flex: 1,
			sortable: true,
		},
		{
			field: 'menuUrl',
			headerName: 'Url',
			align: 'center',
			headerClassName: 'super-app-theme--header',
			headerAlign: 'center',
			flex: 1,
			sortable: false,
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
					<Tooltip title="Editar Menu">
						<GridActionsCellItem
							icon={<OpenInNew />}
							label="Editar Menu"
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
				onClick={() => onNewMenu()}
			>
				Nuevo Menu
			</Button>
			<Button
				variant="contained"
				color="secondary"
				sx={{ width: '200px' }}
				startIcon={<Search />}
				onClick={() => {
					setOpen(true)
					onResetForm()
				}}
			>
				Buscar
			</Button>
		</Box>
	);

	useEffect(() => {
		if (pagination) {
			const menuList = pagination.list as MenuType[];
			setMenuList(menuList);
			setRows(
				menuList.map((menu: MenuType) => {
					return {
						id: randomId(),
						menuId: menu.menuId,
						menuName: menu.menuName,
						menuLevel: menu.menuLevel,
						menuFatherId: menu.menuFatherId,
						menuUrl: menu.menuUrl,
						menuComponent: menu.menuComponent,
						menuIcon: menu.menuIcon
					};
				})
			);
		}
	}, [pagination]);


	useEffect(() => {
		const getMainPage = async () => {
			const paginacion = await fetchMainMenus(
				formState.menuId,
				formState.menuName,
				formState.menuLevel,
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
			<BusquedaAvanzadaMenu
				open={open}
				setOpen={setOpen}
				formState={formState}
				setPagination={setPagination}
				onResetForm={onResetForm}
				onInputJustNumber={onInputJustNumber}
				onInputChange={onInputChange}
			/>
			<MenuForm
				openNew={openNew}
				setOpenNew={setOpenNew}
				formState={formState}
				onInputChange={onInputChange}
				handleOnSelect={handleOnSelect}
				menuList={menuList}
				onResetForm={onResetForm}
				onAutocompleteChange = {onAutocompleteChange}
			/>
			<CardLayout
				title="Menús"
				positionTitle={'left'}
				headerActions={headerComponents}
			>
				<Grid container spacing={2} alignItems="center" sx={{ mt: 0.5 }}>
					<Grid item xs={12}>
						<QueryClientProvider client={queryClient}>
							<MenuPaginacion
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
			</CardLayout >
		</>
	);
};
