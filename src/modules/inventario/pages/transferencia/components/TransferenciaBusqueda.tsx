'use client';
import { EstadoLogisticaEnum } from '@/enums';
import { FormState, StyledDatePicker, useStyles, useTransferenciaAsync } from '@/hooks';
import { PaperComponent } from '@/modules/layout';
import { BodegaGetInterface, PaginatedResponseType } from '@/types';
import { Search } from '@mui/icons-material';
import { Autocomplete, Button, Dialog, DialogContent, DialogTitle, FormControl, Grid, InputLabel, MenuItem, Select, SelectChangeEvent, TextField } from '@mui/material';
import format from 'date-fns/format';
import React, { ChangeEvent } from 'react';

export type BusquedaTransferProps = {
	open: boolean;
	setOpen: React.Dispatch<React.SetStateAction<boolean>>;
	formState: FormState
	onDateChange: (value: Date, name: string) => void
	onAutocompleteChange: (
		event: React.ChangeEvent<{}>,
		name: string,
		value: any,
		index?: number
	) => void;
	handleOnSelect: (event: SelectChangeEvent<any>) => void
	onInputJustNumber: (
		event: ChangeEvent<HTMLInputElement>,
	) => void;
	wareHouseList: BodegaGetInterface[]
	wareHouseDestiny: BodegaGetInterface[]
	onResetForm: () => void;
	setPagination: React.Dispatch<React.SetStateAction<PaginatedResponseType>>;
}

export const BusquedaTransfer: React.FC<BusquedaTransferProps> = (
	{ open, setOpen, formState, onDateChange, handleOnSelect, onAutocompleteChange, wareHouseList, wareHouseDestiny, onResetForm, setPagination }) => {
	const styles = useStyles();
	const { fetchMainTransferencias } = useTransferenciaAsync();

	const estadoLogisticaList = Object.keys(EstadoLogisticaEnum)
		.filter((key): key is keyof typeof EstadoLogisticaEnum =>
			isNaN(Number(key))
		)
		.map((key) => ({ label: key, value: EstadoLogisticaEnum[key] }));

	const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		const getResult = async () => {
			const paginacion = await fetchMainTransferencias(
				formState.startDate !== null ? format(formState.startDate, 'dd/MM/yyyy') : null,
				formState.endDate !== null ? format(formState.endDate, 'dd/MM/yyyy') : null,
				formState.numTransfer,
				formState.state,
				formState.origin,
				formState.destiny,
				formState.byCurrentMonth,
				formState.page,
				formState.pageSize,
				formState.sortDirection,
				formState.sortColumn,
			);
			setPagination(paginacion as PaginatedResponseType);
		};
		getResult();
		onResetForm();
		setOpen(false);
	};

	return (
		<Dialog
			open={open}
			onClose={() => setOpen(false)}
			PaperComponent={PaperComponent}
			aria-labelledby="draggable-dialog-title"
			maxWidth="md"
			fullWidth
			PaperProps={{
				sx: {
					position: 'fixed',
					top: 0,
				},
			}}
		>
			<DialogTitle
				style={{
					cursor: 'move',
					textAlign: 'center',
				}}
				id="draggable-dialog-title"
				sx={{ mt: 2 }}
			>
				BÚSQUEDA AVANZADA TRANSFERENCIA
			</DialogTitle>
			<DialogContent>
				<form onSubmit={onSubmit}>
					<Grid container spacing={2} alignItems="center" sx={{ mt: 1 }}>
						<Grid item xs={6}>
							<StyledDatePicker
								label="Fecha Inicio"
								views={['year', 'month', 'day']}
								format="dd/MM/yyyy"
								maxDate={formState.endDate}
								value={formState.startDate !== null ? formState.startDate : null}
								onChange={(value) =>
									onDateChange(value as Date, 'startDate')
								}
								slotProps={{
									textField: {
										className: styles.genericFieldStyle,
										sx: {
											minWidth: '100%',
										},
										InputProps: {
											className: styles.textWhiteStyle,
										},
										InputLabelProps: {
											className: styles.textGreenStyle,
											shrink: formState.startDate ? true : false,
										},
									},
								}}
							/>
						</Grid>
						<Grid item xs={6}>
							<StyledDatePicker
								label="Fecha Fin"
								views={['year', 'month', 'day']}
								format="dd/MM/yyyy"
								maxDate={new Date()}
								value={formState.endDate !== null ? formState.endDate : null}
								onChange={(value) =>
									onDateChange(value as Date, 'endDate')
								}
								slotProps={{
									textField: {
										className: styles.genericFieldStyle,
										sx: {
											minWidth: '100%',
										},
										InputProps: {
											className: styles.textWhiteStyle,
										},
										InputLabelProps: {
											className: styles.textGreenStyle,
											shrink: formState.endDate ? true : false,
										},
									},
								}}
							/>
						</Grid>
						<Grid item xs={6}>
							<FormControl fullWidth>
								<InputLabel id="state-label">Estado</InputLabel>
								<Select
									name="state"
									labelId="state-label"
									id="state-select"
									label="Estado"
									value={formState.state === null ? '' : formState.state}
									onChange={handleOnSelect}
									fullWidth
								>
									{estadoLogisticaList.map((estado) => (
										<MenuItem
											key={estado.value}
											value={parseInt(
												estado.value?.toString() || ''
											)}
										>
											{estado.label}
										</MenuItem>
									))}
								</Select>
							</FormControl>
						</Grid>
						<Grid item xs={6}>
							<Autocomplete
								className={styles.genericFieldStyle}
								options={wareHouseList}
								getOptionLabel={(option) => option.warehouseName}
								style={{ width: '100%' }}
								onChange={(event, value) => {
									onAutocompleteChange(event, 'origin', value?.branchId);
								}}
								value={
									(formState.origin !== null
										?
										wareHouseList.find(
											(warehouse) =>
												warehouse.branchId === formState.origin
										)
										: null) || null
								}
								isOptionEqualToValue={(
									option: BodegaGetInterface,
									value: BodegaGetInterface
								) =>
									option && value
										? option === value
										: false
								}
								filterOptions={(options) => {
									return options.filter((option, index, self) =>
										index === self.findIndex((o) => o.branchId === option.branchId)
									);
								}}
								noOptionsText="Sin resultados"
								renderInput={(params) => (
									<TextField
										{...params}
										label="Bodega Salida"
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
						<Grid item xs={6}>
							<Autocomplete
								className={styles.genericFieldStyle}
								options={wareHouseDestiny}
								getOptionLabel={(option) => option.warehouseName}
								style={{ width: '100%' }}
								onChange={(event, value) => {
									onAutocompleteChange(event, 'destiny', value?.branchId);
								}}
								value={
									(formState.destiny !== null
										?
										wareHouseDestiny.find(
											(warehouse) =>
												warehouse.branchId === formState.destiny
										)
										: null) || null
								}
								isOptionEqualToValue={(
									option: BodegaGetInterface,
									value: BodegaGetInterface
								) =>
									option && value
										? option === value
										: false
								}
								noOptionsText="Sin resultados"
								renderInput={(params) => (
									<TextField
										{...params}
										label="Bodega Destino"
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
						<Button startIcon={<Search />} sx={{ margin: 2 }} type="submit">
							{'Buscar'}
						</Button>
					</Grid>
				</form>
			</DialogContent>
		</Dialog>
	);
};