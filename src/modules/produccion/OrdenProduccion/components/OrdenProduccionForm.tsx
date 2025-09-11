import { getBodegasProduction, getSucursalById } from '@/backend';
import { EstadoOrdenProduccionEnum, PathEnum } from '@/enums';
import { TipoBodegaEnum } from '@/enums/TipoBodegaEnum';
import {
  FormState,
  StyledDatePicker,
  useAllowGlobal,
  useStyles,
} from '@/hooks';
import { ServerResponseType } from '@/store';
import { BodegaGetInterface, SucursalType } from '@/types';
import { EventSeat, KeyboardArrowDown } from '@mui/icons-material';
import { Box, Button, Grid, Menu, TextField, Typography } from '@mui/material';
import axios from 'axios';
import { enqueueSnackbar } from 'notistack';
import React, { ChangeEvent, useEffect } from 'react';
import { Link } from 'react-router-dom';

export type OrdenProdFormProps = {
  formState: FormState;
  setFormState: React.Dispatch<React.SetStateAction<FormState>>;
  createMode: boolean;
  editMode: boolean;
  onAutocompleteChange: (
    event: React.ChangeEvent<{}>,
    name: string,
    value: any,
    index?: number
  ) => void;
  onInputChange: (
    event: ChangeEvent<HTMLInputElement>,
    listName?: string,
    index?: number
  ) => void;
  sucursal: SucursalType[];
  setSucusral: React.Dispatch<React.SetStateAction<SucursalType[]>>;
  isApprovable: boolean;
  wareHouseProduce: BodegaGetInterface[];
  setWareHouseProduce: React.Dispatch<
    React.SetStateAction<BodegaGetInterface[]>
  >;
  onInputJustNumber: (event: ChangeEvent<HTMLInputElement>) => void;
  requestId: number;
};

