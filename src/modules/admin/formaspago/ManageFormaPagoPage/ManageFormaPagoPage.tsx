"use client";
import { FormState, useFormasPagoAsync } from '@/hooks';
import { PaperComponent } from '@/modules/layout';
import { ServerResponseType } from '@/store';
import { FormaDePagoType } from '@/types';
import { EditNote, Save, ToggleOff, ToggleOn } from '@mui/icons-material';
import { Button, Dialog, DialogContent, DialogTitle, Grid, TextField, Tooltip } from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import React, { ChangeEvent } from 'react';

export type ManageFormaPagoPageProps = {
	openNew: boolean;
	setOpenNew: React.Dispatch<React.SetStateAction<boolean>>;
	formState: FormState
	onInputChange: (
		event: ChangeEvent<HTMLInputElement>,
		listName?: string,
		index?: number
	) => void
	onResetForm: () => void
	editMode: boolean
	createMode: boolean
	setEditMode: React.Dispatch<React.SetStateAction<boolean>>;
	title: string
	setTitle: React.Dispatch<React.SetStateAction<string>>;
	thereIsChanges: boolean;
	onBooleanChangeClick: (name: string, value: boolean) => void;
	onInputJustNumber: (event: ChangeEvent<HTMLInputElement>) => void;
	setFormState: React.Dispatch<React.SetStateAction<FormState>>;
}

export const ManageFormaPagoPage: React.FC<ManageFormaPagoPageProps> = ({
	openNew,
	setOpenNew,
	formState,
	onInputChange,
	onResetForm,
	editMode,
	createMode,
	setEditMode,
	title,
	setTitle,
	thereIsChanges,
	onBooleanChangeClick,
	onInputJustNumber,
	setFormState
}) => {

	const { fetchSaveFormaPago, fetchUpdateFormaPago } = useFormasPagoAsync();

	const setHeader = (formState: FormState): FormaDePagoType => {
		return {
			...(formState as FormaDePagoType),
		};
	};

	const onInputChangeDecimal = (event: any) => {
		const { name, value } = event.target;
		if (/^\d*\.?\d{0,2}$/.test(value)) {
			setFormState({
				...formState,
				[name]: value
			});
		}
	};

	const onEditButtonClick = () => {
		if (!editMode) {
			setEditMode(true);
			setTitle('Forma de Pago (Modo Edición) - N° ' + formState.paymentCollectionMethodId);
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
			setTitle('Forma de Pago (Modo Lectura) - N° ' + formState.paymentCollectionMethodId);
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

		const grupoInventarioPost = setHeader(formState);

		const response = formState.paymentCollectionMethodId && formState.paymentCollectionMethodId !== null
			? await fetchUpdateFormaPago(
				formState.paymentCollectionMethodId,
				grupoInventarioPost
			)
			: await fetchSaveFormaPago(
				grupoInventarioPost
			)

		if (
			!response ||
			(response && (response as ServerResponseType).status === 400) ||
			(response && (response as ServerResponseType).status === 500)
		) {
			enqueueSnackbar(`Error al guardar la forma de pago`, {
				variant: 'error',
			});
			return;
		}
		enqueueSnackbar(`La forma de pago se guardo correctamente`, {
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
								name="paymentCollectionMethodId"
								label="Id"
								value={formState.paymentCollectionMethodId}
								onChange={onInputJustNumber}
								InputProps={{
									readOnly: !createMode && !editMode,
								}}
								InputLabelProps={{
									shrink: formState.paymentCollectionMethodId ? true : false,
								}}
								fullWidth
							/>
						</Grid>
						<Grid item xs={6}>
							<TextField
								required
								name="paymentCollectionMethodCode"
								label="Código"
								value={formState.paymentCollectionMethodCode}
								onChange={onInputJustNumber}
								InputProps={{
									readOnly: !createMode && !editMode,
								}}
								InputLabelProps={{
									shrink: formState.paymentCollectionMethodCode ? true : false,
								}}
								fullWidth
							/>
						</Grid>
						<Grid item xs={6}>
							<TextField
								required
								name="paymentCollectionMethodName"
								label="Nombre"
								value={formState.paymentCollectionMethodName}
								onChange={onInputChange}
								InputProps={{
									readOnly: !createMode && !editMode,
								}}
								InputLabelProps={{
									shrink: formState.paymentCollectionMethodName ? true : false,
								}}
								fullWidth
							/>
						</Grid>
						<Grid item xs={6}>
							<TextField
								required
								name="paymentCollectionMethodAlias"
								label="Alias"
								value={formState.paymentCollectionMethodAlias}
								onChange={onInputChange}
								InputProps={{
									readOnly: !createMode && !editMode,
								}}
								InputLabelProps={{
									shrink: formState.paymentCollectionMethodAlias ? true : false,
								}}
								fullWidth
							/>
						</Grid>
						<Grid item xs={6}>
							<TextField
								name="paymentCollectionMethodDiscount"
								label="Descuento"
								type="number"
								value={formState.paymentCollectionMethodDiscount}
								onChange={onInputChangeDecimal}
								InputProps={{
									readOnly: !createMode && !editMode,
								}}
								inputProps={{ style: { textTransform: 'uppercase', textAlign: 'right' } }}
								InputLabelProps={{
									shrink:
										formState.paymentCollectionMethodDiscount !== '' &&
											formState.paymentCollectionMethodDiscount != null
											? true
											: false,
								}}
								fullWidth
							/>
						</Grid>
						<Grid item xs={6}>
							<Tooltip title="Estado Forma de Pago">
								<span>
									<Button
										disabled={!createMode && !editMode}
										startIcon={
											formState.paymentCollectionMethodStatus ? (
												<ToggleOn />
											) : (
												<ToggleOff />
											)
										}
										onClick={() =>
											onBooleanChangeClick(
												'paymentCollectionMethodStatus',
												!formState.paymentCollectionMethodStatus
											)
										}
										style={{ width: '100%', height: 38 }}
									>
										{formState.paymentCollectionMethodStatus ? 'Activa' : 'Inactiva'}
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
							disabled={!thereIsChanges}
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