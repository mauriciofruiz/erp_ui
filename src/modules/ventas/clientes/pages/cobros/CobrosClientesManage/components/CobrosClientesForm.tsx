import { FormState, useAllowGlobal, useStyles } from '@/hooks';
import {
  Box,
  Button,
  Chip,
  Grid,
  Menu,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { AccountType, crosesDetailsInterface } from '@/types';
import { LabeledInputNumber } from '@/modules/layout';
import { GridRowsProp } from '@mui/x-data-grid';
import { EventSeat, KeyboardArrowDown } from '@mui/icons-material';
import React from 'react';
import { Link } from 'react-router-dom';
import { setCurrencyNumber } from '@/functions';
import { PathEnum } from '@/enums';

export type CobrosClientesFromProps = {
  formState: FormState;
  createMode: boolean;
  editMode: boolean;
  onAutocompleteChange: (
    event: React.ChangeEvent<{}>,
    name: string,
    value: any,
    index?: number
  ) => void;
  onGenericChange: (value: any, field: string) => void;
  setFormState: React.Dispatch<React.SetStateAction<FormState>>;
  setRows: React.Dispatch<React.SetStateAction<GridRowsProp>>;
  cuentaList: AccountType[];
};

export const CobrosClientesForm: React.FC<CobrosClientesFromProps> = ({
  formState,
}) => {
  const styles = useStyles();

  const { allowCheckEntry } = useAllowGlobal();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  return (
    <>
      <Grid item xs={3}>
        <TextField
          label="N° Cobro"
          value={formState.idCobro}
          InputProps={{
            readOnly: true,
          }}
          inputProps={{
            style: { textTransform: 'uppercase' },
          }}
          InputLabelProps={{
            shrink: formState.idCobro !== '' ? true : false,
          }}
          fullWidth
        />
      </Grid>
      <Grid item xs={3}>
        <TextField
          label="Ruc"
          value={formState.clientIdentification}
          InputProps={{
            readOnly: true,
          }}
          inputProps={{
            style: { textTransform: 'uppercase' },
          }}
          InputLabelProps={{
            shrink: formState.clientIdentification !== '' ? true : false,
          }}
          fullWidth
        />
      </Grid>
      <Grid item xs={3}>
        <TextField
          label="Razón Social"
          value={formState.clientName}
          InputProps={{
            readOnly: true,
          }}
          inputProps={{
            style: { textTransform: 'uppercase' },
          }}
          InputLabelProps={{
            shrink: formState.clientName !== '' ? true : false,
          }}
          fullWidth
        />
      </Grid>
      <Grid item xs={3}>
        <TextField
          label="Caja"
          value={formState.cashName}
          InputProps={{
            readOnly: true,
          }}
          inputProps={{
            style: { textTransform: 'uppercase' },
          }}
          InputLabelProps={{
            shrink: formState.cashName !== '' ? true : false,
          }}
          fullWidth
        />
      </Grid>
      <Grid item xs={3}>
        <TextField
          label="Usuario"
          value={formState.creationUserName}
          InputProps={{
            readOnly: true,
          }}
          inputProps={{
            style: { textTransform: 'uppercase' },
          }}
          InputLabelProps={{
            shrink: formState.creationUserName !== '' ? true : false,
          }}
          fullWidth
        />
      </Grid>
      <Grid item xs={3}>
        <LabeledInputNumber
          label="Total Cobro"
          inputNumberProps={{
            value: formState.amount,
            min: 0,
            defaultValue: 0,
            controls: false,
            precision: 2,
            prefix: '$',
            onFocus: (e: any) => e.target.select(),
            readOnly: true,
          }}
        />
      </Grid>
      <Grid item xs={3}>
        <Chip
          label={formState.status ? 'ACTIVO' : 'ANULADO'}
          color="primary"
          style={{ width: '100%' }}
        />
      </Grid>
      {formState.providerInvoiceId !== null && allowCheckEntry() && (
        <Grid item xs={3}>
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
            </Menu>
          </Box>
        </Grid>
      )}
      <Grid item xs={12}>
        <div className={styles.tableContainer}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Detalle Cobro </TableCell>
                </TableRow>
              </TableHead>
              <TableHead>
                <TableRow>
                  <TableCell>N° Factura</TableCell>
                  <TableCell>Valor Factura</TableCell>
                  <TableCell>Valor Cobro</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {formState.crosesDetails.map(
                  (detalleformState: crosesDetailsInterface, index: number) => (
                    <TableRow key={index}>
                      <TableCell>{detalleformState.invoiceNumber}</TableCell>
                      <TableCell>
                        {setCurrencyNumber(detalleformState.invoiceValue)}
                      </TableCell>
                      <TableCell>
                        {setCurrencyNumber(detalleformState.paymentValue)}
                      </TableCell>
                    </TableRow>
                  )
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      </Grid>
    </>
  );
};
