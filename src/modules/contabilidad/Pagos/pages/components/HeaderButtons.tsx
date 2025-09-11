import { DocumentTypeEnum, PathEnum } from '@/enums';
import { CloseDocumentParams, OpenDocumentParams } from '@/hooks';
import { SkipNext, SkipPrevious } from '@mui/icons-material';
import { Box, Button, Tooltip } from '@mui/material';
import { NavigateFunction } from 'react-router-dom';

export const HeaderButtons = (
  facturaId: number,
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
                id: facturaId,
                documentType: DocumentTypeEnum.FACTURA_COMPRA,
              });
              openDocument({
                id: Number(facturaId) - 1,
                navigation: () =>
                  navigate(PathEnum.FACTURA_PROVEEDOR + PathEnum.VIEW, {
                    state: {
                      facturaXml: Number(facturaId) - 1,
                    },
                  }),
                documentType: DocumentTypeEnum.FACTURA_COMPRA,
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
                id: facturaId,
                documentType: DocumentTypeEnum.FACTURA_COMPRA,
              });
              openDocument({
                id: Number(facturaId) + 1,
                navigation: () =>
                  navigate(PathEnum.FACTURA_PROVEEDOR + PathEnum.VIEW, {
                    state: {
                      receptionId: Number(facturaId) + 1,
                    },
                  }),
                documentType: DocumentTypeEnum.FACTURA_COMPRA,
              });
            }}
          />
        </Tooltip>
      </div>
    </Box>
  );
};
