'use client';
import { FormState, useStyles } from '@/hooks';
import { RetencionGeneralInterface } from '@/types';
import React, { useEffect, useState } from 'react';
import { Autocomplete, Grid, TextField } from '@mui/material';
import { TabPanel } from '@/functions';
import {
  getAllRetencionesFuenteCliente,
  getAllRetencionesIVACliente,
} from '@/backend';

type ImpuestosTabProps = {
  formState: FormState;
  setFormState: React.Dispatch<React.SetStateAction<FormState>>;
  createMode: boolean;
  editMode: boolean;
  formErrors: FormState;
  setFormErrors: React.Dispatch<React.SetStateAction<FormState>>;
  tabIndex: number;
  onAutocompleteChange: (
    event: React.ChangeEvent<{}>,
    name: string,
    value: any,
    index?: number
  ) => void;
  allowViewComponent: boolean;
};

export const ImpuestosTab: React.FC<ImpuestosTabProps> = ({
  formState,
  createMode,
  editMode,
  tabIndex,
  onAutocompleteChange,
  allowViewComponent,
}) => {
  const styles = useStyles();

  const [retencionFuenteList, setRetencionFuenteList] = useState<
    RetencionGeneralInterface[]
  >([]);
  const [retencionIVAList, setRetencionIVAList] = useState<
    RetencionGeneralInterface[]
  >([]);

  //***********************RETENCION FUENTE ************************************************************/
  const fetchRetencionesFuente = async () => {
    const response = await getAllRetencionesFuenteCliente();
    if (response) {
      setRetencionFuenteList(response as RetencionGeneralInterface[]);
    }
  };

  //***********************RETENCION IVA ************************************************************/
  const fetchRetencionesIVA = async () => {
    const response = await getAllRetencionesIVACliente();
    if (response) {
      setRetencionIVAList(response as RetencionGeneralInterface[]);
    }
  };

  useEffect(() => {
    const setData = async () => {
      try {
        fetchRetencionesFuente();
        fetchRetencionesIVA();
      } catch (error) {
        console.error(error);
      }
    };
    setData();
  }, []);

  return (
    <>
      <TabPanel value={tabIndex} index={allowViewComponent ? 3 : 0}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={6}>
            <Autocomplete
              className={styles.genericFieldStyle}
              options={retencionIVAList}
              readOnly={!createMode && !editMode}
              getOptionLabel={(option) =>
                `${option.annexCode} - ${option.detail}`
              }
              style={{ width: '100%' }}
              onChange={(event, value) => {
                onAutocompleteChange(
                  event,
                  'ivaRetentionId',
                  value?.retentionId
                );
              }}
              value={
                formState.ivaRetentionId !== null
                  ? retencionIVAList.find(
                      (retencionIva) =>
                        retencionIva.retentionId === formState.ivaRetentionId
                    )
                  : null
              }
              isOptionEqualToValue={(
                option: RetencionGeneralInterface,
                value: RetencionGeneralInterface
              ) => (option && value ? option === value : false)}
              noOptionsText="Sin resultados"
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Retención IVA"
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
          <Grid item xs={6}>
            <Autocomplete
              className={styles.genericFieldStyle}
              options={retencionFuenteList}
              readOnly={!createMode && !editMode}
              getOptionLabel={(option) =>
                `${option.percentageValue} - ${option.detail}`
              }
              style={{ width: '100%' }}
              onChange={(event, value) => {
                onAutocompleteChange(
                  event,
                  'sourceRetentionId',
                  value?.retentionId
                );
              }}
              value={
                formState.sourceRetentionId !== null
                  ? retencionFuenteList.find(
                      (retencionFuente) =>
                        retencionFuente.retentionId ===
                        formState.sourceRetentionId
                    )
                  : null
              }
              isOptionEqualToValue={(
                option: RetencionGeneralInterface,
                value: RetencionGeneralInterface
              ) => (option && value ? option === value : false)}
              noOptionsText="Sin resultados"
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Retención Fuente"
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
        </Grid>
      </TabPanel>
    </>
  );
};
