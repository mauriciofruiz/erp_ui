import { createApiConfig } from '@/backend';
import { tipoIngresoType } from '@/types';
import axios, { AxiosResponse } from 'axios';
import { useSnackbar } from 'notistack';
import React, { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tooltip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  Grid,
  TextField,
  FormControlLabel,
  Switch,
  Checkbox,
  Divider,
  TableFooter,
  Button,
} from '@mui/material';
import { useStyles } from '@/hooks';
import {
  AddCircle as AddCircleIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { CardLayout, PaperComponent } from '@/modules/layout';
import getServiceUrls from '@/backend/servicesUrl';

export type TipoIngresoPageProps = {};

export const TipoIngresoPage: React.FC<TipoIngresoPageProps> = ({}) => {
  const serviceUrls = getServiceUrls();

  const api = createApiConfig(serviceUrls.tbaServiceUrl);

  const { enqueueSnackbar } = useSnackbar();

  const styles = useStyles();

  const [open, setOpen] = useState(false);

  const [tipoIngresoList, setTipoIngresoList] = useState<
    tipoIngresoType[] | null
  >(null);

  const [selectedIngresoEgreso, setSelectedIngresoEgreso] =
    useState<tipoIngresoType | null>(null);

  useEffect(() => {
    const getAllTipoIngreso = async () => {
      try {
        const { data }: AxiosResponse = await api.get(`tipo_ingreso/get`);

        setTipoIngresoList(data);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          if (error.response) {
            enqueueSnackbar(error.response.data, {
              variant: 'error',
            });
          } else {
            enqueueSnackbar('Error Del Servidor: ' + error.message, {
              variant: 'error',
            });
          }
        }
      }
    };
    getAllTipoIngreso();
  }, []);

  const handleSelectIngreso = (selectedIngreso: tipoIngresoType) => {
    const getTipoIngresoEgreso = async () => {
      try {
        const { data }: AxiosResponse = await api.get(
          `tipo_ingreso/get/${selectedIngreso.incomeTypeId}`
        );

        setSelectedIngresoEgreso(data);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          if (error.response) {
            enqueueSnackbar(error.response.data, {
              variant: 'error',
            });
          } else {
            enqueueSnackbar('Error Del Servidor: ' + error.message, {
              variant: 'error',
            });
          }
        }
      }
    };
    getTipoIngresoEgreso();
    setOpen(true);
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        PaperComponent={PaperComponent}
        aria-labelledby="draggable-dialog-title"
        maxWidth="md"
        fullWidth
      >
        <DialogTitle
          style={{
            cursor: 'move',
            textAlign: 'center',
          }}
          id="draggable-dialog-title"
          sx={{ mt: 2 }}
        >
          EDITAR INGRESO
        </DialogTitle>
        <DialogContent>
          <form>
            <Grid container spacing={2} alignItems="center" sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  label="Nombre"
                  value={selectedIngresoEgreso?.incomeTypeName}
                  InputLabelProps={{
                    shrink: selectedIngresoEgreso?.incomeTypeName
                      ? true
                      : false,
                  }}
                  fullWidth
                />
              </Grid>
              <Grid
                item
                xs={4}
                container
                justifyContent="center"
                alignItems="center"
              >
                <FormControlLabel
                  control={
                    <Switch
                      checked={selectedIngresoEgreso?.isContributable}
                      // onChange={(event) =>
                      //   handleChangeBoolean(event, 'accountStatusBank')
                      // }
                    />
                  }
                  label="Aportable"
                />
              </Grid>
              <Grid
                item
                xs={4}
                container
                justifyContent="center"
                alignItems="center"
              >
                <FormControlLabel
                  control={
                    <Switch
                      checked={selectedIngresoEgreso?.editable}
                      // onChange={(event) =>
                      //   handleChangeBoolean(event, 'accountStatusBank')
                      // }
                    />
                  }
                  label="Editable"
                />
              </Grid>
              <Grid
                item
                xs={4}
                container
                justifyContent="center"
                alignItems="center"
              >
                <FormControlLabel
                  control={
                    <Switch
                      checked={selectedIngresoEgreso?.isRole}
                      // onChange={(event) =>
                      //   handleChangeBoolean(event, 'accountStatusBank')
                      // }
                    />
                  }
                  label="Mostrar En Rol"
                />
              </Grid>
              <Divider sx={{ height: '2px', margin: 3, width: '98%' }} />
              <Grid item xs={12}>
                <div className={styles.tableContainer}>
                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableCell colSpan={6}>Cuentas</TableCell>
                      </TableHead>
                      <TableBody>
                        {selectedIngresoEgreso?.typeIngEgr?.map(
                          (cuenta, index) => (
                            <TableRow key={index}>
                              <TableCell style={{ width: '20%' }}>
                                {cuenta.accountName}
                              </TableCell>
                              <TableCell>{cuenta.accountNumber}</TableCell>
                              <TableCell>
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      checked={cuenta.isAdmin}
                                      // onChange={(event) =>
                                      //   handleChangeBoolean(event, 'accountStatusBank')
                                      // }
                                    />
                                  }
                                  label="Administrativo"
                                />
                              </TableCell>
                              <TableCell>
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      checked={cuenta.isProduction}
                                      // onChange={(event) =>
                                      //   handleChangeBoolean(event, 'accountStatusBank')
                                      // }
                                    />
                                  }
                                  label="Producción"
                                />
                              </TableCell>
                              <TableCell>
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      checked={cuenta.isSale}
                                      // onChange={(event) =>
                                      //   handleChangeBoolean(event, 'accountStatusBank')
                                      // }
                                    />
                                  }
                                  label="Ventas"
                                />
                              </TableCell>
                              <TableCell>
                                <div className={styles.iconContainer}>
                                  <Tooltip title="Desactivar Cuenta">
                                    <IconButton
                                      size="small"
                                      style={{
                                        color: '#fff',
                                        backgroundColor: '#92C83E',
                                      }}
                                      // onClick={() =>
                                      //   handleSelectIngreso(tipoIngreso)
                                      // }
                                    >
                                      <DeleteIcon />
                                    </IconButton>
                                  </Tooltip>
                                </div>
                              </TableCell>
                            </TableRow>
                          )
                        )}
                      </TableBody>
                      <TableFooter>
                        <TableRow>
                          <TableCell
                            colSpan={6}
                            style={{ textAlign: 'center' }}
                          >
                            <Tooltip title="Agregar Una Cuenta Nueva">
                              <Button
                                // onClick={() => handleNewRow(1)}
                                startIcon={<AddCircleIcon />}
                              >
                                Nueva Cuenta
                              </Button>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      </TableFooter>
                    </Table>
                  </TableContainer>
                </div>
              </Grid>
            </Grid>
          </form>
        </DialogContent>
      </Dialog>
      <CardLayout title="TIPO INGRESO" marginTop={10}>
        <div className={styles.tableContainer}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nombre</TableCell>
                  <TableCell>Aportable</TableCell>
                  <TableCell>Editable</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tipoIngresoList?.map((tipoIngreso, index) => (
                  <TableRow key={index}>
                    <TableCell>{tipoIngreso.incomeTypeName ?? ''}</TableCell>
                    <TableCell>
                      {tipoIngreso.isContributable
                        ? 'Aportable'
                        : 'No Aportable'}
                    </TableCell>
                    <TableCell>
                      {tipoIngreso.editable ? 'Editable' : 'No Editable'}
                    </TableCell>
                    <TableCell>
                      {tipoIngreso.isCancelled ? 'Deshabilitada' : 'Habilitada'}
                    </TableCell>
                    <TableCell>
                      <div className={styles.iconContainer}>
                        <Tooltip title="Editar Ingreso">
                          <IconButton
                            onClick={() => handleSelectIngreso(tipoIngreso)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      </CardLayout>
    </>
  );
};
