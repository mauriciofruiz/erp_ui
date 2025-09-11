import { DocumentTypeEnum, PathEnum } from '@/enums';
import { CloseDocumentParams, OpenDocumentParams } from '@/hooks';
import { SkipNext, SkipPrevious } from '@mui/icons-material';
import { Box, Button, Tooltip } from '@mui/material';
import { NavigateFunction } from 'react-router-dom';

export const HeaderButtonsOCExt = (
  orderId: number,
  closeDocument: ({ id, documentType }: CloseDocumentParams) => Promise<void>,
  openDocument: ({
    id,
    navigation,
    documentType,
  }: OpenDocumentParams) => Promise<void>,
  navigate: NavigateFunction
): React.ReactNode => {
  return (
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
                id: orderId,
                documentType: DocumentTypeEnum.ORDEN_COMPRA,
              });
              openDocument({
                id: Number(orderId) - 1,
                navigation: () =>
                  navigate(PathEnum.ORDEN_COMPRA_EXTERIOR + PathEnum.VIEW, {
                    state: {
                      orderId: Number(orderId) - 1,
                    },
                  }),
                documentType: DocumentTypeEnum.ORDEN_COMPRA,
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
                id: orderId,
                documentType: DocumentTypeEnum.ORDEN_COMPRA,
              });
              openDocument({
                id: Number(orderId) + 1,
                navigation: () =>
                  navigate(PathEnum.ORDEN_COMPRA_EXTERIOR + PathEnum.VIEW, {
                    state: {
                      receptionId: Number(orderId) + 1,
                    },
                  }),
                documentType: DocumentTypeEnum.ORDEN_COMPRA,
              });
            }}
          />
        </Tooltip>
      </div>
    </Box>
  );
};
