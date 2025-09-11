'use client';
import {
  FormState,
  StyledDatePicker,
  useAllowGlobal,
  useAperturaImportacionAsync,
  useLiquidacionAsync,
  useStyles,
} from '@/hooks';
import { AperturaImportacionMainType, LiquidacionInterface } from '@/types';
import {
  GridRowModes,
  GridRowModesModel,
  GridRowsProp,
  GridValidRowModel,
} from '@mui/x-data-grid';
import React, { ChangeEvent, useEffect, useState } from 'react';
import {
  Autocomplete,
  Box,
  Button,
  Divider,
  Grid,
  Menu,
  TextField,
  Typography,
} from '@mui/material';
import { AperturaImpEnum, ComprobanteEstadoEnum, PathEnum } from '@/enums';
import { parseISO } from 'date-fns';
import { randomId } from '@mui/x-data-grid-generator';
import { DetalleLiquidacion } from './DetalleLiquidacion';
import { setSummaryRow } from './SubmitFunctions';
import { EventSeat, KeyboardArrowDown } from '@mui/icons-material';
import { Link } from 'react-router-dom';

type LiquidacionFormProps = {
  formState: FormState;
  setFormState: React.Dispatch<React.SetStateAction<FormState>>;
  createMode: boolean;
  editMode: boolean;
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
  rows: readonly GridValidRowModel[];
  setRows: React.Dispatch<React.SetStateAction<readonly GridValidRowModel[]>>;
  onInputNumberChange: (value: number, field: string) => void;
  idFacturasAsignadas: number[];
  setIdFacturasAsignadas: React.Dispatch<React.SetStateAction<number[]>>;
};

export const LiquidacionForm: React.FC<LiquidacionFormProps> = ({
  formState,
  setFormState,
  createMode,
  editMode,
  onAutocompleteChange,
  onInputChange,
  rows,
  setRows,
  onInputNumberChange,
  idFacturasAsignadas,
  setIdFacturasAsignadas,
}) => {
  const styles = useStyles();

  const { allowCheckEntry } = useAllowGlobal();

  const { fetchByParameters } = useAperturaImportacionAsync();

  const { fetchLiquidacionByAperturaImp } = useLiquidacionAsync();

  const [listaAperturas, setListaAperturas] = useState<
    AperturaImportacionMainType[]
  >([]);

  const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({});

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetchByParameters(
        null,
        null,
        AperturaImpEnum.FACTURADO,
        null,
        null,
        null,
        null,
        100,
        null,
        null,
        false
      );
      setListaAperturas(response?.list ?? []);
      setRows([]);
    };

    if (createMode) fetchData();
  }, [createMode]);

  const getDetails = async () => {
    const listToSend: LiquidacionInterface = {
      ...(formState as LiquidacionInterface),
      detail: [],
    };
    const response = await fetchLiquidacionByAperturaImp(listToSend);
    const listaGet = response as LiquidacionInterface;

    const newFormState = {
      ...listaGet,
      importDate:
        typeof listaGet.importDate === 'string'
          ? parseISO(listaGet.importDate)
          : listaGet.importDate ?? new Date(),
      registrationDate:
        typeof listaGet.registrationDate === 'string'
          ? parseISO(listaGet.registrationDate)
          : listaGet.registrationDate,
      detail: [],
    };

    setFormState(newFormState);

    const temporalRows: GridRowsProp =
      listaGet.detail?.map((detail) => ({
        id: randomId(),
        ...detail,
        status: true,
      })) ?? [];

    const summary = setSummaryRow(temporalRows);

    setRows(summary);
  };

  useEffect(() => {
    const anyRowInEditMode = Object.values(rowModesModel).some(
      (rowMode) => rowMode.mode === GridRowModes.Edit
    );
    if (
      formState.importOpeningId !== null &&
      !anyRowInEditMode &&
      (createMode || editMode)
    ) {
      getDetails();
    }
  }, [formState.importOpeningId]);

  //  * * * * * * * * * *  HANDLE MENU DOCUMENTOS ADJUNTOS * * * * * * * * * * * * *
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

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
          <StyledDatePicker
            label="Fecha Importación"
            format="dd/MM/yyyy"
            value={formState.importDate}
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
        {formState.liquidationState === ComprobanteEstadoEnum.GENERADO ? (
          <Grid item xs={4}>
            <Autocomplete
              className={styles.genericFieldStyle}
              options={listaAperturas}
              getOptionLabel={(option) => option.importOpeningCode}
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
              filterOptions={(options, { inputValue }) => {
                return options.filter((option) =>
                  option.importOpeningCode
                    .toLowerCase()
                    .includes(inputValue.toLowerCase())
                );
              }}
              noOptionsText="Sin resultados"
              readOnly={!createMode && !editMode}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Importación"
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
              label="Importación"
              value={formState.importOpeningCode}
              InputProps={{
                readOnly: true,
              }}
              InputLabelProps={{
                shrink: formState.importOpeningCode !== '' ? true : false,
              }}
              fullWidth
            />
          </Grid>
        )}
        <Grid item xs={4}>
          <TextField
            name="liquidationNumberLiquidation"
            label="Nro. Liquidación"
            value={formState.liquidationNumberLiquidation}
            onChange={onInputChange}
            InputProps={{
              readOnly: !createMode && !editMode,
            }}
            InputLabelProps={{
              shrink:
                formState.liquidationNumberLiquidation !== '' ? true : false,
            }}
            inputProps={{
              maxLength: 128,
            }}
            fullWidth
          />
        </Grid>
        {formState.liquidationState !== null &&
          formState.liquidationState !== ComprobanteEstadoEnum.GENERADO &&
          allowCheckEntry() && (
            <Grid item xs={4}>
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
      </Grid>
      <Divider sx={{ mt: 2 }} />
      <DetalleLiquidacion
        rows={rows}
        setRows={setRows}
        formState={formState}
        createMode={createMode}
        editMode={editMode}
        rowModesModel={rowModesModel}
        setRowModesModel={setRowModesModel}
        onInputNumberChange={onInputNumberChange}
        setFormState={setFormState}
        idFacturasAsignadas={idFacturasAsignadas}
        setIdFacturasAsignadas={setIdFacturasAsignadas}
      />
      <Divider sx={{ mt: 2, mb: 2 }} />
      <Grid item xs={12}>
        <TextField
          name="observationLiquidation"
          label="Observación"
          value={formState.observationLiquidation}
          onChange={onInputChange}
          InputProps={{
            readOnly: !createMode && !editMode,
          }}
          InputLabelProps={{
            shrink: formState.observationLiquidation !== '' ? true : false,
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