export const OrdenProduccionForm: React.FC<OrdenProdFormProps> = ({
  formState,
  createMode,
  editMode,
  onInputChange,
  setSucusral,
  setWareHouseProduce,
  onInputJustNumber,
}) => {
  const styles = useStyles();
  const { enableAdmin } = useAllowGlobal();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  useEffect(() => {
    const fetchSucursalData = async () => {
      try {
        const response: SucursalType | ServerResponseType =
          await getSucursalById(formState.branchProduceId);
        if (response) {
          if (response) {
            const sucursal: SucursalType[] = [response as SucursalType];
            setSucusral(sucursal);
          }
        } else {
          setSucusral([]);
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          if (error.response?.status === 404) {
            setSucusral([]);
            enqueueSnackbar('No se ha encontrado la sucursal buscadoa', {
              variant: 'info',
            });
          } else {
            enqueueSnackbar('Error Del Servidor: ' + error.message, {
              variant: 'error',
            });
          }
        }
      }
    };
    if (formState.branchProduceId) {
      fetchSucursalData();
    }
  }, [formState.branchProduceId]);

  useEffect(() => {
    const getWarehouses = async () => {
      const response: ServerResponseType | undefined =
        await getBodegasProduction(TipoBodegaEnum.BODEGA_PRODUCCION);
      if (response) {
        if (response.status === 200) {
          setWareHouseProduce(response.message);
        } else {
          setWareHouseProduce([]);
          enqueueSnackbar(
            `No se pudieron cargar las bodegas: ${response.message}`,
            {
              variant: 'error',
            }
          );
        }
      }
    };
    getWarehouses();
  }, []);

  return (
    <>
      <Box sx={{ width: '100%', bgcolor: 'background.paper', mb: 2 }}>
        <Box sx={{ p: 3 }}>
          <Grid container spacing={2} alignItems="center" sx={{ mt: 1 }}>
            <Grid item xs={4}>
              <TextField
                name="branchRequest"
                label="Sucursal Solicita"
                value={
                  formState.branchRequest !== null
                    ? formState.branchRequest
                    : ''
                }
                InputProps={{
                  readOnly: true,
                }}
                InputLabelProps={{
                  shrink:
                    formState.branchRequest !== '' &&
                    formState.branchRequest != null
                      ? true
                      : false,
                }}
                fullWidth
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                name="branchDestiny"
                label="Sucursal Destino"
                value={
                  formState.branchDestiny !== null
                    ? formState.branchDestiny
                    : ''
                }
                InputProps={{
                  readOnly: true,
                }}
                InputLabelProps={{
                  shrink:
                    formState.branchDestiny !== '' &&
                    formState.branchDestiny != null
                      ? true
                      : false,
                }}
                fullWidth
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                name="branchProduce"
                label="Sucursal Produce"
                value={
                  formState.branchProduce !== null
                    ? formState.branchProduce
                    : ''
                }
                InputProps={{
                  readOnly: true,
                }}
                InputLabelProps={{
                  shrink:
                    formState.branchProduce !== '' &&
                    formState.branchProduce != null
                      ? true
                      : false,
                }}
                fullWidth
              />
            </Grid>
            <Grid item xs={4}>
              <StyledDatePicker
                label="Fecha Elaboración"
                readOnly={true}
                views={['year', 'month', 'day']}
                //minDate={new Date()}
                format="dd/MM/yyyy"
                value={
                  formState.elaborationDate !== null
                    ? formState.elaborationDate
                    : new Date()
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
                      shrink: formState.elaborationDate ? true : false,
                    },
                  },
                }}
              />
            </Grid>
            <Grid item xs={4}>
              <StyledDatePicker
                label="Fecha Finalización"
                readOnly
                views={['year', 'month', 'day']}
                format="dd/MM/yyyy"
                value={formState.endDate !== null ? formState.endDate : null}
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
            <Grid item xs={4}>
              <TextField
                name="requestNumber"
                label="Número Pedido"
                value={
                  formState.requestNumber !== '' ? formState.requestNumber : ''
                }
                onChange={onInputJustNumber}
                InputProps={{
                  readOnly: true,
                }}
                inputProps={{ style: { textTransform: 'uppercase' } }}
                InputLabelProps={{
                  shrink:
                    formState.requestNumber !== '' &&
                    formState.requestNumber !== null
                      ? true
                      : false,
                }}
                fullWidth
              />
            </Grid>
            <Grid item xs={8}>
              <TextField
                name="observation"
                label="Observación"
                value={
                  formState.observation !== null ? formState.observation : ''
                }
                onChange={onInputChange}
                InputProps={{
                  readOnly: !createMode && !editMode,
                }}
                inputProps={{ style: { textTransform: 'uppercase' } }}
                InputLabelProps={{
                  shrink:
                    formState.observation !== '' &&
                    formState.observation != null
                      ? true
                      : false,
                }}
                fullWidth
              />
            </Grid>
            {formState.orderStatusId === EstadoOrdenProduccionEnum.CERRADO &&
              enableAdmin() && (
                <Grid item xs={4}>
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
                    <Link
                      to={`${PathEnum.ASIENTO_EXTERNAL_VIEW}${formState.rawMaterialEntryId}`}
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
                      <Typography>Asiento Materia Prima</Typography>
                    </Link>
                    <Link
                      to={`${PathEnum.ASIENTO_EXTERNAL_VIEW}${formState.workforceEntryId}`}
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
                      <Typography>Asiento Mano Obra</Typography>
                    </Link>
                    <Link
                      to={`${PathEnum.ASIENTO_EXTERNAL_VIEW}${formState.cifEntryId}`}
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
                      <Typography>Asiento CIF</Typography>
                    </Link>
                    {formState.closingMPEntryId && (
                      <Link
                        to={`${PathEnum.ASIENTO_EXTERNAL_VIEW}${formState.closingMPEntryId}`}
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
                        <Typography>Asiento Cierre MP</Typography>
                      </Link>
                    )}
                    {formState.closingMOEntryId && (
                      <Link
                        to={`${PathEnum.ASIENTO_EXTERNAL_VIEW}${formState.closingMOEntryId}`}
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
                        <Typography>Asiento Cierre MO</Typography>
                      </Link>
                    )}
                    {formState.closingCIFEntryId && (
                      <Link
                        to={`${PathEnum.ASIENTO_EXTERNAL_VIEW}${formState.closingCIFEntryId}`}
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
                        <Typography>Asiento Cierre CIF</Typography>
                      </Link>
                    )}
                  </Menu>
                </Grid>
              )}
          </Grid>
        </Box>
      </Box>
    </>
  );
};
