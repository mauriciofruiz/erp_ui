"use client";
import { PathEnum } from '@/enums';
import { FormState, useGrupoInventarioAsync, useStyles } from '@/hooks';
import { PaperComponent } from '@/modules/layout';
import { ServerResponseType } from '@/store';
import { GrupoType, SubgrupoType } from '@/types';
import { EditNote, Save } from '@mui/icons-material';
import { Autocomplete, Button, Dialog, DialogContent, DialogTitle, Grid, TextField } from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import React, { ChangeEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export type ManageSubgrupoPageProps = {
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
	onAutocompleteChange: (
		event: React.ChangeEvent<{}>,
		name: string,
		value: any,
		index?: number
	) => void;
	grupos: GrupoType[]
}

export const ManageSubgrupoPage: React.FC<ManageSubgrupoPageProps> = ({
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
	onAutocompleteChange,
	grupos
}) => {

	const styles = useStyles();
	const navigate = useNavigate();
	const [grupoSelected, setGrupoSelected] = useState<GrupoType | null>(null);
	const { fetchSaveSubGrupo, fetchUpdateSubGrupo } = useGrupoInventarioAsync();

	const setHeader = (formState: FormState): SubgrupoType => {
		return {
			...(formState as SubgrupoType),
		};
	};

	const onEditButtonClick = () => {
		if (!editMode) {
			setEditMode(true);
			setTitle('Subgrupo (Modo Edición) - N° ' + formState.subgroupId);
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
			setTitle('Subgrupo (Modo Lectura) - N° ' + formState.subgroupId);
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

	const validateForm = () =>{
		let isValid = true;
		if(formState.groupId === null){
			enqueueSnackbar(`El campo grupo es requerido`, {
				variant: 'error',
			});
			isValid = false;
		}
		return isValid
	}

	const handleCancel = async () => {
		navigate(PathEnum.SUBGRUPO);
	};


	const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if(!validateForm)
			return;

		const subgrupopost = setHeader(formState);

		const response = formState.subgroupId && formState.subgroupId !== null
			? await fetchUpdateSubGrupo(
				formState.subgroupId,
				subgrupopost
			)
			: await fetchSaveSubGrupo(
				subgrupopost
			)

		if (
			!response ||
			(response && (response as ServerResponseType).status === 400) ||
			(response && (response as ServerResponseType).status === 500)
		) {
			enqueueSnackbar(`Error al guardar el subgrupo`, {
				variant: 'error',
			});
			return;
		}
		enqueueSnackbar(`El subgrupo se guardo correctamente`, {
			variant: 'success',
		});
		handleCancel();
		onResetForm();
		setOpenNew(false);
	};


	useEffect(() => {
		if (formState.groupId === null) {
			setGrupoSelected(null);
			return;
		}
		if (grupoSelected && grupoSelected !== null && grupos.length === 0) return;
		const grupo = grupos.find((grupo) => grupo.groupId === formState.groupId);
		if (grupo) {
			setGrupoSelected(grupo);
		}
	}, [formState.groupId]);
	

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
								name="subgroupName"
								label="Nombre"
								value={formState.subgroupName}
								onChange={onInputChange}
								InputProps={{
									readOnly: !createMode && !editMode,
								}}
								InputLabelProps={{
									shrink: formState.subgroupName ? true : false,
								}}
								fullWidth
							/>
						</Grid>
						<Grid item xs={6}>
							<TextField
								required
								name="subgroupCode"
								label="Nemónico"
								value={formState.subgroupCode}
								onChange={onInputChange}
								InputProps={{
									readOnly: !createMode && !editMode,
								}}
								InputLabelProps={{
									shrink: formState.subgroupCode ? true : false,
								}}
								fullWidth
							/>
						</Grid>
						<Grid item xs={6}>
							<Autocomplete
								className={styles.genericFieldStyle}
								options={grupos}
								readOnly={!createMode && !editMode}
								getOptionLabel={(option) => option.groupName}
								style={{ width: '100%' }}
								onChange={(event, value) => {
									onAutocompleteChange(event, 'groupId', value?.groupId);
								}}
								value={grupoSelected}
								isOptionEqualToValue={(
									option: GrupoType,
									value: GrupoType
								) =>
									option && value
										? option === value
										: false
								}
								noOptionsText="Sin resultados"
								renderInput={(params) => (
									<TextField
										{...params}
										label="Grupo"
										variant="outlined"
										InputProps={{
											...params.InputProps,
											className: styles.textWhiteStyle,
										}}
										InputLabelProps={{
											...params.InputLabelProps,
											className: styles.textGreenStyle,
										}}
									/>
								)}
							/>
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
