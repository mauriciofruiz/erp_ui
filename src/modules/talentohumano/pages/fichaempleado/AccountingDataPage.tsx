import { AccountingDataType } from '@/types';
import React from 'react';
import { Grid, TextField, Typography } from '@mui/material';
import { useStyles } from '@/hooks';
import { CardLayout } from '@/modules/layout';

export type AccountingDataPageProps = {
  accountingData: AccountingDataType[] | null;
};

export const AccountingDataPage: React.FC<AccountingDataPageProps> = ({
  accountingData,
}) => {
  const styles = useStyles();
  return (
    <CardLayout title="DATOS CONTABLES">
      <Grid
        container
        spacing={2}
        alignItems="center"
        justifyContent="space-between"
      >
        <Grid item xs={12}>
          <Grid container spacing={2}>
            <Grid item xs={2} style={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="h6" className={styles.textWhiteStyle} style={{ fontSize: '12px', fontWeight: 'bold' }}>
                SALARIOS Y GASTOS
              </Typography>
            </Grid>
            <Grid item xs={5}>
              <TextField
                label="Número Cuenta"
                placeholder="0-00-000-000-0-0"
                value={accountingData?.at(0)?.accountNumber}
                fullWidth
                InputProps={{
                  readOnly: true,
                  className: styles.textWhiteStyle,
                }}
                InputLabelProps={{
                  shrink: accountingData?.at(0)?.accountNumber ? true : false,
                  className: styles.textGreenStyle,
                }}
              />
            </Grid>
            <Grid item xs={5}>
              <TextField
                label="Nombre Cuenta"
                value={accountingData?.at(0)?.accountName}
                fullWidth
                InputProps={{
                  readOnly: true,
                  className: styles.textWhiteStyle,
                }}
                InputLabelProps={{
                  shrink: accountingData?.at(0)?.accountName ? true : false,
                  className: styles.textGreenStyle,
                }}
              />
            </Grid>
          </Grid>
        </Grid>
		<Grid item xs={12}>
          <Grid container spacing={2}>
            <Grid item xs={2} style={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="h6" className={styles.textWhiteStyle} style={{ fontSize: '12px', fontWeight: 'bold' }}>
                SALARIOS CXP
              </Typography>
            </Grid>
            <Grid item xs={5}>
              <TextField
                label="Número Cuenta"
                placeholder="0-00-000-000-0-0"
                value={accountingData?.at(1)?.accountNumber}
                fullWidth
                InputProps={{
                  readOnly: true,
                  className: styles.textWhiteStyle,
                }}
                InputLabelProps={{
                  shrink: accountingData?.at(1)?.accountNumber ? true : false,
                  className: styles.textGreenStyle,
                }}
              />
            </Grid>
            <Grid item xs={5}>
              <TextField
                label="Nombre Cuenta"
                value={accountingData?.at(1)?.accountName}
                fullWidth
                InputProps={{
                  readOnly: true,
                  className: styles.textWhiteStyle,
                }}
                InputLabelProps={{
                  shrink: accountingData?.at(1)?.accountName ? true : false,
                  className: styles.textGreenStyle,
                }}
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </CardLayout>
  );
};
