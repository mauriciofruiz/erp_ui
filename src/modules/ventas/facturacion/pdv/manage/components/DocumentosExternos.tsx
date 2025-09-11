import { ComprobanteTypeEnum, DocumentTypeEnum, PathEnum } from '@/enums';
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
      {formState.invoiceId !== null && allowCheckEntry() ? (
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
              {formState.externalDocumentsId.creditNoteIds &&
                formState.externalDocumentsId.creditNoteIds.length > 0 &&
                formState.externalDocumentsId.creditNoteIds.map(
                  (creditNoteId: number, index: number) => (
                    <Button
                      onClick={() =>
                        openExternalDocument({
                          id: creditNoteId,
                          documentType: DocumentTypeEnum.NOTA_CREDITO_VENTA,
                          options: {
                            state: {
                              ncClienteIdOpened: `${creditNoteId}-${ComprobanteTypeEnum.NOTA_DE_CREDITO}`,
                            },
                          },
                          target: PathEnum.NOTA_CREDITO_CLIENTE + PathEnum.VIEW,
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
              {formState.externalDocumentsId.debitNoteIds &&
                formState.externalDocumentsId.debitNoteIds.length > 0 &&
                formState.externalDocumentsId.debitNoteIds.map(
                  (debitNoteIds: number, index: number) => (
                    <Button
                      onClick={() =>
                        openExternalDocument({
                          id: debitNoteIds,
                          documentType: DocumentTypeEnum.NOTA_DEBITO_VENTA,
                          options: {
                            state: {
                              ndClienteIdOpened: `${debitNoteIds}-${ComprobanteTypeEnum.NOTA_DE_DEBITO}`,
                            },
                          },
                          target: PathEnum.NOTA_DEBITO_CLIENTE + PathEnum.VIEW,
                        })
                      }
                      style={{
                        backgroundColor: 'transparent',
                        textTransform: 'none',
                      }}
                    >
                      <AddCard style={{ marginRight: '10px' }} />
                      <Typography>{`Nota De Débito ${index + 1}`}</Typography>
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
                          documentType: DocumentTypeEnum.RETENCION_VENTA,
                          options: {
                            state: {
                              retencionIdOpened: `${retentionIds}-${ComprobanteTypeEnum.COMPROBANTE_DE_RETENCION}`,
                            },
                          },
                          target: PathEnum.RETENCION_CLIENTE + PathEnum.VIEW,
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
              {formState.externalDocumentsId.chargeIds &&
                formState.externalDocumentsId.chargeIds.length > 0 &&
                formState.externalDocumentsId.chargeIds.map(
                  (chargeIds: number, index: number) => (
                    <Button
                      onClick={() =>
                        openExternalDocument({
                          id: chargeIds,
                          documentType: DocumentTypeEnum.COBRO,
                          options: {
                            state: {
                              cobroClienteIdOpened: `${chargeIds}-${DocumentTypeEnum.COBRO}`,
                            },
                          },
                          target: PathEnum.COBRO + PathEnum.VIEW,
                        })
                      }
                      style={{
                        backgroundColor: 'transparent',
                        textTransform: 'none',
                      }}
                      sx={{ width: '100%', justifyContent: 'flex-start' }}
                    >
                      <AttachMoney style={{ marginRight: '10px' }} />
                      <Typography>{`Cobro ${index + 1}`}</Typography>
                    </Button>
                  )
                )}
            </Menu>
          </Box>
        </Grid>
      ) : (
        <Grid item xs={4}></Grid>
      )}
    </>
  );
};
