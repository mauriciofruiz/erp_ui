"use client";
import { DocumentTypeEnum, PathEnum, RoleEnum } from '@/enums';
import { useAccessDocument, useAllowGlobal, useForm, useUserAsync } from '@/hooks';
import { CardLayout } from '@/modules/layout';
import { RootState, ServerResponseType } from '@/store';
import { RolUserPost, UserPostType, UserType } from '@/types';
import { SkipNext, SkipPrevious } from '@mui/icons-material';
import { Box, Button, Tooltip } from '@mui/material';
import { parseISO } from 'date-fns';
import dayjs from 'dayjs';
import { isEqual } from 'lodash';
import { enqueueSnackbar } from 'notistack';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { ManageUserForm } from './components/ManageUserForm';
import { UsuarioButtons } from './components/UsuarioButtons';

export type ManageUsuariosPageProps = {
	// types...
}

const initialFormState: UserType = {
	userId: null,
	branchId: null,
	personId: null,
	nick: '',
	password: '',
	position: null,
	entryDate: null,
	deactivationDate: null,
	startTime: null,
	endTime: null,
	time: null,
	cashId: null,
	unlockCode: null,
	photo: null,
	state: true,
}

export const ManageUsuariosPage: React.FC<ManageUsuariosPageProps> = ({ }) => {
	const location = useLocation();
	const navigate = useNavigate();
	const prevFormState = useRef<any | undefined>(undefined);
	const { navigateBetweenDocuments } = useAllowGlobal();
	const [title, setTitle] = useState<string>('');
	const [editMode, setEditMode] = useState(false);
	const [createMode, setCreateMode] = useState(true);
	const { closeDocument, openDocument } = useAccessDocument();
	const [isEditable, setIsEditable] = useState(true);
	const requestId = location && location.state ? location.state.requestId : undefined;
	const { sucursales, roles } = useSelector((state: RootState) => state.common);
	const [selectedRoles, setSelectedRoles] = useState<RolUserPost[]>([]);
	const { fetchUserById, fetchUpdateUser } = useUserAsync();

	const {
		onInputChange,
		onDateChange,
		onAutocompleteChange,
		setFormState,
		formState,
		onInputJustNumber,
		onImageChange,
		onBooleanChangeClick
	} = useForm({
		...initialFormState,
		personName: '',
		personIdentification: '',
		personAddress: '',
		personPhone: '',
		personEmail: ''
	});

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
									navigate(PathEnum.USUARIO + PathEnum.VIEW, {
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
								documentType: DocumentTypeEnum.USUARIO,
							});
							openDocument({
								id: Number(requestId) + 1,
								navigation: () =>
									navigate(PathEnum.USUARIO + PathEnum.VIEW, {
										state: {
											requestId: Number(requestId) + 1,
										},
									}),
								documentType: DocumentTypeEnum.USUARIO,
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
				documentType: DocumentTypeEnum.USUARIO,
			});
		}
		navigate(PathEnum.USUARIO);
	};

	useEffect(() => {
		if (!requestId) {
			setCreateMode(true);
			setTitle('Nuevo Usuario');
			setIsEditable(true);
		} else {
			setCreateMode(false);
			setEditMode(false);
			setTitle('Usuario (Modo Lectura) - N° ' + requestId);
			const setForm = async () => {
				const response = await fetchUserById(requestId);
				if (response) {
					const dto = response as UserType;
					const newFormState = {
						...dto,
						entryDate:
							typeof dto.entryDate === 'string'
								? parseISO(dto.entryDate)
								: dto.entryDate ?? new Date(),
						deactivationDate:
							typeof dto.deactivationDate === 'string'
								? parseISO(dto.deactivationDate)
								: dto.deactivationDate,
						startTime: dayjs(dto.startTime, 'HH:mm:ss'),
						endTime: dayjs(dto.endTime, 'HH:mm:ss'),
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

		if (formState.nick === '') {
			enqueueSnackbar(
				'El campo Usuario es requerido',
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
		if (formState.position === null) {
			enqueueSnackbar(
				'El campo Cargo es requerido',
				{
					variant: 'error',
				}
			);
			isValid = false;
		}
		if (formState.personId === '') {
			enqueueSnackbar('El campo Persona es requerido', {
				variant: 'error',
			});
			isValid = false;
		}
		if(selectedRoles && selectedRoles.length === 1){
			const isVentas = selectedRoles.some(rol => rol.roleId === RoleEnum.VENTAS && rol.roleUserStatus === true);
			if(isVentas){
				if(formState.cashId === null){
					enqueueSnackbar('El campo Caja es requerida', {
						variant: 'error',
					});
					isValid = false;
				}
			}
		}
		return isValid;
	};

	const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (!validateForm()) {
			return;
		}

		const userPost: UserPostType = {
			nick: formState.nick,
			branchId: formState.branchId,
			position: formState.position,
			startTime: (formState.startTime).format('HH:mm:ss'),
			endTime: (formState.endTime).format('HH:mm:ss'),
			stateUser: formState.state,
			photo: formState.photo,
			cashId: formState.cashId,
			rolesList: selectedRoles
		}	

		const response = requestId
			? await fetchUpdateUser(
				requestId,
				userPost
			)
			: null
		if (
			!response ||
			(response && (response as ServerResponseType).status === 400) ||
			(response && (response as ServerResponseType).status === 500)
		) {
			enqueueSnackbar(`Error al guardar el usuario`, {
				variant: 'error',
			});
			return;
		}
		enqueueSnackbar(`El usuario se guardo correctamente`, {
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
					<ManageUserForm
						formState={formState}
						setFormState={setFormState}
						createMode={createMode}
						editMode={editMode}
						onDateChange={onDateChange}
						onAutocompleteChange={onAutocompleteChange}
						onInputChange={onInputChange}
						onInputJustNumber={onInputJustNumber}
						sucursales={sucursales}
						roles={roles}
						onImageChange={onImageChange}
						onBooleanChangeClick={onBooleanChangeClick}
						selectedRoles={selectedRoles}
						setSelectedRoles={setSelectedRoles}
					/>
					<UsuarioButtons
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