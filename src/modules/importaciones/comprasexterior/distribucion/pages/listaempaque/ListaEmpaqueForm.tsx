'use client';
import {
  FormState,
  StyledDatePicker,
  useAperturaImportacionAsync,
  useListaEmpaqueAsync,
  useProveedorAsync,
  useStyles,
} from '@/hooks';
import {
  AperturaPostType,
  ListaEmpaqueGetInterface,
  PersonProviderType,
} from '@/types';
import {
  GridRowModes,
  GridRowModesModel,
  GridRowsProp,
  GridValidRowModel,
} from '@mui/x-data-grid';
import React, { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { Autocomplete, Divider, Grid, TextField } from '@mui/material';
import dayjs from 'dayjs';
import { DimensionContenedorEnum, EstadoListaEmpaqueEnum } from '@/enums';
import { parseISO } from 'date-fns';
import { randomId } from '@mui/x-data-grid-generator';
import { DetalleListaEmpaque } from './DetalleListaEmpaque';
import { GroupRows } from './CustomFunctions';

type ListaEmpaqueFormProps = {
  initialState: ListaEmpaqueGetInterface;
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
  setRows: React.Dispatch<React.SetStateAction<GridRowsProp>>;
  groupedRows: readonly GridValidRowModel[];
  setGroupedRows: React.Dispatch<
    React.SetStateAction<readonly GridValidRowModel[]>
  >;
  providerSelected: PersonProviderType | null;
  setProviderSelected: React.Dispatch<
    React.SetStateAction<PersonProviderType | null>
  >;
};

export const ListaEmpaqueForm: React.FC<ListaEmpaqueFormProps> = ({
  initialState,
  formState,
  setFormState,
  createMode,
  editMode,
  onDateChange,
  onAutocompleteChange,
  onInputChange,
  setRows,
  groupedRows,
  setGroupedRows,
  providerSelected,
  setProviderSelected,
}) => {
  const styles = useStyles();

  const { fetchByProveedorAndOrdenConfirmada } = useAperturaImportacionAsync();

  const { fetchDetailsByApertura } = useListaEmpaqueAsync();

  const [listaAperturas, setListaAperturas] = useState<AperturaPostType[]>([]);

  const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({});

  const [proveedorPersonaList, setProveedoredorPersonaList] = useState<
    PersonProviderType[]
  >([]);
  const [searchTerm, setSearchTerm] = useState('');

  const { fetchByParam } = useProveedorAsync();

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

  const handleAutocompleteProveedor = async (
    event: React.SyntheticEvent<Element, Event>,
    inputValue: string
  ) => {
    if (event !== null) {
      event.preventDefault();
      setSearchTerm(inputValue);
    }
  };

  useEffect(() => {
    if (formState.providerId === null) {
      setProviderSelected(null);
      return;
    }
    if (
      providerSelected &&
      providerSelected !== null &&
      proveedorPersonaList.length === 0
    ) {
      setProveedoredorPersonaList([providerSelected]);
      return;
    }

    const provider =
      proveedorPersonaList.find(
        (provider) => provider.providerId === formState.providerId
      ) ?? null;
    setProviderSelected(provider);
  }, [formState.providerId, proveedorPersonaList]);

  useEffect(() => {
    const fetchData = async () => {
      if (providerSelected === null) {
        setRows([]);
        setListaAperturas([]);
        setFormState({
          ...initialState,
          userId: formState.userId,
          userName: formState.userName,
        });
        return;
      } else if (createMode || editMode) {
        setListaAperturas(
          (await fetchByProveedorAndOrdenConfirmada(
            providerSelected.providerId as number
          )) ?? []
        );

        setFormState({
          ...initialState,
          userId: formState.userId,
          userName: formState.userName,
          providerId: providerSelected.providerId,
          personName: providerSelected.personName,
        });
        setRows([]);
      }
    };

    fetchData();
  }, [providerSelected]);

  const getDimensionList = () => {
    return Object.keys(DimensionContenedorEnum)
      .filter((key): key is keyof typeof DimensionContenedorEnum =>
        isNaN(Number(key))
      )
      .map((key) => {
        const label = DimensionContenedorEnum[key].description;
        return { label: label, value: DimensionContenedorEnum[key] };
      });
  };

  const getDetails = async () => {
    const listToSend: ListaEmpaqueGetInterface = {
      ...(formState as ListaEmpaqueGetInterface),
      detailPackingList: [],
    };
    const response = await fetchDetailsByApertura(listToSend);
    const listaGet = response as ListaEmpaqueGetInterface;

    const newFormState = {
      ...listaGet,
      arrivalDate:
        typeof listaGet.arrivalDate === 'string'
          ? parseISO(listaGet.arrivalDate)
          : listaGet.arrivalDate,
      departureDate:
        typeof listaGet.departureDate === 'string'
          ? parseISO(listaGet.departureDate)
          : listaGet.departureDate,
      registrationDate:
        typeof listaGet.registrationDate === 'string'
          ? parseISO(listaGet.registrationDate)
          : listaGet.registrationDate,
      detailPackingList: [],
    };

    setFormState(newFormState);

    const temporalRows: GridRowsProp = listaGet.detailPackingList.map(
      (detail) => ({
        id: randomId(),
        ...detail,
        status: true,
      })
    );

    setRows(temporalRows);

    setGroupedRows(GroupRows(temporalRows));
  };

  useEffect(() => {
    const anyRowInEditMode = Object.values(rowModesModel).some(
      (rowMode) => rowMode.mode === GridRowModes.Edit
    );
    if (
      formState.providerId !== null &&
      formState.importOpeningId !== null &&
      !anyRowInEditMode &&
      (createMode || editMode)
    ) {
      getDetails();
    }
  }, [formState.numberContainers, formState.importOpeningId]);

  useEffect(() => {
    if (groupedRows.length > 0 && (createMode || editMode)) {
      let newGroupedRows: GridValidRowModel[] = [];

      groupedRows.forEach((row) => {
        row.productId.forEach((id: number, index: number) => {
          let newRow = { ...row };
          newRow.productCode = row.productCode[index];
          newRow.productId = id;
          newRow.productName = row.productName[index];
          newRow.quantity = row.quantity[index];
          newGroupedRows.push(newRow);
        });
      });

      let readonlyGroupedRows: readonly GridValidRowModel[] = newGroupedRows;
      setRows(readonlyGroupedRows);
    }
  }, [groupedRows]);

  const newFormState = useMemo(() => {
    if (!formState.multipleInvoice) {
      return {
        ...formState,
        numberOfInvoices: 1,
      };
    }
    return formState;
  }, [formState.multipleInvoice, formState.numberOfInvoices]);

  useEffect(() => {
    setFormState(newFormState);
  }, [newFormState]);

  useEffect(() => {
    if (formState.departureDate && formState.freeDays) {
      const newDate = dayjs(formState.departureDate)
        .add(formState.freeDays, 'days')
        .toDate();
      setFormState((prev) => ({
        ...prev,
        arrivalDate: newDate,
      }));
    }
  }, [formState.departureDate, formState.freeDays]);

  return (
    <>
      <Grid container spacing={2} alignItems="center" sx={{ mt: 2 }}>
        <Grid item xs={4}>
          <TextField
            label="Usuario"
            value={formState.userName}
            InputProps={{
              readOnly: true,
            }}
            inputProps={{
              style: { textTransform: 'uppercase' },
            }}
            InputLabelProps={{
              shrink: formState.userName !== '' ? true : false,
            }}
            fullWidth
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
          <TextField
            name="numberOfInvoices"
            label="Nro. Facturas"
            value={formState.numberOfInvoices}
            onChange={onInputChange}
            InputProps={{
              readOnly: !createMode && !editMode,
            }}
            InputLabelProps={{
              shrink: formState.numberOfInvoices !== '' ? true : false,
            }}
            type="number"
            onFocus={(e) => e.target.select()}
            fullWidth
          />
        </Grid>
        <Grid item xs={4}>
          <Autocomplete
            className={styles.genericFieldStyle}
            options={proveedorPersonaList}
            getOptionLabel={(option) =>
              option !== null ? option.personName : ''
            }
            style={{ width: '100%' }}
            onChange={(event, value) => {
              onAutocompleteChange(event, 'providerId', value?.providerId);
            }}
            onInputChange={(event, newInputValue) =>
              handleAutocompleteProveedor(event, newInputValue)
            }
            readOnly={!createMode && !editMode}
            value={providerSelected}
            isOptionEqualToValue={(option, value) =>
              option.providerId === value.providerId
            }
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
        <Grid item xs={4}>
          <TextField
            name="policy"
            label="Póliza"
            value={formState.policy}
            onChange={onInputChange}
            InputProps={{
              readOnly: !createMode && !editMode,
            }}
            InputLabelProps={{
              shrink: formState.policy !== '' ? true : false,
            }}
            inputProps={{
              maxLength: 128,
            }}
            fullWidth
          />
        </Grid>
        <Grid item xs={4}>
          <TextField
            name="freeDays"
            label="Días Libres"
            value={formState.freeDays}
            onChange={onInputChange}
            InputProps={{
              readOnly: !createMode && !editMode,
            }}
            InputLabelProps={{
              shrink: formState.freeDays !== '' ? true : false,
            }}
            inputProps={{
              maxLength: 8,
            }}
            type="number"
            onFocus={(e) => e.target.select()}
            fullWidth
          />
        </Grid>
        <Grid item xs={4}>
          <StyledDatePicker
            label="Fecha De Salida"
            views={['year', 'month', 'day']}
            minDate={formState.registrationDate}
            format="dd/MM/yyyy"
            value={formState.departureDate}
            onChange={(value) => {
              onDateChange(value as Date, 'departureDate');
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
          <StyledDatePicker
            label="Fecha De Llegada"
            format="dd/MM/yyyy"
            value={formState.arrivalDate}
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
          <TextField
            name="shippingCompany"
            label="Naviera"
            value={formState.shippingCompany}
            onChange={onInputChange}
            InputProps={{
              readOnly: !createMode && !editMode,
            }}
            InputLabelProps={{
              shrink: formState.shippingCompany !== '' ? true : false,
            }}
            inputProps={{
              maxLength: 128,
            }}
            fullWidth
          />
        </Grid>
        <Grid item xs={4}>
          <TextField
            name="agent"
            label="Agente"
            value={formState.agent}
            onChange={onInputChange}
            InputProps={{
              readOnly: !createMode && !editMode,
            }}
            InputLabelProps={{
              shrink: formState.agent !== '' ? true : false,
            }}
            inputProps={{
              maxLength: 128,
            }}
            fullWidth
          />
        </Grid>
        <Grid item xs={4}>
          <TextField
            name="bl"
            label="BL"
            value={formState.bl}
            onChange={onInputChange}
            InputProps={{
              readOnly: !createMode && !editMode,
            }}
            InputLabelProps={{
              shrink: formState.bl !== '' ? true : false,
            }}
            inputProps={{
              maxLength: 128,
            }}
            fullWidth
          />
        </Grid>
        <Grid item xs={4}>
          <TextField
            name="warehouse"
            label="Almacenera"
            value={formState.warehouse}
            onChange={onInputChange}
            InputProps={{
              readOnly: !createMode && !editMode,
            }}
            InputLabelProps={{
              shrink: formState.warehouse !== '' ? true : false,
            }}
            inputProps={{
              maxLength: 128,
            }}
            fullWidth
          />
        </Grid>
        <Grid item xs={4}>
          <TextField
            name="application"
            label="Aplicación"
            value={formState.application}
            onChange={onInputChange}
            InputProps={{
              readOnly: !createMode && !editMode,
            }}
            InputLabelProps={{
              shrink: formState.application !== '' ? true : false,
            }}
            inputProps={{
              maxLength: 128,
            }}
            fullWidth
          />
        </Grid>
        <Grid item xs={4}>
          <TextField
            name="ship"
            label="Buque"
            value={formState.ship}
            onChange={onInputChange}
            InputProps={{
              readOnly: !createMode && !editMode,
            }}
            InputLabelProps={{
              shrink: formState.ship !== '' ? true : false,
            }}
            inputProps={{
              maxLength: 128,
            }}
            fullWidth
          />
        </Grid>
        <Grid item xs={4}>
          <TextField
            name="numberContainers"
            label="Nro. Contenedores"
            value={formState.numberContainers}
            onChange={onInputChange}
            InputProps={{
              readOnly: !createMode && !editMode,
            }}
            InputLabelProps={{
              shrink: formState.numberContainers !== '' ? true : false,
            }}
            inputProps={{
              maxLength: 8,
            }}
            type="number"
            onFocus={(e) => e.target.select()}
            fullWidth
          />
        </Grid>
        <Grid item xs={4}>
          <Autocomplete
            className={styles.genericFieldStyle}
            options={getDimensionList()}
            getOptionLabel={(option) => option.label}
            style={{ width: '100%' }}
            onChange={(event, value) =>
              onAutocompleteChange(
                event,
                'containerDimensionId',
                value?.value.id
              )
            }
            value={
              (formState.containerDimensionId !== null
                ? getDimensionList().find(
                    (tipo) => tipo.value.id === formState.containerDimensionId
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
                label="Dimensiones"
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
        {formState.packingListStateId === EstadoListaEmpaqueEnum.GENERADA ? (
          <Grid item xs={4}>
            <Autocomplete
              className={styles.genericFieldStyle}
              options={listaAperturas}
              getOptionLabel={(option) => option.importCode}
              style={{ width: '100%' }}
              onChange={(event, value) =>
                onAutocompleteChange(
                  event,
                  'importOpeningId',
                  value?.importOpeningId
                )
              }
              value={
                (formState.importOpeningId !== null
                  ? listaAperturas.find(
                      (apertura) =>
                        apertura.importOpeningId === formState.importOpeningId
                    )
                  : null) || null
              }
              isOptionEqualToValue={(option, value) =>
                option.importOpeningId === value.importOpeningId
              }
              filterOptions={(options, params) => {
                const filtered = options.filter(
                  (option) =>
                    option.importCode
                      .toUpperCase()
                      .indexOf(params.inputValue.toUpperCase()) !== -1
                );

                return filtered;
              }}
              noOptionsText="Sin resultados"
              readOnly={!createMode && !editMode}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Orden De Compra"
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
        ) : (
          <Grid item xs={4}>
            <TextField
              label="Apertura Importación"
              value={formState.importCode}
              InputProps={{
                readOnly: true,
              }}
              InputLabelProps={{
                shrink: formState.importCode !== '' ? true : false,
              }}
              fullWidth
            />
          </Grid>
        )}
      </Grid>
      <Divider sx={{ mt: 2 }} />
      <DetalleListaEmpaque
        rows={groupedRows}
        setRows={setGroupedRows}
        formState={formState}
        setFormState={setFormState}
        createMode={createMode}
        editMode={editMode}
        rowModesModel={rowModesModel}
        setRowModesModel={setRowModesModel}
      />
      <Divider sx={{ mt: 2, mb: 2 }} />
      <Grid item xs={12}>
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
    </>
  );
};
