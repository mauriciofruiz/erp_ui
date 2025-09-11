'use client';
import {
  FormState,
  StyledDatePicker,
  useListaPedidoAsync,
  useOrdenCompraAsync,
  useStyles,
} from '@/hooks';
import {
  ListaPedidoMain,
  OrdenExteriorGetInterface,
  PersonProviderType,
} from '@/types';
import {
  GridRowModes,
  GridRowModesModel,
  GridRowsProp,
} from '@mui/x-data-grid';
import React, { ChangeEvent, useEffect, useState } from 'react';
import {
  Autocomplete,
  Box,
  Chip,
  Divider,
  Grid,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import { Person } from '@mui/icons-material';
import dayjs from 'dayjs';
import { IncotermEnum } from '@/enums';
import { LabeledInputNumber } from '@/modules/layout';
import { AccordionListaPedido } from './AccordionListaPedido';
import { parseISO } from 'date-fns';
import { randomId } from '@mui/x-data-grid-generator';
import { DetalleOrdenCompraExt } from './DetalleOrdenCompraExt';

type OrdenCompraExteriorFormProps = {
  initialState: OrdenExteriorGetInterface;
  formState: FormState;
  setFormState: React.Dispatch<React.SetStateAction<FormState>>;
  createMode: boolean;
  editMode: boolean;
  onDateChange: (value: Date, name: string) => void;
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
  onInputNumberChange: (value: number, field: string) => void;
  rows: GridRowsProp;
  setRows: React.Dispatch<React.SetStateAction<GridRowsProp>>;
  proveedoresList: PersonProviderType[];
};

export const OrdenCompraExteriorForm: React.FC<
  OrdenCompraExteriorFormProps
> = ({
  initialState,
  formState,
  setFormState,
  createMode,
  editMode,
  onDateChange,
  onAutocompleteChange,
  onInputChange,
  onInputNumberChange,
  rows,
  setRows,
  proveedoresList,
}) => {
  const styles = useStyles();

  const { fetchListaPedidoByIdProveedor } = useListaPedidoAsync();

  const { fetchOrdenByListaPedido } = useOrdenCompraAsync();

  const [listaPedidoList, setListaPedidoList] = useState<ListaPedidoMain[]>([]);

  const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({});

  const onChangeProveedor = async (value: PersonProviderType) => {
    setListaPedidoList(
      (await fetchListaPedidoByIdProveedor(value.providerId as number)) ?? []
    );

    setFormState({
      ...initialState,
      providerId: value.providerId,
      personName: value.personName,
      providerIdentification: value.personIdentification,
    });
    setRows([]);
  };

  const getIncotermList = () => {
    return Object.keys(IncotermEnum)
      .filter((key): key is keyof typeof IncotermEnum => isNaN(Number(key)))
      .map((key) => {
        const label = key.replace(/_/g, ' ');
        return { label: label, value: IncotermEnum[key] };
      });
  };
  const getOrden = async (id: number, newPedido: boolean) => {
    const ordenToSend: OrdenExteriorGetInterface = {
      ...(formState as OrdenExteriorGetInterface),
      detailPurchaseOrderImport: newPedido
        ? []
        : rows.map((row) => ({
            detailOrderId: row.detailOrderId,
            purchaseOrderId: row.purchaseOrderId,
            documentCode: row.documentCode,
            productId: row.productId,
            productCode: row.productCode,
            productName: row.productName,
            quantity: row.quantity,
            unitPrice: row.unitPrice,
            totalPrice: row.totalPrice,
            fodinfaValue: row.fodinfaValue,
            advaloremValue: row.advaloremValue,
            unitMeasureId: row.unitMeasureId,
          })),
    };
    const response = await fetchOrdenByListaPedido(id, ordenToSend);
    const ordenExterior = response as OrdenExteriorGetInterface;

    const newFormState = {
      ...ordenExterior,
      deliveryDate:
        typeof ordenExterior.deliveryDate === 'string'
          ? parseISO(ordenExterior.deliveryDate)
          : ordenExterior.deliveryDate,
      registrationDate:
        typeof ordenExterior.registrationDate === 'string'
          ? parseISO(ordenExterior.registrationDate)
          : ordenExterior.registrationDate,
      detailPurchaseOrderImport: [],
    };
    setFormState(newFormState);

    setRows(
      ordenExterior.detailPurchaseOrderImport.map((detail) => ({
        id: randomId(),
        ...detail,
        status: true,
      }))
    );
  };

  useEffect(() => {
    const anyRowInEditMode = Object.values(rowModesModel).some(
      (rowMode) => rowMode.mode === GridRowModes.Edit
    );
    if (
      formState.providerId !== null &&
      formState.orderListId !== null &&
      rows.length > 0 &&
      !anyRowInEditMode &&
      (createMode || editMode)
    ) {
      getOrden(formState.orderListId as number, false);
    }
  }, [
    formState.premiumValue,
    formState.fodinfaFreight,
    formState.advaloremFreight,
    formState.incotermId,
    formState.freightValue,
    formState.internationalFreight,
    formState.insuranceValue,
    formState.otherExpenses,
    JSON.stringify(rows.map((item) => item.quantity)),
    JSON.stringify(rows.map((item) => item.unitPrice)),
  ]);

  return (
    <>
      <Grid container spacing={2} alignItems="center" sx={{ mt: 2 }}>
        {createMode && (
          <Grid item xs={12}>
            <Typography
              variant="body1"
              color={'primary'}
              sx={{ ml: 1, fontSize: '13px' }}
            >
              Proveedores
            </Typography>
            <Paper
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                listStyle: 'none',
                p: 0.5,
                m: 0,
                mb: 1,
              }}
              component="ul"
            >
              {proveedoresList.map((data) => {
                return (
                  <Chip
                    key={data.personId}
                    icon={<Person />}
                    label={data.personName}
                    sx={{ mr: 1, mb: 1 }}
                    onClick={() => {
                      onChangeProveedor(data);
                    }}
                  />
                );
              })}
            </Paper>
          </Grid>
        )}
        <Grid item xs={4}>
          <TextField
            label="Razón Social"
            value={formState.personName}
            InputProps={{
              readOnly: true,
            }}
            inputProps={{
              style: { textTransform: 'uppercase' },
            }}
            InputLabelProps={{
              shrink: formState.personName !== '' ? true : false,
            }}
            fullWidth
          />
        </Grid>
        <Grid item xs={4}>
          <TextField
            label="Identificación"
            value={formState.providerIdentification}
            InputProps={{
              readOnly: true,
            }}
            inputProps={{
              style: { textTransform: 'uppercase' },
            }}
            InputLabelProps={{
              shrink: formState.providerIdentification !== '' ? true : false,
            }}
            fullWidth
          />
        </Grid>
        <Grid item xs={4}>
          <Autocomplete
            className={styles.genericFieldStyle}
            options={getIncotermList()}
            getOptionLabel={(option) => option.label}
            style={{ width: '100%' }}
            onChange={(event, value) =>
              onAutocompleteChange(event, 'incotermId', value?.value)
            }
            value={
              (formState.incotermId !== null
                ? getIncotermList().find(
                    (tipo) => tipo.value === formState.incotermId
                  )
                : null) || null
            }
            isOptionEqualToValue={(option, value) =>
              option.value === value.value
            }
            readOnly={!createMode && !editMode}
            filterSelectedOptions
            noOptionsText="Sin resultados"
            renderInput={(params) => (
              <TextField
                {...params}
                label="Incoterm"
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
        <Grid item xs={4}>
          <StyledDatePicker
            label="Fecha Registro"
            format="dd/MM/yyyy"
            value={formState.registrationDate}
            readOnly
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
                  shrink: true,
                },
              },
            }}
          />
        </Grid>
        <Grid item xs={4}>
          <StyledDatePicker
            label="Fecha De Entrega"
            views={['year', 'month', 'day']}
            minDate={formState.registrationDate}
            maxDate={dayjs(formState.registrationDate).add(1, 'month').toDate()}
            format="dd/MM/yyyy"
            value={formState.deliveryDate}
            onChange={(value) => {
              onDateChange(value as Date, 'deliveryDate');
            }}
            readOnly={!createMode}
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
                  shrink: true,
                },
              },
            }}
          />
        </Grid>
        <Grid item xs={4}>
          <TextField
            label="Importación"
            value={formState.importOpeningCode}
            InputProps={{
              readOnly: true,
            }}
            inputProps={{
              style: { textTransform: 'uppercase' },
            }}
            InputLabelProps={{
              shrink: formState.importOpeningCode !== '' ? true : false,
            }}
            fullWidth
          />
        </Grid>
        <Grid item xs={4}>
          <TextField
            name="applicationNumber"
            label="Nro. Aplicación"
            value={formState.applicationNumber}
            onChange={onInputChange}
            InputProps={{
              readOnly: !createMode && !editMode,
            }}
            InputLabelProps={{
              shrink: formState.applicationNumber !== '' ? true : false,
            }}
            inputProps={{
              maxLength: 128,
            }}
            fullWidth
          />
        </Grid>
        <Grid item xs={4}>
          <TextField
            name="policyNumber"
            label="Nro. Póliza"
            value={formState.policyNumber}
            onChange={onInputChange}
            InputProps={{
              readOnly: !createMode && !editMode,
            }}
            InputLabelProps={{
              shrink: formState.policyNumber !== '' ? true : false,
            }}
            inputProps={{
              maxLength: 128,
            }}
            fullWidth
          />
        </Grid>
        <Grid item xs={4}>
          <TextField
            name="invoiceNumber"
            label="Nro. Factura"
            value={formState.invoiceNumber}
            onChange={onInputChange}
            InputProps={{
              readOnly: !createMode && !editMode,
            }}
            InputLabelProps={{
              shrink: formState.invoiceNumber !== '' ? true : false,
            }}
            inputProps={{
              maxLength: 128,
            }}
            fullWidth
          />
        </Grid>
        <Grid item xs={4}>
          <TextField
            name="containerNumber"
            label="Nro. Contenedores"
            value={formState.containerNumber}
            onChange={onInputChange}
            InputProps={{
              readOnly: !createMode && !editMode,
            }}
            InputLabelProps={{
              shrink: formState.containerNumber !== '' ? true : false,
            }}
            inputProps={{
              maxLength: 8,
            }}
            type="number"
            onFocus={(e) => e.target.select()}
            fullWidth
          />
        </Grid>
      </Grid>
      <Divider sx={{ mt: 2 }}>
        <Box>
          <Typography variant="body1">
            Detalle Para Cálculo De Impuestos
          </Typography>
        </Box>
      </Divider>
      <Grid container spacing={2} alignItems="center" sx={{ mt: 2 }}>
        <Grid item xs={2}>
          <LabeledInputNumber
            label="Valor Prima"
            inputNumberProps={{
              onChange: (value) =>
                onInputNumberChange(value as number, 'premiumValue'),
              value: formState.premiumValue,
              min: 0,
              defaultValue: 0,
              controls: false,
              precision: 2,
              prefix: '$',
              onFocus: (e: any) => e.target.select(),
              readOnly: !createMode && !editMode,
            }}
            delay={500}
          />
        </Grid>
        <Grid item xs={2}>
          <LabeledInputNumber
            label="Flete Fodinfa"
            inputNumberProps={{
              onChange: (value) =>
                onInputNumberChange(value as number, 'fodinfaFreight'),
              value: formState.fodinfaFreight,
              min: 0,
              defaultValue: 0,
              controls: false,
              precision: 2,
              prefix: '$',
              onFocus: (e: any) => e.target.select(),
              readOnly: !createMode && !editMode,
            }}
            delay={500}
          />
        </Grid>
        <Grid item xs={2}>
          <LabeledInputNumber
            label="Flete Advalorem"
            inputNumberProps={{
              onChange: (value) =>
                onInputNumberChange(value as number, 'advaloremFreight'),
              value: formState.advaloremFreight,
              min: 0,
              defaultValue: 0,
              controls: false,
              precision: 2,
              prefix: '$',
              onFocus: (e: any) => e.target.select(),
              readOnly: !createMode && !editMode,
            }}
            delay={500}
          />
        </Grid>
        <Grid item xs={2}>
          <LabeledInputNumber
            label="Valor Flete"
            inputNumberProps={{
              onChange: (value) =>
                onInputNumberChange(value as number, 'freightValue'),
              value: formState.freightValue,
              min: 0,
              defaultValue: 0,
              controls: false,
              precision: 2,
              prefix: '$',
              onFocus: (e: any) => e.target.select(),
              readOnly: !createMode && !editMode,
            }}
            delay={500}
          />
        </Grid>
        <Grid item xs={4}>
          <TextField
            name="observation"
            label="Observación"
            value={formState.observation}
            onChange={onInputChange}
            InputProps={{
              readOnly: !createMode && !editMode,
            }}
            InputLabelProps={{
              shrink: formState.observation !== '' ? true : false,
            }}
            inputProps={{
              maxLength: 128,
            }}
            fullWidth
          />
        </Grid>
      </Grid>
      {createMode && (
        <Grid container spacing={2} alignItems="center" sx={{ mt: 2 }}>
          <Grid item xs={12}>
            <AccordionListaPedido
              getOrden={getOrden}
              listaPedidoList={listaPedidoList}
            />
          </Grid>
        </Grid>
      )}
      <DetalleOrdenCompraExt
        rows={rows}
        setRows={setRows}
        formState={formState}
        setFormState={setFormState}
        createMode={createMode}
        editMode={editMode}
        onInputNumberChange={onInputNumberChange}
        rowModesModel={rowModesModel}
        setRowModesModel={setRowModesModel}
      />
    </>
  );
};
