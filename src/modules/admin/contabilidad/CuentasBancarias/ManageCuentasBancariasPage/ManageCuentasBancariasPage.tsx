"use client";
import { DocumentTypeEnum, PathEnum, TipoCuentaEnum } from '@/enums';
import { FormState, useAccessDocument, useAllowGlobal, useBankAsync, useForm } from '@/hooks';
import { CardLayout } from '@/modules/layout';
import { RootState, ServerResponseType } from '@/store';
import { BancoType } from '@/types';
import { SkipNext, SkipPrevious } from '@mui/icons-material';
import { Box, Button, Tooltip } from '@mui/material';
import { isEqual } from 'lodash';
import { enqueueSnackbar } from 'notistack';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { ManageCuentaBancariaForm } from './components/ManageCuentaBancariaForm';
import { CuentaBancariaButtons } from './components/CuentaBancariaButtons';

export type ManageCuentasBancariasPageProps = {
	// types...
}

const initialFormState: BancoType = {
	bankId: null,
	accountId: null,
	bankAccountTypeId: null,
	bankName: '',
	bankAccountNumber: '',
	availableBalance: 0,
	accountBalance: 0,
	bankContact: '',
	bankContactTitle: '',
	bankContactPhone: '',
	printedCheckNumber: 0,
	lastCheckNumber: 0,
	isPettyCash: false,
	bankState: true,
	recoveredCheck: '',
	depositText: '',
	cardText: '',
	initialBalance: null,
	branchId: null,
}

