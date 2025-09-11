'use client';
import { DocumentTypeEnum, PathEnum } from '@/enums';
import {
  useAccessDocument,
  useAllowGlobal,
  useForm,
  useProveedorAsync,
  useStyles,
} from '@/hooks';
import { CardLayout } from '@/modules/layout';
import { AddCircle, Info } from '@mui/icons-material';
import { PersonProviderType } from '@/types';
import { Autocomplete, Box, Button, Grid, TextField } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export type FichaProveedorPageProps = {};

export const FichaProveedorPage: React.FC<FichaProveedorPageProps> = ({}) => {
  const styles = useStyles();

  const { fetchByParam } = useProveedorAsync();

  const navigate = useNavigate();

  const { openDocument } = useAccessDocument();

  const { enableAdmin } = useAllowGlobal();

  const { fetchProveedorPersonaByProveedor } = useProveedorAsync();

  const [proveedorPersonaList, setProveedoredorPersonaList] = useState<
    PersonProviderType[]
  >([]);

  const { formState, onAutocompleteChange, onResetForm } = useForm({
    proveedor: null,
  });

  const [proveedorPersona, setProveedorPersona] =
    useState<PersonProviderType>();

  const [showEditButton, setShowEditButton] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');

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
      fetchByParam(searchTerm.toUpperCase()).then((response) => {
        if (response) {
          setProveedoredorPersonaList(response);
        }
      });
    };

    if (searchTerm.length >= 3) {
      fetchData();
    }
  }, [searchTerm]);

  useEffect(() => {
    if (formState.proveedor === null) {
      onResetForm();
      setSearchTerm('');
      setProveedorPersona({
        personAddress: '',
        personEmail: '',
        personId: null,
        personIdentification: '',
        personName: '',
        personPhone: '',
        providerId: null,
        providerName: '',
        retentionSourceId: undefined,
        retentionIVAId: undefined,
      });
      setShowEditButton(false);
    } else {
      const fetchGetProvidertData = async () => {
        fetchProveedorPersonaByProveedor(formState.proveedor.providerId).then(
          (response) => {
            if (response) {
              setProveedorPersona(response);
            }
          }
        );
      };
      fetchGetProvidertData();
      setShowEditButton(true);
    }
  }, [formState.proveedor]);

  const headerComponents: React.ReactNode = (
    <Box sx={{ mt: 0.5 }}>
      {enableAdmin() && (
        <Button
          variant="contained"
          color="primary"
          sx={{ mr: 1, width: '200px' }}
          startIcon={<AddCircle />}
          onClick={() => {
            navigate(PathEnum.FICHA_PROVEEDOR + PathEnum.NEW);
          }}
        >
          Nuevo Proveedor
        </Button>
      )}

      {showEditButton && enableAdmin() && (
        <Button
          variant="contained"
          color="secondary"
          sx={{ width: '200px' }}
          startIcon={<Info />}
          onClick={() => {
            if (proveedorPersona?.providerId) {
              openDocument({
                id: proveedorPersona.providerId,
                navigation: () =>
                  navigate(PathEnum.FICHA_PROVEEDOR + PathEnum.VIEW, {
                    state: {
                      providerId: proveedorPersona.providerId,
                    },
                  }),
                documentType: DocumentTypeEnum.PROVEEDOR,
              });
            }
          }}
        >
          Ver Proveedor
        </Button>
      )}
    </Box>
  );

  return (
    <>
      <CardLayout
        title="FICHA PROVEEDOR"
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
              className={styles.genericFieldStyle}
              options={proveedorPersonaList}
              getOptionLabel={(option) => option.providerName}
              style={{ width: '100%' }}
              onChange={(event, value) =>
                onAutocompleteChange(event, 'proveedor', value)
              }
              onInputChange={handleAutocompleteChange}
              value={formState.proveedor}
              isOptionEqualToValue={(option, value) =>
                option?.providerName === value?.providerName
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
                  label="Proveedor"
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
          {formState.proveedor !== null && (
            <>
              <Grid item xs={6}>
                <TextField
                  label="Ruc"
                  value={
                    proveedorPersona?.personIdentification
                      ? proveedorPersona?.personIdentification
                      : ''
                  }
                  fullWidth
                  InputProps={{
                    readOnly: true,
                    className: styles.textWhiteStyle,
                  }}
                  InputLabelProps={{
                    shrink: proveedorPersona?.personIdentification
                      ? true
                      : false,
                    className: styles.textGreenStyle,
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Dirección"
                  value={
                    proveedorPersona?.personAddress
                      ? proveedorPersona?.personAddress
                      : ''
                  }
                  fullWidth
                  InputProps={{
                    readOnly: true,
                    className: styles.textWhiteStyle,
                  }}
                  InputLabelProps={{
                    shrink: proveedorPersona?.personAddress ? true : false,
                    className: styles.textGreenStyle,
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Razon Social"
                  value={
                    proveedorPersona?.personName
                      ? proveedorPersona?.personName
                      : ''
                  }
                  fullWidth
                  InputProps={{
                    readOnly: true,
                    className: styles.textWhiteStyle,
                  }}
                  InputLabelProps={{
                    shrink: proveedorPersona?.personName ? true : false,
                    className: styles.textGreenStyle,
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Correo"
                  value={
                    proveedorPersona?.personEmail
                      ? proveedorPersona?.personEmail
                      : ''
                  }
                  fullWidth
                  InputProps={{
                    readOnly: true,
                    className: styles.textWhiteStyle,
                  }}
                  InputLabelProps={{
                    shrink: proveedorPersona?.personEmail ? true : false,
                    className: styles.textGreenStyle,
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Teléfono"
                  value={
                    proveedorPersona?.personPhone
                      ? proveedorPersona?.personPhone
                      : ''
                  }
                  fullWidth
                  InputProps={{
                    readOnly: true,
                    className: styles.textWhiteStyle,
                  }}
                  InputLabelProps={{
                    shrink: proveedorPersona?.personPhone ? true : false,
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
