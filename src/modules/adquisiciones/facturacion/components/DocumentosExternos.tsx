import { DocumentTypeEnum, PathEnum } from '@/enums';
import {
  FormState,
  useAccessDocument,
  useAllowGlobal,
  useStyles,
} from '@/hooks';
import {
  AddCard,
  AttachMoney,
  EventSeat,
  KeyboardArrowDown,
  Receipt,
  Shop2,
} from '@mui/icons-material';
import { Box, Button, Grid, Menu, Typography } from '@mui/material';
import { useState } from 'react';
import { Link } from 'react-router-dom';

interface DocumentosExternosProps {
  formState: FormState;
}

export const DocumentosExternos = (props: DocumentosExternosProps) => {
  const { formState } = props;

  const { allowCheckEntry } = useAllowGlobal();

  const styles = useStyles();

  const { openExternalDocument } = useAccessDocument();
  //  * * * * * * * * * *  HANDLE MENU DOCUMENTOS ADJUNTOS * * * * * * * * * * * * *
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  return (
    <>
      {formState.providerInvoiceId !== null && allowCheckEntry() && (
        <Grid item xs={4}>
          <Box display="width" justifyContent="center">
            <Button
              id="demo-customized-button"
              aria-controls={open ? 'demo-customized-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={open ? 'true' : undefined}
              variant="contained"
              disableElevation
              onClick={handleClick}
              endIcon={<KeyboardArrowDown />}
              fullWidth
            >
              Documentos Adjuntos
            </Button>
            <Menu
              id="demo-customized-menu"
              MenuListProps={{
                'aria-labelledby': 'demo-customized-button',
              }}
              anchorEl={anchorEl}
              open={open}
              onClose={() => {
                setAnchorEl(null);
              }}
              classes={{ paper: styles.paperMenuStyle }}
            >
              {formState.relatedDocumentId &&
                formState.relatedDocumentId !== null && (
                  <Button
                    onClick={() =>
                      openExternalDocument({
                        id: formState.relatedDocumentId,
                        documentType: DocumentTypeEnum.ORDEN_COMPRA,
                        options: {
                          state: {
                            requestId: `${formState.relatedDocumentId}-${DocumentTypeEnum.ORDEN_COMPRA}`,
                          },
                        },
                        target: PathEnum.ORDEN_COMPRA + PathEnum.VIEW,
                      })
                    }
                    style={{
                      backgroundColor: 'transparent',
                      textTransform: 'none',
                    }}
                  >
                    <Shop2 style={{ marginRight: '10px' }} />
                    <Typography>Orden De Compra</Typography>
                  </Button>
                )}
              {formState.entryId && (
                <Link
                  to={`${PathEnum.ASIENTO_EXTERNAL_VIEW}${formState.entryId}`}
                  target="_blank"
                  style={{
                    textDecoration: 'none',
                    color: 'inherit',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <EventSeat
                    style={{ marginLeft: '5px', marginRight: '10px' }}
                  />
                  <Typography>Asiento Contable</Typography>
                </Link>
              )}
              {formState.reserveEntryId && (
                <Link
                  to={`${PathEnum.ASIENTO_EXTERNAL_VIEW}${formState.reserveEntryId}`}
                  target="_blank"
                  style={{
                    textDecoration: 'none',
                    color: 'inherit',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <EventSeat
                    style={{ marginLeft: '5px', marginRight: '10px' }}
                  />
                  <Typography>Asiento Contable 1</Typography>
                </Link>
              )}
              {formState.extraEntryId && (
                <Link
                  to={`${PathEnum.ASIENTO_EXTERNAL_VIEW}${formState.extraEntryId}`}
                  target="_blank"
                  style={{
                    textDecoration: 'none',
                    color: 'inherit',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <EventSeat
                    style={{ marginLeft: '5px', marginRight: '10px' }}
                  />
                  <Typography>Asiento Contable 2</Typography>
                </Link>
              )}
              {formState.externalDocumentsId.creditNoteIds &&
                formState.externalDocumentsId.creditNoteIds.length > 0 &&
                formState.externalDocumentsId.creditNoteIds.map(
                  (creditNoteId: number, index: number) => (
                    <Button
                      onClick={() =>
                        openExternalDocument({
                          id: creditNoteId,
                          documentType: DocumentTypeEnum.NOTA_CREDITO_COMPRA,
                          options: {
                            state: {
                              requestId: `${creditNoteId}-${DocumentTypeEnum.NOTA_CREDITO_COMPRA}`,
                            },
                          },
                          target: PathEnum.NOTA_CREDITO + PathEnum.VIEW,
                        })
                      }
                      style={{
                        backgroundColor: 'transparent',
                        textTransform: 'none',
                      }}
                    >
                      <AddCard style={{ marginRight: '10px' }} />
                      <Typography>{`Nota De Crédito ${index + 1}`}</Typography>
                    </Button>
                  )
                )}
              {formState.externalDocumentsId.retentionIds &&
                formState.externalDocumentsId.retentionIds.length > 0 &&
                formState.externalDocumentsId.retentionIds.map(
                  (retentionIds: number, index: number) => (
                    <Button
                      onClick={() =>
                        openExternalDocument({
                          id: retentionIds,
                          documentType: DocumentTypeEnum.RETENCION_PROVEEDOR,
                          options: {
                            state: {
                              requestId: `${retentionIds}-${DocumentTypeEnum.RETENCION_PROVEEDOR}`,
                            },
                          },
                          target: PathEnum.RETENCION_PROVEEDOR + PathEnum.VIEW,
                        })
                      }
                      style={{
                        backgroundColor: 'transparent',
                        textTransform: 'none',
                      }}
                      sx={{ width: '100%', justifyContent: 'flex-start' }}
                    >
                      <Receipt style={{ marginRight: '10px' }} />
                      <Typography>{`Retención ${index + 1}`}</Typography>
                    </Button>
                  )
                )}
              {formState.externalDocumentsId.paymentIds &&
                formState.externalDocumentsId.paymentIds.length > 0 &&
                formState.externalDocumentsId.paymentIds.map(
                  (paymentIds: number, index: number) => (
                    <Button
                      onClick={() =>
                        openExternalDocument({
                          id: paymentIds,
                          documentType: DocumentTypeEnum.PAGO,
                          options: {
                            state: {
                              paymentId: `${paymentIds}-${DocumentTypeEnum.PAGO}`,
                            },
                          },
                          target: PathEnum.PAGO + PathEnum.VIEW,
                        })
                      }
                      style={{
                        backgroundColor: 'transparent',
                        textTransform: 'none',
                      }}
                      sx={{ width: '100%', justifyContent: 'flex-start' }}
                    >
                      <AttachMoney style={{ marginRight: '10px' }} />
                      <Typography>{`Pago ${index + 1}`}</Typography>
                    </Button>
                  )
                )}
            </Menu>
          </Box>
        </Grid>
      )}
    </>
  );
};
