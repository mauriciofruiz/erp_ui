import { DocumentTypeEnum, PathEnum } from '@/enums';
import {
  useAccessDocument,
  useAllowGlobal,
  useForm,
  useRetencionProveedorAsync,
} from '@/hooks';
import { CardLayout } from '@/modules/layout';
import { RetencionDetailInterface, RetencionResponseInterface } from '@/types';
import {
  ExitToApp,
  PictureAsPdf,
  SkipNext,
  SkipPrevious,
} from '@mui/icons-material';
import { Box, Button, Grid, Tooltip } from '@mui/material';
import { GridRowsProp } from '@mui/x-data-grid';
import { randomId } from '@mui/x-data-grid-generator';
import { enqueueSnackbar } from 'notistack';
import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { RetencionProveedorForm } from './components/RetencionProveedorForm';
import { downloadPdf } from '@/functions';

export type ManageRetencionProveedorProps = {};

export const ManageRetencionProveedor: React.FC<
  ManageRetencionProveedorProps
> = ({}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { navigateBetweenDocuments } = useAllowGlobal();
  const [title, setTitle] = useState<string>('');
  const [rows, setRows] = React.useState<GridRowsProp>([]);
  const { closeDocument, openDocument } = useAccessDocument();
  const { fetchById, fetchRetencionProveedorPdf } =
    useRetencionProveedorAsync();
  const [requestRetnecionSelected, setRequestRetencionSelected] =
    useState<RetencionResponseInterface>();
  const [requestDetailRetnecionSelected, setRequestDetailRetencionSelected] =
    useState<RetencionDetailInterface[]>([]);
  const requestId = useMemo(() => {
    const state =
      location.state || JSON.parse(localStorage.getItem('state') || '{}');
    const documentId = state.requestId;
    if (!documentId) return null;
    const [id, type] = documentId.split('-');
    const isValidType = Number(type) === DocumentTypeEnum.RETENCION_PROVEEDOR;

    return isValidType ? id : null;
  }, [location.state]);

  const { formState, setFormState } = useForm({
    retentionNumber: null,
    invoiceNumber: null,
    autorizationNumber: null,
    creationDate: new Date(),
    providerName: null,
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
                documentType: DocumentTypeEnum.RETENCION_PROVEEDOR,
              });
              openDocument({
                id: Number(requestId) - 1,
                navigation: () =>
                  navigate(PathEnum.RETENCION_PROVEEDOR + PathEnum.VIEW, {
                    state: {
                      requestId: Number(requestId) - 1,
                    },
                  }),
                documentType: DocumentTypeEnum.RETENCION_PROVEEDOR,
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
                documentType: DocumentTypeEnum.ORDEN_DE_PEDIDO,
              });
              openDocument({
                id: Number(requestId) + 1,
                navigation: () =>
                  navigate(PathEnum.ORDEN_PEDIDO + PathEnum.VIEW, {
                    state: {
                      requestId: Number(requestId) + 1,
                    },
                  }),
                documentType: DocumentTypeEnum.ORDEN_DE_PEDIDO,
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
        documentType: DocumentTypeEnum.RETENCION_PROVEEDOR,
      });
    }
    navigate(PathEnum.RETENCION_PROVEEDOR);
  };

  useEffect(() => {
    if (requestId) {
      const getRequesRentencion = async () => {
        return new Promise<void>(async (resolve, reject) => {
          try {
            const response = await fetchById(Number(requestId));
            if (response) {
              setRequestRetencionSelected(response);
              setRequestDetailRetencionSelected(response.details);

              setTitle(
                'Retención Proveedores (Modo Lectura) - N° ' +
                  response.retentionNumber
              );
              resolve();
            } else {
              handleCancel();
              enqueueSnackbar(`No se pudo abrir la retención seleccionada`, {
                variant: 'error',
              });
              reject();
            }
          } catch (error) {
            enqueueSnackbar('Existió un error de conexión', {
              variant: 'error',
            });
            reject(error);
          }
        });
      };
      try {
        Promise.all([getRequesRentencion()]);
      } catch (error) {
        enqueueSnackbar('Existió un error de conexión', { variant: 'error' });
      }
    }
  }, [requestId]);

  useEffect(() => {
    if (requestRetnecionSelected) {
      const creationDate: Date = new Date(
        requestRetnecionSelected?.creationDate
      );
      setFormState({
        retentionNumber: requestRetnecionSelected
          ? requestRetnecionSelected.retentionNumber
          : '',
        invoiceNumber: requestRetnecionSelected
          ? requestRetnecionSelected.invoiceNumber
          : '',
        autorizationNumber: requestRetnecionSelected
          ? requestRetnecionSelected.autorizationNumber
          : '',
        creationDate: creationDate,
        providerName: requestRetnecionSelected
          ? requestRetnecionSelected.providerName
          : '',
      });
    }
  }, [requestRetnecionSelected]);

  useEffect(() => {
    setRows(
      requestDetailRetnecionSelected &&
        requestDetailRetnecionSelected.length > 0
        ? requestDetailRetnecionSelected.map((item) => ({
            id: randomId(),
            name: item.name,
            base: item.base,
            type: item.type,
            code: item.code,
            percentage: item.percentage,
            value: item?.value?.toFixed(2),
          }))
        : []
    );
  }, [requestDetailRetnecionSelected]);

  return (
    <>
      <CardLayout
        title={title}
        cancelFunction={handleCancel}
        headerActions={navigateBetweenDocuments() ? headerComponents : null}
      >
        <RetencionProveedorForm formState={formState} rows={rows} />
        <Grid
          container
          direction="row"
          justifyContent="center"
          alignItems="center"
          sx={{ mt: 2 }}
        >
          <Button
            startIcon={<ExitToApp />}
            sx={{ margin: 2 }}
            onClick={handleCancel}
            style={{ width: '120px' }}
          >
            {'Salir'}
          </Button>
          <Button
            startIcon={<PictureAsPdf />}
            sx={{ margin: 2 }}
            onClick={() => {
              if (requestRetnecionSelected)
                fetchRetencionProveedorPdf(
                  requestRetnecionSelected.retentionId
                ).then((response) => {
                  downloadPdf(
                    response,
                    `retencion_${requestRetnecionSelected.retentionId}.pdf`
                  );
                });
            }}
            style={{ width: '130px' }}
          >
            {'Descargar PDF'}
          </Button>
        </Grid>
      </CardLayout>
    </>
  );
};
