import { EstadoDocumentoEnum, ParametersEnum } from '@/enums';
import {
  getPercentageValue,
  setCurrencyNumber,
  setDecimalPlaces,
  setDecimalPlacesString,
} from '@/functions';
import { FormState, StyledTableCell, useStyles } from '@/hooks';
import {
  ImpuestoDocumentoInterface,
  RetencionGroupType,
  RetencionType,
  TaxRateInterface,
} from '@/types';
import { AddCircle, Delete, RemoveCircle } from '@mui/icons-material';
import {
  Autocomplete,
  Box,
  FormControlLabel,
  Grid,
  IconButton,
  Paper,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
} from '@mui/material';
import {
  GridRowsProp,
  GridSlotsComponentsProps,
  GridValidRowModel,
} from '@mui/x-data-grid';
import { InputNumber } from 'antd';
import { useEffect, useMemo, useState } from 'react';

declare module '@mui/x-data-grid' {
  interface FooterPropsOverrides {
    rows: GridRowsProp;
    setRows: React.Dispatch<React.SetStateAction<GridRowsProp>>;
    createMode: boolean;
    editMode: boolean;
    retencionList: RetencionType[];
    formState: FormState;
    setFormState: React.Dispatch<React.SetStateAction<FormState>>;
    thereIsRetention: boolean;
    setGroupedRetenciones: React.Dispatch<
      React.SetStateAction<RetencionGroupType[]>
    >;
    setValidatedRetentionValue: React.Dispatch<React.SetStateAction<boolean>>;
    impuestos: TaxRateInterface[];
    taxes: ImpuestoDocumentoInterface[];
    setTaxes: React.Dispatch<
      React.SetStateAction<ImpuestoDocumentoInterface[]>
    >;
  }
}

