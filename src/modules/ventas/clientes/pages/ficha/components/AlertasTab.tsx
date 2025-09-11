'use client';
import { FormState, } from '@/hooks';
import React, { ChangeEvent } from 'react';
import { Grid, TextField, } from '@mui/material';
import { TabPanel } from '@/functions';

type AlertasTabProps = {
  formState: FormState;
  createMode: boolean;
  editMode: boolean;
  tabIndex: number;
  onInputChange: (event: ChangeEvent<HTMLInputElement>, listName?: string, index?: number) => void;
};

export const AlertasTab: React.FC<AlertasTabProps> = ({
  formState,
  createMode,
  editMode,
  tabIndex,
  onInputChange,
}) => {

  return (
    <>
      <TabPanel value={tabIndex} index={2}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={6}>
            <TextField
              name="generalAlert"
              label="Alerta General"
              value={formState.generalAlert}
              onChange={onInputChange}
              InputProps={{
                readOnly: !createMode && !editMode,
              }}
              inputProps={{ style: { textTransform: 'uppercase' } }}
              InputLabelProps={{
                shrink:
                  formState.generalAlert !== '' &&
                    formState.generalAlert != null
                    ? true
                    : false,
              }}
              fullWidth
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              name="billingAlert"
              label="Alerta Facturación"
              value={formState.billingAlert}
              onChange={onInputChange}
              InputProps={{
                readOnly: !createMode && !editMode,
              }}
              inputProps={{ style: { textTransform: 'uppercase' } }}
              InputLabelProps={{
                shrink:
                  formState.billingAlert !== '' &&
                    formState.billingAlert != null
                    ? true
                    : false,
              }}
              fullWidth
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              name="collectionAlert"
              label="Alerta Cobro"
              value={formState.collectionAlert}
              onChange={onInputChange}
              InputProps={{
                readOnly: !createMode && !editMode,
              }}
              inputProps={{ style: { textTransform: 'uppercase' } }}
              InputLabelProps={{
                shrink:
                  formState.collectionAlert !== '' &&
                    formState.collectionAlert != null
                    ? true
                    : false,
              }}
              fullWidth
            />
          </Grid>
        </Grid>
      </TabPanel>
    </>
  );
};
