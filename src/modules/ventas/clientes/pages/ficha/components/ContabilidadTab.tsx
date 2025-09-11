'use client';
import { FormState, useAccountAsync, useStyles, } from '@/hooks';
import { AccountType } from '@/types';
import React, { useEffect, useState } from 'react';
import { Autocomplete, Grid, TextField, } from '@mui/material';
import { TabPanel } from '@/functions';

type ContabilidadTabProps = {
  formState: FormState;
  setFormState: React.Dispatch<React.SetStateAction<FormState>>;
  createMode: boolean;
  editMode: boolean;
  formErrors: FormState;
  setFormErrors: React.Dispatch<React.SetStateAction<FormState>>;
  tabIndex: number;
  onAutocompleteChange: (event: React.ChangeEvent<{}>, name: string, value: any, index?: number) => void;
};

export const ContabilidadTab: React.FC<ContabilidadTabProps> = ({
  formState,
  setFormState,
  createMode,
  editMode,
  tabIndex,
  onAutocompleteChange,
}) => {
  const styles = useStyles();

  const { fetchAccountsForClient } = useAccountAsync();
  const [accountClientList, setAccountClientList] = useState<AccountType[]>([]);

  useEffect(() => {
    const setData = async () => {
      const responseAccountClient = await fetchAccountsForClient();
      if (responseAccountClient) {
        const dto = responseAccountClient as AccountType[];
        setAccountClientList(dto);
      }
    }
    setData();
  }, [])

  useEffect(() => {
    const accountDefault = accountClientList.find(
      (account) =>
        account.accountNumber === '1.01.02.02.001'
    );
    setFormState((prevState) => ({
      ...prevState,
      accountId: accountDefault?.accountId,
    }));

  }, [accountClientList])

  return (
    <>
      <TabPanel value={tabIndex} index={4}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12}>
            <Autocomplete
              className={styles.genericFieldStyle}
              options={accountClientList}
              readOnly={!createMode && !editMode}
              defaultValue={accountClientList.find(
                (account) =>
                  account.accountNumber === '1.01.02.02.001'
              )
              }
              getOptionLabel={(option) => `${option.accountNumber}  - ${option.accountName}`}
              style={{ width: '100%' }}
              onChange={(event, value) => {
                onAutocompleteChange(event, 'accountId', value?.accountId);
              }}
              value={
                formState.accountId !== null
                  ?
                  accountClientList.find(
                    (account) =>
                      account.accountId === formState.accountId
                  )
                  : null
              }
              isOptionEqualToValue={(
                option: AccountType,
                value: AccountType
              ) =>
                option && value
                  ? option === value
                  : false
              }
              noOptionsText="Sin resultados"
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Cuenta contable"
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