export function CustomFooterFacturaC(
  props: NonNullable<GridSlotsComponentsProps['footer']>
) {
  const styles = useStyles();

  const rows = useMemo(() => {
    return props.rows || [];
  }, [props.rows]);

  const taxRates = useMemo(() => props.impuestos || [], [props.impuestos]);

  const taxes = useMemo(() => props.taxes || [], [props.taxes]);

  const setTaxes = useMemo(
    () => props.setTaxes || (() => {}),
    [props.setTaxes]
  );

  const createMode = useMemo(() => props.createMode, [props.createMode]);

  const formState = useMemo(() => {
    return props.formState || {};
  }, [props.formState]);

  const setFormState = useMemo(
    () => props.setFormState || (() => {}),
    [props.setFormState]
  );

  const setGroupedRetenciones = useMemo(
    () => props.setGroupedRetenciones || (() => {}),
    [props.setGroupedRetenciones]
  );

  const setValidatedRetentionValue = useMemo(
    () => props.setValidatedRetentionValue || (() => {}),
    [props.setValidatedRetentionValue]
  );

  const setRows = useMemo(() => props.setRows || (() => {}), [props.setRows]);

  const editMode = useMemo(() => props.editMode, [props.editMode]);

  const thereIsRetention = useMemo(
    () => props.thereIsRetention,
    [props.thereIsRetention]
  );

  const [subtotal, setSubtotal] = useState(0);

  const [totalDescuentos, setTotalDescuentos] = useState(0);

  const [totalExentoIva, setTotalExentoIva] = useState(0);

  const [totalMontoIva, setTotalMontoIva] = useState(0);

  const [totalFactura, setTotalFactura] = useState(0);

  const [totalBase, setTotalBase] = useState(0);

  const [totalRetencion, setTotalRetencion] = useState(0);

  const [totalPagar, setTotalPagar] = useState(0);

  const [groupedTaxes, setGroupedTaxes] = useState<
    ImpuestoDocumentoInterface[]
  >(props.taxes || []);

  const retencionList = props.retencionList || [];

  const [editRetencion, setEditRetencion] = useState(false);

  const [groupedRetencionesFooter, setGroupedRetencionesFooter] = useState<
    RetencionGroupType[]
  >([]);

  const allowAddRetencion = useMemo(() => {
    if (groupedRetencionesFooter.length === 0) return true;

    const thereIsARetentionWithoutCode = groupedRetencionesFooter.some(
      (retencion) => retencion.retencionCode === ''
    );

    return !thereIsARetentionWithoutCode;
  }, [JSON.stringify(groupedRetencionesFooter)]);

  useEffect(() => {
    const getTaxBaseAndAmount = (rows: GridRowsProp) => {
      const taxBase = rows.reduce(
        (sum: number, row: any) => sum + row.totalPrice,
        0
      );

      const taxAmount = rows.reduce((sum: number, row: any) => {
        const ivaPercentage = taxRates.find(
          (tax) => tax.taxRateId === row.taxRateId
        ) ?? { taxRatePercentage: 0 };
        return (
          sum +
          (getPercentageValue(
            row.totalPrice,
            ivaPercentage.taxRatePercentage
          ) || 0)
        );
      }, 0);

      return { taxBase, taxAmount };
    };

    const rowsFiltered =
      (rows && rows.filter((row) => row.status === true)) || [];

    // ************************** Retenciones **************************

    const groupRetenciones = (
      rowsFunction: readonly GridValidRowModel[]
    ): RetencionGroupType[] => {
      const grouped: { [key: string]: RetencionGroupType } = {};

      rowsFunction.forEach((row) => {
        row.retentions.forEach((retention: RetencionType) => {
          const key = `${retention.retencionCode}-${retention.retentionType}`;

          const ivaPercetage = taxRates.find(
            (tax) => tax.taxRateId === row.taxRateId
          ) ?? { taxRatePercentage: 0 };

          const baseValue =
            retention.retentionType ===
            ParametersEnum.RETENCION_IVA_PARAMETER.toString()
              ? row.hasIva
                ? getPercentageValue(
                    row.totalPrice,
                    ivaPercetage.taxRatePercentage
                  )
                : 0
              : row.totalPrice;

          if (!grouped[key]) {
            grouped[key] = {
              retentionId: retention.retentionId,
              retencionCode: retention.retencionCode,
              retentionDetail: retention.retentionDetail,
              retentionType: retention.retentionType,
              retentionPercentage: retention.retentionPercentage,
              base: baseValue,
              monto: 0,
              isControlled: formState.isControlledRetencion,
            };
          } else {
            grouped[key].base += baseValue;
          }
        });
      });

      const groupedReturn = Object.values(grouped).map((retention) => {
        return {
          ...retention,
          base: setDecimalPlaces(retention.base, 2),
          monto: setDecimalPlaces(
            getPercentageValue(retention.base, retention.retentionPercentage),
            2
          ),
        };
      });

      return Object.values(groupedReturn);
    };

    // ************************** End Retenciones **************************

    // ************************** Impuestos ********************************
    const groupedRows = rowsFiltered
      .filter((row) => row.hasIva)
      .reduce((groups, row) => {
        (groups[row.taxRateId] = groups[row.taxRateId] || []).push(row);
        return groups;
      }, {});

    let result: ImpuestoDocumentoInterface[] = groupedTaxes;

    for (const taxRateId in groupedRows) {
      const rows = groupedRows[taxRateId];
      const taxRate = taxRates.find((t) => t.taxRateId === Number(taxRateId));

      if (!taxRate) continue;

      const { taxBase, taxAmount } = getTaxBaseAndAmount(rows);

      const taxRateResult = result.find(
        (t) => t.taxCode === taxRate.taxRateCode
      );

      if (taxRateResult) {
        taxRateResult.taxBase = taxBase;
        taxRateResult.taxAmount = taxAmount;
        result[result.indexOf(taxRateResult)] = taxRateResult;
      } else {
        const taxDocument: ImpuestoDocumentoInterface = {
          taxId: null,
          documentId: null,
          documentTypeId: null,
          voucherId: null,
          taxPercentage: taxRate.taxRatePercentage,
          taxDescription: taxRate.taxDescription,
          taxCode: taxRate.taxRateCode,
          accountId: taxRate.purchaseAccountId ?? null,
          taxBase,
          taxAmount,
          taxState: taxRate.taxRateState,
        };

        result.push(taxDocument);
      }
    }

    const keys = Object.keys(groupedRows);

    const existenceTaxCodes = keys.map((taxRateId) => {
      return taxRates.find((tax) => tax.taxRateId === Number(taxRateId))
        ?.taxRateCode;
    });

    setGroupedTaxes(
      result.filter((tax) => existenceTaxCodes.includes(tax.taxCode))
    );

    setTotalDescuentos(
      setDecimalPlaces(
        rowsFiltered.reduce(
          (accumulator, row) => accumulator + parseFloat(row.discount),
          0
        ),
        2
      )
    );

    setTotalExentoIva(
      setDecimalPlaces(
        rowsFiltered
          .filter((row) => !row.hasIva)
          .reduce(
            (accumulator, row) => accumulator + parseFloat(row.totalPrice),
            0
          ),
        2
      )
    );

    setGroupedRetencionesFooter(groupRetenciones(rowsFiltered));
  }, [JSON.stringify(rows), JSON.stringify(taxRates), JSON.stringify(taxes)]);

  // ************************** End Impuestos ****************************

  useEffect(() => {
    setSubtotal(
      setDecimalPlaces(
        groupedTaxes.reduce((accumulator, row) => accumulator + row.taxBase, 0),
        2
      )
    );
    setTotalMontoIva(
      setDecimalPlaces(
        groupedTaxes.reduce(
          (accumulator, row) => accumulator + row.taxAmount,
          0
        ),
        2
      )
    );
  }, [groupedTaxes]);

  useEffect(() => {
    const totalFacturaTemporal = setDecimalPlaces(
      subtotal + totalExentoIva + totalMontoIva,
      2
    );
    setTotalFactura(totalFacturaTemporal);

    setTotalBase(
      setDecimalPlaces(
        groupedRetencionesFooter.reduce(
          (accumulator, row) => accumulator + row.base,
          0
        ),
        2
      )
    );

    const totalRetencionTemporal = groupedRetencionesFooter.reduce(
      (accumulator, row) => accumulator + row.monto,
      0
    );
    setTotalRetencion(totalRetencionTemporal);
    const totalAPagarTemporal = totalFacturaTemporal - totalRetencionTemporal;
    setTotalPagar(totalAPagarTemporal);

    setFormState &&
      setFormState((prevState: FormState) => ({
        ...prevState,
        providerInvoiceSubtotal: setDecimalPlaces(subtotal, 2),
        providerInvoiceVAT: setDecimalPlaces(totalMontoIva, 2),
        providerInvoiceSubtotal2: setDecimalPlaces(0, 2),
        providerInvoiceVAT2: setDecimalPlaces(totalExentoIva, 2),
        providerInvoiceTotal: setDecimalPlaces(totalFacturaTemporal, 2),
        providerInvoiceToPay: setDecimalPlaces(totalAPagarTemporal, 2),
        providerInvoiceRetention: setDecimalPlaces(totalRetencionTemporal, 2),
        providerInvoiceDiscount: setDecimalPlaces(totalDescuentos, 2),
      }));
    if (!createMode) {
      taxes.forEach((tax) => {
        let found = false;
        groupedTaxes.forEach((row) => {
          if (tax.taxCode === row.taxCode) {
            found = true;
          }
        });

        if (!found) {
          groupedTaxes.push({
            ...tax,
            taxState: false,
          });
        }
      });
    }
    setTaxes(groupedTaxes);
  }, [
    subtotal,
    totalDescuentos,
    totalMontoIva,
    totalExentoIva,
    groupedTaxes,
    groupedRetencionesFooter,
  ]);

  useEffect(() => {
    if (!thereIsRetention) {
      setValidatedRetentionValue(true);
      return;
    }

    const isRetentionValueValid = totalBase === totalFactura;

    setValidatedRetentionValue(isRetentionValueValid);
  }, [totalBase, totalFactura]);

  /**
   * Clears all retentions from the rows and updates the state.
   */
  const handleDeleteAllRetenciones = () => {
    const updatedRows =
      rows?.map((row) => {
        return { ...row, retentions: [] };
      }) || [];

    setRows(updatedRows);
  };

  /**
   * Handles the deletion of a retention from the groupedRetenciones list and updates the rows.
   * @param retentionId - The ID of the retention to be deleted.
   * @param retentionType - The type of the retention to be deleted.
   */
  const handleDeleteRetencion = (
    retentionId: number,
    retentionType: string
  ) => {
    const newRetencionList = [...groupedRetencionesFooter];
    const index = newRetencionList.findIndex(
      (retencion) =>
        retencion.retentionId === retentionId &&
        retencion.retentionType === retentionType
    );

    if (index !== -1) {
      newRetencionList.splice(index, 1);
    }

    const updatedRows =
      rows?.map((row) => {
        const updatedRetentions = row.retentions.filter(
          (retention: RetencionType) =>
            retention.retentionId !== retentionId ||
            retention.retentionType !== retentionType
        );
        return { ...row, retentions: updatedRetentions };
      }) || [];

    setRows(updatedRows);
    setGroupedRetencionesFooter(newRetencionList);
  };

  const handleRetencionBaseChange = (newBase: number | null, index: number) => {
    if (newBase !== null) {
      const newRetencionList = [...groupedRetencionesFooter];
      newRetencionList[index].base = newBase;
      newRetencionList[index].monto = setDecimalPlaces(
        getPercentageValue(
          newBase,
          newRetencionList[index].retentionPercentage
        ),
        2
      );
      setGroupedRetencionesFooter(newRetencionList);
    }
  };

  const handleAddNewRetencion = () => {
    const newRetencionList = [
      ...groupedRetencionesFooter,
      {
        retentionId: 0,
        retencionCode: '',
        retentionDetail: '',
        retentionType: '',
        retentionPercentage: 0,
        base: 0,
        monto: 0,
        isControlled: props.formState?.isControlledRetencion,
      },
    ];
    setGroupedRetencionesFooter(newRetencionList);
  };

  useEffect(() => {
    setGroupedRetenciones(groupedRetencionesFooter);
  }, [groupedRetencionesFooter]);

  /**
   * Handles the change event for the RetencionType dropdown.
   *
   * @param event - The React synthetic event.
   * @param newValue - The selected RetencionType value.
   * @param index - The index of the RetencionType in the groupedRetenciones array.
   */
  const onChangeRetencion = (
    event: React.SyntheticEvent<Element, Event>,
    newValue: RetencionType | null,
    index: number
  ) => {
    if (newValue === null) return;
    event.stopPropagation();
    const newRetencionList = [...groupedRetencionesFooter];
    const prevRetencion = newRetencionList[index];
    newRetencionList[index] = {
      retentionId: newValue.retentionId,
      retencionCode: newValue.retencionCode,
      retentionDetail: newValue.retentionDetail,
      retentionType: newValue.retentionType,
      retentionPercentage: newValue.retentionPercentage,
      base: groupedRetencionesFooter[index].base,
      monto: setDecimalPlaces(
        getPercentageValue(
          groupedRetencionesFooter[index].base,
          newValue.retentionPercentage
        ),
        2
      ),
      isControlled: formState.isControlledRetencion,
    };

    // Modify rows that match the changed retention
    const updatedRows =
      rows.map((row) => {
        const hasRetention = row.retentions.some(
          (retention: RetencionType) =>
            retention.retentionId === prevRetencion.retentionId &&
            retention.retentionType === prevRetencion.retentionType
        );

        if (!hasRetention) {
          return {
            ...row,
            retentions: [...row.retentions, newValue],
          };
        }

        return {
          ...row,
          retentions: row.retentions.map((retention: RetencionType) => {
            if (
              retention.retentionId === prevRetencion.retentionId &&
              retention.retentionType === prevRetencion.retentionType
            ) {
              return newValue;
            }
            return retention;
          }),
        };
      }) || [];

    setRows(updatedRows);
  };

  useEffect(() => {
    const shouldEditRetencion =
      createMode ||
      (editMode &&
        formState.providerInvoiceStatusId === EstadoDocumentoEnum.GENERADO);

    setEditRetencion(shouldEditRetencion ?? false);
  }, [createMode, editMode, formState.providerInvoiceStatusId]);

  return (
    rows.length > 0 && (
      <Table>
        <TableBody>
          <TableRow>
            <StyledTableCell textAlign="right" fontWeight="bold" colSpan={7} />
            <StyledTableCell
              textAlign="left"
              fontWeight="bold"
              width={'15%'}
              colSpan={1}
            >
              <div>Subtotal</div>
            </StyledTableCell>
            <StyledTableCell textAlign="right" width={'12%'} colSpan={1}>
              <div>{setCurrencyNumber(subtotal)}</div>
            </StyledTableCell>
          </TableRow>
          <TableRow>
            <StyledTableCell
              textAlign="center"
              fontWeight="bold"
              rowSpan={1}
              colSpan={6}
              sx={{ height: '3.5vh' }}
            >
              <div className={styles.headerTitleGreen}>
                {thereIsRetention ? 'Retención De Impuestos' : 'Sin Retención'}
              </div>
            </StyledTableCell>
            <StyledTableCell rowSpan={2} colSpan={1} sx={{ height: '3.5vh' }} />
            <StyledTableCell
              textAlign="left"
              fontWeight="bold"
              rowSpan={2}
              sx={{ height: '3.5vh' }}
            >
              <div>Total No Objeto De IVA</div>
            </StyledTableCell>
            <StyledTableCell
              textAlign="right"
              rowSpan={2}
              sx={{ height: '3.5vh' }}
            >
              <div>{setCurrencyNumber(totalExentoIva)}</div>
            </StyledTableCell>
          </TableRow>
          <TableRow>
            <StyledTableCell rowSpan={1} colSpan={6} sx={{ height: '3.5vh' }} />
          </TableRow>
          <TableRow>
            {thereIsRetention ? (
              <TableCell colSpan={6} rowSpan={7}>
                <Grid container direction="column">
                  {editRetencion && (
                    <Grid item sx={{ margin: 1 }}>
                      <Box display="flex" justifyContent="space-between">
                        <FormControlLabel
                          control={
                            <Switch
                              checked={formState.isControlledRetencion}
                              onChange={(event) =>
                                setFormState({
                                  ...formState,
                                  isControlledRetencion: event.target.checked,
                                })
                              }
                            />
                          }
                          label={
                            formState.isControlledRetencion
                              ? 'Retencion Controlada'
                              : 'Retencion No Controlada'
                          }
                        />
                        <Box display="flex" justifyContent="flex-end">
                          <Tooltip title="Agregar Retención">
                            <IconButton
                              onClick={handleAddNewRetencion}
                              disabled={!allowAddRetencion}
                              sx={{ mr: 2 }}
                            >
                              <AddCircle />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Eliminar Todas Las Retenciones">
                            <IconButton
                              onClick={handleDeleteAllRetenciones}
                              sx={{ mr: 2 }}
                            >
                              <RemoveCircle />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>
                    </Grid>
                  )}
                  <Grid item>
                    <TableContainer component={Paper}>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell width={'8%'}>
                              <div className={styles.headerTitleGreen}>
                                Código
                              </div>
                            </TableCell>
                            <TableCell width={'52%'}>
                              <div className={styles.headerTitleGreen}>
                                Descripción Del Impuesto
                              </div>
                            </TableCell>
                            <TableCell width={'10%'}>
                              <div className={styles.headerTitleGreen}>
                                % Retenciones
                              </div>
                            </TableCell>
                            <TableCell width={'10%'}>
                              <div className={styles.headerTitleGreen}>
                                Base
                              </div>
                            </TableCell>
                            <TableCell width={'10%'}>
                              <div className={styles.headerTitleGreen}>
                                Monto
                              </div>
                            </TableCell>
                            {editRetencion && (
                              <TableCell width={'10%'}>
                                <div className={styles.headerTitleGreen}>
                                  Acciones
                                </div>
                              </TableCell>
                            )}
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {groupedRetencionesFooter.map((retencion, index) => (
                            <TableRow
                              key={`${retencion.retentionId}-${retencion.retentionType}`}
                            >
                              <StyledTableCell>
                                {retencion.retencionCode}
                              </StyledTableCell>
                              <StyledTableCell>
                                <Autocomplete
                                  className={styles.genericFieldStyle}
                                  options={retencionList}
                                  readOnly={!editRetencion}
                                  getOptionLabel={(option) =>
                                    option.retentionDetail ?? null
                                  }
                                  filterSelectedOptions
                                  style={{ width: '100%' }}
                                  onChange={(event, option) =>
                                    onChangeRetencion(event, option, index)
                                  }
                                  value={
                                    retencion.retentionId === 0
                                      ? null
                                      : retencionList.find(
                                          (retencionTable) =>
                                            retencion.retentionId ===
                                              retencionTable.retentionId &&
                                            retencion.retentionType ===
                                              retencionTable.retentionType
                                        )
                                  }
                                  filterOptions={(options, { inputValue }) => {
                                    return options.filter(
                                      (option) =>
                                        option.retencionCode.includes(
                                          inputValue
                                        ) ||
                                        option.retentionDetail
                                          .toLowerCase()
                                          .includes(inputValue.toLowerCase())
                                    );
                                  }}
                                  isOptionEqualToValue={(
                                    option: RetencionType,
                                    value: RetencionType
                                  ) =>
                                    option && value
                                      ? option.retentionId ===
                                          value.retentionId &&
                                        option.retentionType ===
                                          value.retentionType
                                      : false
                                  }
                                  noOptionsText="Sin resultados"
                                  renderOption={(
                                    props,
                                    option: RetencionType
                                  ) => (
                                    <li
                                      {...props}
                                      key={`${option.retentionId}-${option.retentionDetail}`}
                                    >
                                      {`${option.retencionCode} - ${option.retentionDetail}`}
                                    </li>
                                  )}
                                  renderInput={(params) => (
                                    <TextField
                                      {...params}
                                      variant="outlined"
                                      InputProps={{
                                        ...params.InputProps,
                                        className: `${styles.textWhiteStyle} ${styles.textFieldNoBorder}`,
                                        style: {
                                          color: '#fff',
                                          backgroundColor: 'transparent',
                                          paddingRight: '0',
                                        },
                                        endAdornment: null,
                                      }}
                                    />
                                  )}
                                />
                              </StyledTableCell>
                              <StyledTableCell>
                                {setDecimalPlacesString(
                                  retencion.retentionPercentage,
                                  2
                                )}
                              </StyledTableCell>
                              <StyledTableCell textAlign="right">
                                <div>
                                  <InputNumber
                                    min={0}
                                    value={retencion.base}
                                    onChange={(value) =>
                                      handleRetencionBaseChange(value, index)
                                    }
                                    readOnly={
                                      formState.isControlledRetencion ||
                                      !editRetencion
                                    }
                                    precision={2}
                                    size="small"
                                    variant="borderless"
                                    controls={false}
                                    className="mi-input-number"
                                    style={{
                                      marginRight: '-5%',
                                    }}
                                  />
                                </div>
                              </StyledTableCell>
                              <StyledTableCell textAlign="right">
                                <div>{retencion.monto.toFixed(2)}</div>
                              </StyledTableCell>
                              {editRetencion && (
                                <StyledTableCell textAlign="center">
                                  <div>
                                    <IconButton
                                      onClick={() =>
                                        handleDeleteRetencion(
                                          retencion.retentionId,
                                          retencion.retentionType
                                        )
                                      }
                                    >
                                      <Delete />
                                    </IconButton>
                                  </div>
                                </StyledTableCell>
                              )}
                            </TableRow>
                          ))}
                          <TableRow>
                            <StyledTableCell
                              colSpan={3}
                              textAlign="center"
                              fontWeight="bold"
                            >
                              <div className={styles.headerTitleGreen}>
                                Total
                              </div>
                            </StyledTableCell>
                            <StyledTableCell textAlign="right">
                              <div>{totalBase.toFixed(2)}</div>
                            </StyledTableCell>
                            <StyledTableCell textAlign="right">
                              <div>{totalRetencion.toFixed(2)}</div>
                            </StyledTableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Grid>
                </Grid>
              </TableCell>
            ) : (
              <TableCell colSpan={6} rowSpan={7} />
            )}

            <StyledTableCell colSpan={1} />
            <StyledTableCell textAlign="left" fontWeight="bold" colSpan={1}>
              <div>Total Descuentos</div>
            </StyledTableCell>
            <StyledTableCell textAlign="right" colSpan={1}>
              <div>{setCurrencyNumber(totalDescuentos)}</div>
            </StyledTableCell>
          </TableRow>
          {groupedTaxes
            .filter((row) => row.taxState)
            .map((row, index) => (
              <TableRow key={index}>
                <StyledTableCell colSpan={1} />
                <StyledTableCell textAlign="left" fontWeight="bold" colSpan={1}>
                  <div>IVA {row.taxDescription}</div>
                </StyledTableCell>
                <StyledTableCell textAlign="right" colSpan={1}>
                  <div>{setCurrencyNumber(row.taxAmount)}</div>
                </StyledTableCell>
              </TableRow>
            ))}
          <TableRow>
            <StyledTableCell colSpan={1} />
            <StyledTableCell textAlign="left" fontWeight="bold" colSpan={1}>
              <div>Total Factura</div>
            </StyledTableCell>
            <StyledTableCell textAlign="right" colSpan={1}>
              <div>{setCurrencyNumber(totalFactura)}</div>
            </StyledTableCell>
          </TableRow>
          <TableRow>
            <StyledTableCell colSpan={1} />
            <StyledTableCell textAlign="left" fontWeight="bold" colSpan={1}>
              <div>Total Retención</div>
            </StyledTableCell>
            <StyledTableCell textAlign="right" colSpan={1}>
              <div>{setCurrencyNumber(totalRetencion)}</div>
            </StyledTableCell>
          </TableRow>
          <TableRow>
            <StyledTableCell colSpan={1} />
            <StyledTableCell textAlign="left" fontWeight="bold" colSpan={1}>
              <div>Total A Pagar</div>
            </StyledTableCell>
            <StyledTableCell textAlign="right" colSpan={1}>
              <div>{setCurrencyNumber(totalPagar)}</div>
            </StyledTableCell>
          </TableRow>
          <TableRow>
            <StyledTableCell colSpan={1} />
            <StyledTableCell colSpan={2} />
          </TableRow>
          <TableRow>
            <StyledTableCell colSpan={1} />
            <StyledTableCell colSpan={2} />
          </TableRow>
          <TableRow>
            <StyledTableCell colSpan={9} />
          </TableRow>
        </TableBody>
      </Table>
    )
  );
}
