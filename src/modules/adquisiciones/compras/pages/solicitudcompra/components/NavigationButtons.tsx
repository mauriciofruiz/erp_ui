import React from 'react';
import { Box, Button, Tooltip } from '@mui/material';
import { SkipNext, SkipPrevious } from '@mui/icons-material';
import { DocumentTypeEnum, PathEnum } from '@/enums';

interface NavigationButtonsProps {
  requestId: string | number | undefined;
  onCloseDocument: (params: { id: number; documentType: DocumentTypeEnum }) => void;
  onOpenDocument: (params: { id: number; navigation: () => void; documentType: DocumentTypeEnum }) => void;
  navigate: (path: string, options?: any) => void;
}

export const NavigationButtons: React.FC<NavigationButtonsProps> = ({
  requestId,
  onCloseDocument,
  onOpenDocument,
  navigate,
}) => {
  const handlePrevious = () => {
    if (requestId) {
      onCloseDocument({
        id: Number(requestId),
        documentType: DocumentTypeEnum.SOLICITUD_COMPRA,
      });
      onOpenDocument({
        id: Number(requestId) - 1,
        navigation: () =>
          navigate(PathEnum.SOLICITUD_COMPRA + PathEnum.VIEW, {
            state: {
              requestId: Number(requestId) - 1,
            },
          }),
        documentType: DocumentTypeEnum.SOLICITUD_COMPRA,
      });
    }
  };

  const handleNext = () => {
    if (requestId) {
      onCloseDocument({
        id: Number(requestId),
        documentType: DocumentTypeEnum.SOLICITUD_COMPRA,
      });
      onOpenDocument({
        id: Number(requestId) + 1,
        navigation: () =>
          navigate(PathEnum.SOLICITUD_COMPRA + PathEnum.VIEW, {
            state: {
              requestId: Number(requestId) + 1,
            },
          }),
        documentType: DocumentTypeEnum.SOLICITUD_COMPRA,
      });
    }
  };

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
            onClick={handlePrevious}
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
            onClick={handleNext}
          />
        </Tooltip>
      </div>
    </Box>
  );
};
