'use client';
import { DocumentTypeEnum, PathEnum } from '@/enums';
import {
  useAccessDocument,
  useClienteAsync,
  useForm,
  useStyles,
} from '@/hooks';
import { CardLayout } from '@/modules/layout';
import { AddCircle, Info } from '@mui/icons-material';
import { PersonClientType } from '@/types';
import { ServerResponseType } from '@/store';
import { Autocomplete, Box, Button, Grid, TextField } from '@mui/material';
import axios from 'axios';
import { useSnackbar } from 'notistack';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getClientPersonaByParam } from '@/backend/tba';

export type FichaClientePageProps = {};

export const FichaClientePage: React.FC<FichaClientePageProps> = ({}) => {
  const styles = useStyles();

  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const { openDocument } = useAccessDocument();
  const [clientePersonaList, setClientePersonaList] = useState<
    PersonClientType[]
  >([]);
  const { formState, onAutocompleteChange, onResetForm } = useForm({
    cliente: null,
  });
  const [clientePersona, setClientePersona] = useState<PersonClientType>();
  const [showEditButton, setShowEditButton] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const { fetchClientPersonaByClientId } = useClienteAsync();

  const handleAutocompleteChange = async (
    event: React.SyntheticEvent<Element, Event>,
    inputValue: string
  ) => {
    if (event !== null) {
      event.preventDefault();
      setSearchTerm(inputValue);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response: ServerResponseType | undefined =
          await getClientPersonaByParam(searchTerm.toUpperCase());
        if (response) {
          if (response.status === 200) {
            setClientePersonaList(response.message);
          }
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          if (error.response?.status === 404) {
            setClientePersonaList([]);
            enqueueSnackbar('No se encontraron clientes', {
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
    if (searchTerm.length >= 3) {
      fetchData();
    }
  }, [searchTerm]);

  useEffect(() => {
    if (formState.cliente === null) {
      onResetForm();
      setSearchTerm('');
      setClientePersona({
        personId: null,
        clientId: null,
        personIdentification: '',
        personName: '',
        clientName: '',
        personEmail: '',
        authorizedQuota: null,
        usedQuota: null,
        overdraft: null,
        availableQuota: null,
        clientCategory: '',
        clientContact: '',
        personPhone: '',
        creditDays: null,
        creditObservation: '',
        taxIdentificationCode: '',
      });
      setShowEditButton(false);
    } else {
      const fetchGetClientData = async () => {
        fetchClientPersonaByClientId(formState.cliente.clientId).then(
          (response) => {
            if (response) {
              setClientePersona(response);
            }
          }
        );
      };
      fetchGetClientData();
      setShowEditButton(true);
    }
  }, [formState.cliente]);

  const headerComponents: React.ReactNode = (
    <Box sx={{ mt: 0.5 }}>
      {
        <Button
          variant="contained"
          color="primary"
          sx={{ mr: 1, width: '200px' }}
          startIcon={<AddCircle />}
          onClick={() => {
            navigate(PathEnum.FICHA_CLIENTE + PathEnum.NEW);
          }}
        >
          Nuevo Cliente
        </Button>
      }

      {showEditButton && (
        <Button
          variant="contained"
          color="secondary"
          sx={{ width: '200px' }}
          startIcon={<Info />}
          onClick={() => {
            if (clientePersona?.clientId) {
              openDocument({
                id: clientePersona.clientId,
                navigation: () =>
                  navigate(PathEnum.FICHA_CLIENTE + PathEnum.VIEW, {
                    state: {
                      clientId: clientePersona.clientId,
                    },
                  }),
                documentType: DocumentTypeEnum.CLIENTE,
              });
            }
          }}
        >
          Ver Cliente
        </Button>
      )}
    </Box>
  );

  return (
    <>
      <CardLayout
        title="FICHA CLIENTE"
        positionTitle="left"
        headerActions={headerComponents}
      >
        <Grid
          container
          spacing={2}
          alignItems="center"
          justifyContent="space-between"
        >
          <Grid item xs={12}>
            <Autocomplete
              key={formState.cliente?.personId}
              className={styles.genericFieldStyle}
              options={clientePersonaList}
              getOptionLabel={(option) =>
                `${option.personName} - ${option.personIdentification}`
              }
              style={{ width: '100%' }}
              onChange={(event, value) =>
                onAutocompleteChange(event, 'cliente', value)
              }
              onInputChange={handleAutocompleteChange}
              value={formState.cliente}
              isOptionEqualToValue={(option, value) =>
                option?.personId === value?.personId
              }
              filterOptions={(options) => options}
              autoHighlight
              autoSelect
              fullWidth
              handleHomeEndKeys
              noOptionsText="Sin resultados"
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Cliente"
                  variant="outlined"
                  InputProps={{
                    ...params.InputProps,
                    className: styles.textWhiteStyle,
                  }}
                  InputLabelProps={{
                    ...params.InputLabelProps,
                    className: styles.textGreenStyle,
                  }}
                />
              )}
            />
          </Grid>
          {formState.cliente !== null && (
            <>
              <Grid item xs={6}>
                <TextField
                  label="RUC"
                  value={
                    clientePersona?.personIdentification
                      ? clientePersona?.personIdentification
                      : ''
                  }
                  fullWidth
                  InputProps={{
                    readOnly: true,
                    className: styles.textWhiteStyle,
                  }}
                  InputLabelProps={{
                    shrink: clientePersona?.personIdentification ? true : false,
                    className: styles.textGreenStyle,
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Razon Social"
                  value={
                    clientePersona?.personName ? clientePersona?.personName : ''
                  }
                  fullWidth
                  InputProps={{
                    readOnly: true,
                    className: styles.textWhiteStyle,
                  }}
                  InputLabelProps={{
                    shrink: clientePersona?.personName ? true : false,
                    className: styles.textGreenStyle,
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Correo"
                  value={
                    clientePersona?.personEmail
                      ? clientePersona?.personEmail
                      : ''
                  }
                  fullWidth
                  InputProps={{
                    readOnly: true,
                    className: styles.textWhiteStyle,
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Cupo Autorizado"
                  type="number"
                  value={clientePersona?.authorizedQuota}
                  fullWidth
                  InputProps={{
                    readOnly: true,
                    className: styles.textWhiteStyle,
                    startAdornment: '$',
                  }}
                  InputLabelProps={{
                    shrink:
                      clientePersona?.authorizedQuota !== null ||
                      clientePersona?.authorizedQuota !== undefined
                        ? true
                        : false,
                    className: styles.textGreenStyle,
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Cupo Utilizado"
                  type="number"
                  value={clientePersona?.usedQuota}
                  fullWidth
                  InputProps={{
                    readOnly: true,
                    className: styles.textWhiteStyle,
                    startAdornment: '$',
                  }}
                  InputLabelProps={{
                    shrink:
                      clientePersona?.usedQuota !== null ||
                      clientePersona?.usedQuota !== undefined
                        ? true
                        : false,
                    className: styles.textGreenStyle,
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Sobre Cupo"
                  type="number"
                  value={clientePersona?.overdraft}
                  fullWidth
                  InputProps={{
                    readOnly: true,
                    className: styles.textWhiteStyle,
                    startAdornment: '$',
                  }}
                  InputLabelProps={{
                    shrink:
                      clientePersona?.overdraft !== null ||
                      clientePersona?.overdraft !== undefined
                        ? true
                        : false,
                    className: styles.textGreenStyle,
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Cupo Disponible"
                  type="number"
                  value={clientePersona?.availableQuota}
                  inputProps={{ style: { textTransform: 'uppercase' } }}
                  InputProps={{
                    readOnly: true,
                    className: styles.textWhiteStyle,
                    startAdornment: '$',
                  }}
                  InputLabelProps={{
                    shrink:
                      clientePersona?.availableQuota !== null ||
                      clientePersona?.availableQuota !== undefined
                        ? true
                        : false,
                  }}
                  fullWidth
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Tipo Cliente"
                  value={
                    clientePersona?.clientCategory
                      ? clientePersona?.clientCategory
                      : ''
                  }
                  fullWidth
                  InputProps={{
                    readOnly: true,
                    className: styles.textWhiteStyle,
                  }}
                  InputLabelProps={{
                    shrink: clientePersona?.clientCategory ? true : false,
                    className: styles.textGreenStyle,
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Contacto"
                  value={
                    clientePersona?.personEmail
                      ? clientePersona?.personEmail
                      : ''
                  }
                  fullWidth
                  InputProps={{
                    readOnly: true,
                    className: styles.textWhiteStyle,
                  }}
                  InputLabelProps={{
                    shrink: clientePersona?.personEmail ? true : false,
                    className: styles.textGreenStyle,
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Teléfono"
                  value={
                    clientePersona?.personPhone
                      ? clientePersona?.personPhone
                      : ''
                  }
                  fullWidth
                  InputProps={{
                    readOnly: true,
                    className: styles.textWhiteStyle,
                  }}
                  InputLabelProps={{
                    shrink: clientePersona?.personPhone ? true : false,
                    className: styles.textGreenStyle,
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Días Crédito"
                  value={
                    clientePersona?.creditDays ? clientePersona?.creditDays : ''
                  }
                  fullWidth
                  InputProps={{
                    readOnly: true,
                    className: styles.textWhiteStyle,
                  }}
                  InputLabelProps={{
                    shrink: clientePersona?.creditDays ? true : false,
                    className: styles.textGreenStyle,
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Observación"
                  value={
                    clientePersona?.creditObservation
                      ? clientePersona?.creditObservation
                      : ''
                  }
                  fullWidth
                  InputProps={{
                    readOnly: true,
                    className: styles.textWhiteStyle,
                  }}
                  InputLabelProps={{
                    shrink: clientePersona?.creditObservation ? true : false,
                    className: styles.textGreenStyle,
                  }}
                />
              </Grid>
            </>
          )}
        </Grid>
      </CardLayout>
    </>
  );
};
