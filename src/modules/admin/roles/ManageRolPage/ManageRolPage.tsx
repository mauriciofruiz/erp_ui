"use client";
import { DocumentTypeEnum, PathEnum } from '@/enums';
import { FormState, useAccessDocument, useAllowGlobal, useForm, useRolUsuarioAsync } from '@/hooks';
import { CardLayout } from '@/modules/layout';
import { ServerResponseType } from '@/store';
import { RolPost, RoleInterface } from '@/types';
import { SkipNext, SkipPrevious } from '@mui/icons-material';
import { Box, Button, Tooltip } from '@mui/material';
import { isEqual } from 'lodash';
import { enqueueSnackbar } from 'notistack';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ManageRolButtons } from './components/ManageRolButtons';
import { ManageRolForm } from './components/ManageRolForm';
import dayjs from 'dayjs';

export type ManageRolPageProps = {
	// types...
}

const initialFormState: RoleInterface = {
	roleId: null,
	roleName: '',
	roleDescription: '',
	roleStartTime: '',
	roleEndTime: '',
	roleTime: 0,
	creationUserId: null,
	modificationDate: null,
	modificationUserId: null,
	registrationDate: null,
}

export const ManageRolPage: React.FC<ManageRolPageProps> = ({ }) => {

	const location = useLocation();
	const navigate = useNavigate();
	const prevFormState = useRef<any | undefined>(undefined);
	const { navigateBetweenDocuments } = useAllowGlobal();
	const [editMode, setEditMode] = useState(false);
	const [title, setTitle] = useState<string>('');
	const [isEditable, setIsEditable] = useState(true);
	const [createMode, setCreateMode] = useState(true);
	const { closeDocument, openDocument } = useAccessDocument();
	const requestId = location && location.state ? location.state.requestId : undefined;
	const { fetchSaveRol, fetchUpdateRol, fetchRolById } = useRolUsuarioAsync()

	const setForm = (formState: FormState): RolPost => {
		return {
			...(formState as RolPost),
			startTime: (formState.roleStartTime).format('HH:mm:ss'),
			endTime: (formState.roleEndTime).format('HH:mm:ss'),
		};
	};

	const {
		onInputChange,
		onDateChange,
		setFormState,
		formState,
		onInputJustNumber,
	} = useForm({
		...initialFormState
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
									navigate(PathEnum.ROLES + PathEnum.VIEW, {
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
		navigate(PathEnum.ROLES);
	};

	useEffect(() => {
		if (!requestId) {
			setCreateMode(true);
			setTitle('Nuevo Rol');
			setIsEditable(true);
		} else {
			setCreateMode(false);
			setEditMode(false);
			setTitle('Rol (Modo Lectura) - N° ' + requestId);
			const setForm = async () => {
				const response = await fetchRolById(requestId);
				if (response) {
					const dto = response as  RoleInterface;
					const newFormState = {
						...dto,
						roleStartTime: dto.roleStartTime !== null ? dayjs(dto.roleStartTime, 'HH:mm:ss') : dto.roleStartTime,
						roleEndTime: dto.roleEndTime !== null ?  dayjs(dto.roleEndTime, 'HH:mm:ss') : dto.roleEndTime,
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
		let isValid = true
		if (formState.roleName === '') {
			enqueueSnackbar(`El nombre del rol es requerido`, {
				variant: 'error',
			});
			isValid = false;
		}
		if (formState.roleDescription === '') {
			enqueueSnackbar(`La descripción del rol es requerido`, {
				variant: 'error',
			});
			isValid = false;
		}
		if (formState.roleStartTime === '') {
			enqueueSnackbar(`El tiempo de inicio del rol es requerido`, {
				variant: 'error',
			});
			isValid = false;
		}
		if (formState.roleEndTime === '') {
			enqueueSnackbar(`El tiempo de fin del rol es requerido`, {
				variant: 'error',
			});
			isValid = false;
		}
		return isValid
	}

	const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (!validateForm()) {
			return;
		}

		const userPost = setForm(formState);

		const response = requestId
			? await fetchUpdateRol(
				requestId,
				userPost
			)
			: await fetchSaveRol(userPost)
		if (
			!response ||
			(response && (response as ServerResponseType).status === 400) ||
			(response && (response as ServerResponseType).status === 500)
		) {
			enqueueSnackbar(`Error al guardar el rol`, {
				variant: 'error',
			});
			return;
		}
		enqueueSnackbar(`El rol se guardo correctamente`, {
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
					<ManageRolForm
						formState={formState}
						setFormState={setFormState}
						createMode={createMode}
						editMode={editMode}
						onDateChange={onDateChange}
						onInputChange={onInputChange}
						onInputJustNumber={onInputJustNumber}
					/>
					<ManageRolButtons
						createMode={createMode}
						handleCancel={handleCancel}
						isEditable={isEditable}
						editMode={editMode}
						thereIsChanges={thereIsChanges}
						setEditMode={setEditMode}
						setTitle={setTitle}
					/>
				</form>

			</CardLayout>
		</>
	);
};