export const ManageCuentasBancariasPage: React.FC<ManageCuentasBancariasPageProps> = ({ }) => {

	const location = useLocation();
	const navigate = useNavigate();
	const prevFormState = useRef<any | undefined>(undefined);
	const { navigateBetweenDocuments } = useAllowGlobal();
	const [title, setTitle] = useState<string>('');
	const [editMode, setEditMode] = useState(false);
	const [createMode, setCreateMode] = useState(true);
	const { closeDocument, openDocument } = useAccessDocument();
	const [isEditable, setIsEditable] = useState(true);
	const { fetchSaveBank, fetchUpdateBank, fetchBankById } = useBankAsync();
	const requestId = location && location.state ? location.state.requestId : undefined;
	const { sucursales } = useSelector((state: RootState) => state.common);

	const {
		onInputChange,
		onAutocompleteChange,
		setFormState,
		formState,
		onInputJustNumber,
		onBooleanChangeClick,
	} = useForm({ ...initialFormState });

	const setHeader = (formState: FormState): BancoType => {
		const {
			accountIdTemp,
			...restForm
		} = formState;
		return {
			...restForm as BancoType,
		};
	};

	const headerComponents: React.ReactNode = (
		<Box sx={{ mt: 2 }}>
			<div
				style={{
					display: 'flex',
					justifyContent: 'center',
					position: 'fixed',
					left: '5%',
					transform: 'translateY(-50%)',
					zIndex: 1,
				}}
			>
				<Tooltip title="Anterior">
					<Button
						variant="contained"
						color="primary"
						startIcon={<SkipPrevious />}
						onClick={() => {
							closeDocument({
								id: requestId,
								documentType: DocumentTypeEnum.USUARIO,
							});
							openDocument({
								id: Number(requestId) - 1,
								navigation: () =>
									navigate(PathEnum.CUENTA_BANCO + PathEnum.VIEW, {
										state: {
											requestId: Number(requestId) - 1,
										},
									}),
								documentType: DocumentTypeEnum.USUARIO,
							});
						}}
					/>
				</Tooltip>
			</div>
			<div
				style={{
					display: 'flex',
					justifyContent: 'center',
					position: 'fixed',
					right: '5%',
					transform: 'translateY(-50%)',
					zIndex: 1,
				}}
			>
				<Tooltip title="Siguiente">
					<Button
						variant="contained"
						color="primary"
						startIcon={<SkipNext />}
						onClick={() => {
							closeDocument({
								id: requestId,
								documentType: DocumentTypeEnum.SUCURSAL,
							});
							openDocument({
								id: Number(requestId) + 1,
								navigation: () =>
									navigate(PathEnum.CUENTA_BANCO + PathEnum.VIEW, {
										state: {
											requestId: Number(requestId) + 1,
										},
									}),
								documentType: DocumentTypeEnum.SUCURSAL,
							});
						}}
					/>
				</Tooltip>
			</div>
		</Box>
	);

	const handleCancel = async () => {
		if (requestId) {
			closeDocument({
				id: requestId,
				documentType: DocumentTypeEnum.SUCURSAL,
			});
		}
		navigate(PathEnum.CUENTA_BANCO);
	};

	useEffect(() => {
		if (!requestId) {
			setCreateMode(true);
			setTitle('Nueva Cuenta Bancaria');
			setIsEditable(true);
		} else {
			setCreateMode(false);
			setEditMode(false);
			setTitle('Cuenta Bancaria (Modo Lectura) - N° ' + requestId);
			const setForm = async () => {
				const response = await fetchBankById(requestId);
				if (response) {
					const dto = response as BancoType;
					const newFormState = {
						...dto,
						accountIdTemp: dto.accountId
					};
					setFormState(newFormState);
					prevFormState.current = newFormState;
				}
			};
			setForm();
		}
	}, [requestId]);

	const thereIsChanges = useMemo(() => {
		return (
			!isEqual(prevFormState.current, formState)
		);
	}, [formState]);

	const validateForm = () => {
		let isValid = true;
		if (formState.bankName === '') {
			enqueueSnackbar(
				'El campo Nombre es requerido',
				{
					variant: 'error',
				}
			);
			isValid = false;
		}
		if (formState.branchId === null) {
			enqueueSnackbar(
				'El campo Sucursal es Requerido',
				{
					variant: 'error',
				}
			);
			isValid = false;
		}
		if (formState.bankAccountTypeId === null) {
			enqueueSnackbar(
				'El campo Tipo Cuenta es requerido',
				{
					variant: 'error',
				}
			);
			isValid = false;
		}else{
			if(formState.bankAccountTypeId === TipoCuentaEnum.EFECTIVO || formState.bankAccountTypeId === TipoCuentaEnum.NO_APLICA){
				isValid = true;
			}else{
				if (formState.bankAccountNumber === '') {
					enqueueSnackbar('El campo Cuenta bancaria es requerido', {
						variant: 'error',
					});
					isValid = false;
				}
			}
		}
		if (formState.accountId === null) {
			enqueueSnackbar(
				'El campo Cuenta es requerido',
				{
					variant: 'error',
				}
			);
			isValid = false;
		}

		return isValid;
	};

	const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (!validateForm()) {
			return;
		}

		const bank = setHeader(formState);

		const response = requestId
			? await fetchUpdateBank(
				requestId,
				bank
			)
			: await fetchSaveBank(bank)
		if (
			!response ||
			(response && (response as ServerResponseType).status === 400) ||
			(response && (response as ServerResponseType).status === 404) ||
			(response && (response as ServerResponseType).status === 500)
		) {
			enqueueSnackbar(`Error al guardar la cuenta bancaria`, {
				variant: 'error',
			});
			return;
		}
		enqueueSnackbar(`La cuenta bancaria se guardo correctamente`, {
			variant: 'success',
		});
		handleCancel();
	}

	return (
		<>
			<CardLayout
				title={title}
				createMode={createMode}
				cancelFunction={handleCancel}
				headerActions={
					!createMode && navigateBetweenDocuments() ? headerComponents : null
				}
			>
				<form
					onSubmit={onSubmit}
					onKeyDown={(e) => {
						if (e.key === 'Enter') e.preventDefault();
					}}
				>
					<ManageCuentaBancariaForm
						formState={formState}
						setFormState={setFormState}
						createMode={createMode}
						editMode={editMode}
						onAutocompleteChange={onAutocompleteChange}
						onInputChange={onInputChange}
						onBooleanChangeClick={onBooleanChangeClick}
						onInputJustNumber={onInputJustNumber}
						sucursales={sucursales}
					/>
					<CuentaBancariaButtons
						createMode={createMode}
						handleCancel={handleCancel}
						isEditable={isEditable}
						editMode={editMode}
						thereIsChanges={thereIsChanges}
						formState={formState}
						setFormState={setFormState}
						setEditMode={setEditMode}
						setTitle={setTitle}
					/>
				</form>
			</CardLayout>
		</>
	);
};
