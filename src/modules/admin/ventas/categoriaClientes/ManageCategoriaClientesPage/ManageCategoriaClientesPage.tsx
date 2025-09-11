"use client";
import { FormState, useCategoriaClienteAsync } from '@/hooks';
import { PaperComponent } from '@/modules/layout';
import { ServerResponseType } from '@/store';
import { ClientCategoryType } from '@/types';
import { EditNote, Save, ToggleOff, ToggleOn } from '@mui/icons-material';
import { Button, Dialog, DialogContent, DialogTitle, Grid, TextField, Tooltip } from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import React, { ChangeEvent } from 'react';

export type ManageCategoriaClientesPageProps = {
	openNew: boolean;
	setOpenNew: React.Dispatch<React.SetStateAction<boolean>>;
	formState: FormState
	setFormState: React.Dispatch<React.SetStateAction<FormState>>;
	onInputChange: (
		event: ChangeEvent<HTMLInputElement>,
		listName?: string,
		index?: number
	) => void
	onResetForm: () => void
	onBooleanChangeClick: (name: string, value: boolean) => void;
	editMode: boolean
	createMode: boolean
	setEditMode: React.Dispatch<React.SetStateAction<boolean>>;
	title: string
	setTitle: React.Dispatch<React.SetStateAction<string>>;
	thereIsChanges: boolean;
}

export const ManageCategoriaClientesPage: React.FC<ManageCategoriaClientesPageProps> = ({
	openNew,
	setOpenNew,
	formState,
	setFormState,
	onInputChange,
	onResetForm,
	onBooleanChangeClick,
	editMode,
	createMode,
	setEditMode,
	title,
	setTitle,
	thereIsChanges
}) => {


	const { fetchSaveCategory, fetchUpdateCategory } = useCategoriaClienteAsync();
	

	const setHeader = (formState: FormState): ClientCategoryType => {
		return {
			...(formState as ClientCategoryType),
		};
	};

	const onInputChangeDecimal = (event: any) => {
		const { name, value } = event.target;
		if (value <= 100) {
			if (/^\d*\.?\d{0,2}$/.test(value)) {
				setFormState({
					...formState,
					[name]: value
				});
			}
		}
	};

	const onEditButtonClick = () => {
		if (!editMode) {
			setEditMode(true);
			setTitle('Categoría Cliente (Modo Edición) - N° ' + formState.clientCategoryId);
			enqueueSnackbar(
				<>
					{'Modo edición habilitado'}
					<br />
					{'Modo lectura deshabilitado'}
				</>,
				{
					variant: 'info',
				}
			);
		} else {
			setEditMode(false);
			setTitle('Categoría Cliente (Modo Lectura) - N° ' + formState.clientCategoryId);
			enqueueSnackbar(
				<>
					{'Modo edición deshabilitado'}
					<br />
					{'Modo lectura habilitado'}
				</>,
				{
					variant: 'info',
				}
			);
		}
	};

	const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		const categoryPost = setHeader(formState);

		const response = formState.clientCategoryId && formState.clientCategoryId !== null
			? await fetchUpdateCategory(
				formState.clientCategoryId,
				categoryPost
			)
			: await fetchSaveCategory(
				categoryPost
			)

		if (
			!response ||
			(response && (response as ServerResponseType).status === 400) ||
			(response && (response as ServerResponseType).status === 500)
		) {
			enqueueSnackbar(`Error al guardar categoría cliente`, {
				variant: 'error',
			});
			return;
		}
		enqueueSnackbar(`La Categoría Cliente se guardo correctamente`, {
			variant: 'success',
		});
		onResetForm();
		setOpenNew(false);
	};
	return (
		<Dialog
			open={openNew}
			onClose={() => setOpenNew(false)}
			PaperComponent={PaperComponent}
			aria-labelledby="draggable-dialog-title"
			maxWidth="md"
			fullWidth
		>
			<DialogTitle
				style={{
					cursor: 'move',
					textAlign: 'center',
				}}
				id="draggable-dialog-title"
				sx={{ mt: 2 }}
			>
				{title}
			</DialogTitle>
			<DialogContent>
				<form onSubmit={onSubmit}>
					<Grid container spacing={2} alignItems="center" sx={{ mt: 1 }}>
						<Grid item xs={6}>
							<TextField
								required
								name="clientCategoryName"
								label="Nombre"
								value={formState.clientCategoryName}
								onChange={onInputChange}
								InputProps={{
									readOnly: !createMode && !editMode,
								}}
								InputLabelProps={{
									shrink: formState.clientCategoryName ? true : false,
								}}
								fullWidth
							/>
						</Grid>
						<Grid item xs={6}>
							<Grid item xs={12}>
								<TextField
									name="clientCategoryDiscount"
									label="Porcentaje"
									type="number"
									value={formState.clientCategoryDiscount}
									onChange={onInputChangeDecimal}
									InputProps={{
										endAdornment: '%',
										readOnly: !createMode && !editMode,
									}}
									inputProps={{ style: { textTransform: 'uppercase', textAlign: 'right' } }}
									InputLabelProps={{
										shrink:
											formState.clientCategoryDiscount !== '' &&
												formState.clientCategoryDiscount != null
												? true
												: false,
									}}
									fullWidth
								/>
							</Grid>
						</Grid>
						<Grid item xs={6}>
							<Tooltip title="Es Especial">
								<span>
									<Button
										disabled={!createMode && !editMode}
										startIcon={
											formState.specialCategory ? (
												<ToggleOn />
											) : (
												<ToggleOff />
											)
										}
										onClick={() =>
											onBooleanChangeClick(
												'specialCategory',
												!formState.specialCategory
											)
										}
										style={{ width: '100%', height: 38 }}
									>
										{formState.specialCategory ? 'Especial' : 'No Especial'}
									</Button>
								</span>
							</Tooltip>
						</Grid>
						<Grid item xs={6}>
							<Tooltip title="Estado Cattegoría">
								<span>
									<Button
										disabled={!createMode && !editMode}
										startIcon={
											formState.categoryActive ? (
												<ToggleOn />
											) : (
												<ToggleOff />
											)
										}
										onClick={() =>
											onBooleanChangeClick(
												'categoryActive',
												!formState.categoryActive
											)
										}
										style={{ width: '100%', height: 38 }}
									>
										{formState.categoryActive ? 'Activa' : 'Inactiva'}
									</Button>
								</span>
							</Tooltip>
						</Grid>
					</Grid>
					<Grid
						container
						direction="row"
						justifyContent="center"
						alignItems="center"
						sx={{ mt: 2 }}
					>
						{!createMode && (
							<>
								<Button
									startIcon={<EditNote />}
									sx={{ margin: 2 }}
									onClick={onEditButtonClick}
									style={{ width: '120px' }}
								>
									{!editMode ? 'Editar' : 'Leer'}
								</Button>

							</>
						)}
						<Button
							startIcon={<Save />}
							disabled = {!thereIsChanges}
							sx={{ margin: 2 }}
							type="submit"
						>
							{'Guardar'}
						</Button>
					</Grid>
				</form>
			</DialogContent>
		</Dialog>
	);
};
