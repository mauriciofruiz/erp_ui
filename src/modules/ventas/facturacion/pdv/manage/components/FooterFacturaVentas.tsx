import { setCurrencyNumber, setDecimalPlaces } from '@/functions';
import { FormState, StyledTableCell } from '@/hooks';
import {
  ClientPersonCreditPostType,
  ImpuestoDocumentoInterface,
  RetencionType,
} from '@/types';
import { ToggleOff, ToggleOn } from '@mui/icons-material';
import {
  IconButton,
  InputAdornment,
  Table,
  TableBody,
  TableRow,
} from '@mui/material';
import { ClassNameMap } from '@mui/styles';
import { GridSlotsComponentsProps, GridValidRowModel } from '@mui/x-data-grid';
import { InputNumber } from 'antd';
import { useMemo } from 'react';

declare module '@mui/x-data-grid' {
  interface FooterPropsOverrides {
    retencionList: RetencionType[];
    formState: FormState;
    rows: readonly GridValidRowModel[];
    setRows: React.Dispatch<React.SetStateAction<readonly GridValidRowModel[]>>;
    createMode: boolean;
    styles: ClassNameMap;
    editMode: boolean;
    onInputNumberChange: (value: number, field: string) => void;
    selectedCliente: ClientPersonCreditPostType | null;
    thereIsDiscount: boolean;
    setThereIsDiscount: React.Dispatch<React.SetStateAction<boolean>>;
  }
}
export function FooterFacturaVentas(
  props: NonNullable<GridSlotsComponentsProps['footer']>
) {
  // const selectedCliente = useMemo(
  //   () => props.selectedCliente || null,
  //   [props.selectedCliente]
  // );
  const createMode = useMemo(
    () => props.createMode || false,
    [props.createMode]
  );

  const editMode = useMemo(() => props.editMode || false, [props.editMode]);

  const onInputNumberChange = useMemo(
    () => props.onInputNumberChange || (() => {}),
    [props.onInputNumberChange]
  );

  const rows = useMemo(() => props.rows || [], [props.rows]);

  // const setRows = useMemo(() => props.setRows || (() => {}), [props.setRows]);

  const styles: ClassNameMap = useMemo(
    () => props.styles || {},
    [props.styles]
  );

  // const retencionList = useMemo(
  //   () => props.retencionList || [],
  //   [props.retencionList]
  // );

  const formState = useMemo(() => props.formState || {}, [props.formState]);

  // const retenciones: RetencionGroupType[] = useMemo(
  //   () => props.formState?.retenciones || [],
  //   [props.formState?.retenciones]
  // );

  const taxes: ImpuestoDocumentoInterface[] = useMemo(
    () => props.formState?.taxes || [],
    [props.formState?.taxes]
  );

  const thereIsDiscount = useMemo(
    () => props.thereIsDiscount || false,
    [props.thereIsDiscount]
  );

  const setThereIsDiscount = useMemo(
    () => props.setThereIsDiscount || (() => {}),
    [props.setThereIsDiscount]
  );

  // const [editRetencion, setEditRetencion] = useState(false);

  // const [groupedRetenciones, setGroupedRetenciones] = useState<
  //   RetencionGroupType[]
  // >([]);

  // const [thereIsRetencion, setThereIsRetencion] = useState(false);

  // const [totalBase, setTotalBase] = useState(0);

  // const [totalRetencion, setTotalRetencion] = useState(0);

  /**
   * Clears all retentions from the rows and updates the state.
   */
  // const handleDeleteAllRetenciones = (noRetencion: boolean) => {
  //   setThereIsRetencion(noRetencion);

  //   const retentionSourceId = noRetencion
  //     ? selectedCliente?.sourceRetentionId
  //     : undefined;
  //   const retentionIVAId = noRetencion
  //     ? selectedCliente?.ivaRetentionId
  //     : undefined;

  //   const updatedRows =
  //     rows.map((row) => ({
  //       ...row,
  //       retentionSourceId,
  //       retentionIVAId,
  //       retentions: [],
  //     })) || [];

  //   setRows(updatedRows);
  // };

  /**
   * Handles the deletion of a retention from the groupedRetenciones list and updates the rows.
   * @param retentionId - The ID of the retention to be deleted.
   * @param retentionType - The type of the retention to be deleted.
   */
  // const handleDeleteRetencion = (
  //   retentionId: number,
  //   retentionType: string
  // ) => {
  //   const newRetencionList = [...groupedRetenciones];
  //   const index = newRetencionList.findIndex(
  //     (retencion) =>
  //       retencion.retentionId === retentionId &&
  //       retencion.retentionType === retentionType
  //   );

  //   if (index !== -1) {
  //     newRetencionList.splice(index, 1);
  //   }

  //   const updatedRows =
  //     props.rows?.map((row) => {
  //       const updatedRetentions = row.retentions.filter(
  //         (retention: RetencionType) =>
  //           retention.retentionId !== retentionId ||
  //           retention.retentionType !== retentionType
  //       );
  //       if (
  //         retentionType === ParametersEnum.RETENCION_FUENTE_PARAMETER.toString()
  //       ) {
  //         return {
  //           ...row,
  //           retentionSourceId: undefined,
  //           retentions: updatedRetentions,
  //         };
  //       } else if (
  //         retentionType === ParametersEnum.RETENCION_IVA_PARAMETER.toString()
  //       ) {
  //         return {
  //           ...row,
  //           retentionIVAId: undefined,
  //           retentions: updatedRetentions,
  //         };
  //       }
  //       return row;
  //     }) || [];

  //   props?.setRows && props.setRows(updatedRows);
  // };

  // const handleAddNewRetencion = () => {
  //   const newRetencionList = [
  //     ...groupedRetenciones,
  //     {
  //       retentionId: 0,
  //       retencionCode: '',
  //       retentionDetail: '',
  //       retentionType: '',
  //       retentionPercentage: 0,
  //       base: 0,
  //       monto: 0,
  //       isControlled: props.formState.isControlledRetencion,
  //     },
  //   ];
  //   setGroupedRetenciones(newRetencionList);
  // };

  // useEffect(() => {
  //   setThereIsRetencion(retenciones.length > 0);
  //   setGroupedRetenciones(retenciones);
  // }, [retenciones]);

  /**
   * Handles the change event for the RetencionType dropdown.
   *
   * @param event - The React synthetic event.
   * @param newValue - The selected RetencionType value.
   * @param index - The index of the RetencionType in the groupedRetenciones array.
   */
  // const onChangeRetencion = (
  //   event: React.SyntheticEvent<Element, Event>,
  //   newValue: RetencionType | null,
  //   index: number
  // ) => {
  //   if (newValue === null) return;
  //   event.stopPropagation();
  //   const newRetencionList = [...groupedRetenciones];
  //   const prevRetencion = newRetencionList[index];
  //   newRetencionList[index] = {
  //     retentionId: newValue.retentionId,
  //     retencionCode: newValue.retencionCode,
  //     retentionDetail: newValue.retentionDetail,
  //     retentionType: newValue.retentionType,
  //     retentionPercentage: newValue.retentionPercentage,
  //     base: groupedRetenciones[index].base,
  //     monto: setDecimalPlaces(
  //       getPercentageValue(
  //         groupedRetenciones[index].base,
  //         newValue.retentionPercentage
  //       ),
  //       2
  //     ),
  //     isControlled: true,
  //   };

  //   const updatedRows =
  //     rows.map((row) => {
  //       const hasRetention = row.retentions.some(
  //         (retention: RetencionType) =>
  //           retention.retentionId === prevRetencion.retentionId &&
  //           retention.retentionType === prevRetencion.retentionType
  //       );

  //       if (!hasRetention) {
  //         if (
  //           newValue.retentionType ===
  //           ParametersEnum.RETENCION_FUENTE_PARAMETER.toString()
  //         ) {
  //           return {
  //             ...row,
  //             retentionSourceId: newValue.retentionId,
  //             retentions: [...row.retentions, newValue],
  //           };
  //         } else if (
  //           newValue.retentionType ===
  //           ParametersEnum.RETENCION_IVA_PARAMETER.toString()
  //         ) {
  //           return {
  //             ...row,
  //             retentionIVAId: newValue.retentionId,
  //             retentions: [...row.retentions, newValue],
  //           };
  //         }
  //       }

  //       return {
  //         ...row,
  //         retentions: row.retentions.map((retention: RetencionType) => {
  //           if (
  //             retention.retentionId === prevRetencion.retentionId &&
  //             retention.retentionType === prevRetencion.retentionType
  //           ) {
  //             return newValue;
  //           }
  //           return retention;
  //         }),
  //         retentionIVAId:
  //           newValue.retentionType ===
  //           ParametersEnum.RETENCION_IVA_PARAMETER.toString()
  //             ? newValue.retentionId
  //             : newRetencionList.find(
  //                 (retention: RetencionGroupType) =>
  //                   retention.retentionType ===
  //                   ParametersEnum.RETENCION_IVA_PARAMETER.toString()
  //               )?.retentionId,
  //         retentionSourceId:
  //           newValue.retentionType ===
  //           ParametersEnum.RETENCION_FUENTE_PARAMETER.toString()
  //             ? newValue.retentionId
  //             : newRetencionList.find(
  //                 (retention: RetencionGroupType) =>
  //                   retention.retentionType ===
  //                   ParametersEnum.RETENCION_FUENTE_PARAMETER.toString()
  //               )?.retentionId,
  //       };
  //     }) || [];

  //   setRows(updatedRows);
  // };

  // useEffect(() => {
  //   // const shouldEditRetencion =
  //   //   (createMode || editMode) && !formState.hasCredit;
  //   setEditRetencion(false);
  // }, [createMode, editMode, formState.hasCredit]);

  // useEffect(() => {
  //   const baseTotal = groupedRetenciones.reduce(
  //     (acc, retencion) => acc + retencion.base,
  //     0
  //   );

  //   const montoTotal = groupedRetenciones.reduce(
  //     (acc, retencion) => acc + retencion.monto,
  //     0
  //   );

  //   setTotalBase(baseTotal);
  //   setTotalRetencion(montoTotal);
  // }, [groupedRetenciones]);

  // const getValue = useCallback(
  //   (value: RetencionGroupType) => {
  //     if (retencionList.length > 0 && value.retentionId !== 0) {
  //       const retencion = retencionList.find(
  //         (ret) =>
  //           ret.retentionId === value.retentionId &&
  //           ret.retentionType === value.retentionType
  //       );
  //       if (retencion) {
  //         return retencion;
  //       }
  //       return null;
  //     }

  //     return null;
  //   },
  //   [retencionList, groupedRetenciones]
  // );

  return (
    rows &&
    rows.length > 0 && (
      <Table>
        <TableBody>
          <TableRow>
            <StyledTableCell
              textAlign="center"
              fontWeight="bold"
              rowSpan={1}
              colSpan={6}
              sx={{ height: '3.5vh' }}
            >
              <div className={styles.headerTitleGreen}>
                {'Detalle Descuentos'}
              </div>
            </StyledTableCell>
            <StyledTableCell colSpan={1} rowSpan={3} />
            <StyledTableCell
              textAlign="left"
              fontWeight="bold"
              width={'15%'}
              colSpan={1}
            >
              <div>Subtotal IVA</div>
            </StyledTableCell>
            <StyledTableCell textAlign="right" width={'12%'} colSpan={1}>
              <div>{setCurrencyNumber(formState.subtotal)}</div>
            </StyledTableCell>
          </TableRow>
          <TableRow>
            <StyledTableCell
              textAlign="left"
              fontWeight="bold"
              colSpan={2}
              sx={{ height: '3.5vh' }}
            >
              <div>Descuento Por Categoría</div>
            </StyledTableCell>
            <StyledTableCell
              textAlign="right"
              colSpan={1}
              sx={{ height: '3.5vh' }}
            >
              <div>{setCurrencyNumber(formState.categoryDiscount)}</div>
            </StyledTableCell>
            <StyledTableCell
              textAlign="left"
              fontWeight="bold"
              colSpan={2}
              sx={{ height: '3.5vh' }}
            >
              <div>Descuento Por Promoción</div>
            </StyledTableCell>
            <StyledTableCell
              textAlign="right"
              colSpan={1}
              sx={{ height: '3.5vh' }}
            >
              <div>{setCurrencyNumber(formState.promotionDiscount)}</div>
            </StyledTableCell>
            <StyledTableCell
              textAlign="left"
              fontWeight="bold"
              rowSpan={1}
              sx={{ height: '3.5vh' }}
            >
              <div>Subtotal No Objeto De IVA</div>
            </StyledTableCell>
            <StyledTableCell
              textAlign="right"
              rowSpan={1}
              sx={{ height: '3.5vh' }}
            >
              <div>{setCurrencyNumber(formState.subtotalNoObjetoIva)}</div>
            </StyledTableCell>
          </TableRow>
          <TableRow>
            <StyledTableCell
              textAlign="left"
              fontWeight="bold"
              colSpan={2}
              sx={{ height: '3.5vh' }}
            >
              <div>Descuento Especial</div>
            </StyledTableCell>
            <StyledTableCell
              textAlign="right"
              colSpan={1}
              sx={{ height: '3.5vh' }}
            >
              <div>{setCurrencyNumber(formState.specialDiscount)}</div>
            </StyledTableCell>
            <StyledTableCell
              textAlign="left"
              fontWeight="bold"
              colSpan={1}
              sx={{ height: '3.5vh' }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>Descuento Forma De Pago</div>
                <div>
                  <InputAdornment position="end">
                    <IconButton
                      edge="end"
                      disabled={!(createMode || editMode)}
                      onClick={() => {
                        const value = !thereIsDiscount ? 0.08 : 0;
                        setThereIsDiscount(!thereIsDiscount);
                        onInputNumberChange(
                          value,
                          'paymentMethodDiscountPercentage'
                        );
                      }}
                      sx={{
                        backgroundColor: 'transparent',
                        color: thereIsDiscount ? 'primary.main' : 'white',
                        transform: 'scale(1.5)',
                      }}
                    >
                      {thereIsDiscount ? <ToggleOn /> : <ToggleOff />}
                    </IconButton>
                  </InputAdornment>
                </div>
              </div>
            </StyledTableCell>
            <StyledTableCell textAlign="right">
              <div>
                <InputNumber
                  min={0}
                  max={0.08}
                  value={formState.paymentMethodDiscountPercentage}
                  onChange={(value) =>
                    onInputNumberChange(
                      value,
                      'paymentMethodDiscountPercentage'
                    )
                  }
                  readOnly={!thereIsDiscount}
                  precision={2}
                  size="small"
                  variant="borderless"
                  controls={false}
                  className="mi-input-number"
                  formatter={(value) => `${value * 100} %`}
                  parser={(value) =>
                    setDecimalPlaces(
                      Number(
                        value
                          ?.replace('%', '')
                          .replace(',', '')
                          .replace('.', '') as unknown as number
                      ) / 100,
                      6
                    )
                  }
                  onFocus={(e) => e.target.select()}
                />
              </div>
            </StyledTableCell>
            <StyledTableCell
              textAlign="right"
              colSpan={1}
              sx={{ height: '3.5vh' }}
            >
              <div>{setCurrencyNumber(formState.paymentMethodDiscount)}</div>
            </StyledTableCell>
            <StyledTableCell textAlign="left" fontWeight="bold" colSpan={1}>
              <div>Total Descuentos</div>
            </StyledTableCell>
            <StyledTableCell textAlign="right" colSpan={1}>
              <div>{setCurrencyNumber(formState.totalDiscount)}</div>
            </StyledTableCell>
          </TableRow>
          <TableRow>
            <StyledTableCell colSpan={6} rowSpan={taxes.length + 3} />
            <StyledTableCell colSpan={1} rowSpan={taxes.length + 3} />
          </TableRow>
          {taxes
            .filter((row) => row.taxState)
            .map((row, index) => (
              <TableRow key={index}>
                <StyledTableCell textAlign="left" fontWeight="bold" colSpan={1}>
                  <div>IVA {row.taxDescription}</div>
                </StyledTableCell>
                <StyledTableCell textAlign="right" colSpan={1}>
                  <div>{setCurrencyNumber(row.taxAmount)}</div>
                </StyledTableCell>
              </TableRow>
            ))}
          <TableRow>
            {/* <StyledTableCell textAlign="center" fontWeight="bold" colSpan={6}>
              <div className={styles.headerTitleGreen}>
                {thereIsRetencion ? 'Retención De Impuestos' : 'Sin Retención'}
              </div>
            </StyledTableCell> */}
            <StyledTableCell textAlign="left" fontWeight="bold" colSpan={1}>
              <div>Total Factura</div>
            </StyledTableCell>
            <StyledTableCell textAlign="right" colSpan={1}>
              <div>{setCurrencyNumber(formState.total)}</div>
            </StyledTableCell>
          </TableRow>
          {/* <TableRow> */}
          {/* <TableCell colSpan={6} rowSpan={4}> */}
          {/* <Grid container direction="column"> */}
          {/* {editRetencion && (
                  <Grid item sx={{ margin: 1 }}>
                    <Box display="flex" justifyContent="space-between">
                      <FormControlLabel
                        control={
                          <Switch
                            checked={thereIsRetencion}
                            onChange={(event) =>
                              handleDeleteAllRetenciones(event.target.checked)
                            }
                          />
                        }
                        label={
                          thereIsRetencion
                            ? 'Desactivar Retención'
                            : 'Activar Retención'
                        }
                      />
                      {thereIsRetencion && (
                        <Box display="flex" justifyContent="flex-end">
                          <Tooltip title="Agregar Retención">
                            <IconButton
                              disabled={groupedRetenciones.length >= 2}
                              onClick={handleAddNewRetencion}
                              sx={{ mr: 2 }}
                            >
                              <AddCircle />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Eliminar Todas Las Retenciones">
                            <IconButton
                              onClick={() => handleDeleteAllRetenciones(false)}
                              sx={{ mr: 2 }}
                            >
                              <RemoveCircle />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      )}
                    </Box>
                  </Grid>
                )} */}

          {/* {thereIsRetencion ? (
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
                          {groupedRetenciones.map((retencion, index) => (
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
                                    option
                                      ? option.retentionDetail
                                      : 'Sin datos'
                                  }
                                  filterSelectedOptions
                                  style={{ width: '100%' }}
                                  onChange={(event, option) =>
                                    onChangeRetencion(event, option, index)
                                  }
                                  value={getValue(retencion)}
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
                                {retencion.retentionPercentage.toFixed(2)}
                              </StyledTableCell>
                              <StyledTableCell textAlign="right">
                                <div>{setCurrencyNumber(retencion.base)}</div>
                              </StyledTableCell>
                              <StyledTableCell textAlign="right">
                                <div>{setCurrencyNumber(retencion.monto)}</div>
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
                              <div>{setCurrencyNumber(totalBase)}</div>
                            </StyledTableCell>
                            <StyledTableCell textAlign="right">
                              <div>{setCurrencyNumber(totalRetencion)}</div>
                            </StyledTableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Grid>
                ) : (
                  <TableCell colSpan={6} rowSpan={4} />
                )} */}
          {/* </Grid> */}
          {/* </TableCell> */}

          {/* <StyledTableCell textAlign="left" fontWeight="bold" colSpan={1}>
              <div>Total Retención</div>
            </StyledTableCell>
            <StyledTableCell textAlign="right" colSpan={1}>
              <div>{setCurrencyNumber(formState.retentionValue)}</div>
            </StyledTableCell>
          </TableRow> */}
          <TableRow>
            <StyledTableCell textAlign="left" fontWeight="bold" colSpan={1}>
              <div>Total A Cobrar</div>
            </StyledTableCell>
            <StyledTableCell textAlign="right" colSpan={1}>
              <div>{setCurrencyNumber(formState.totalToCharge)}</div>
            </StyledTableCell>
          </TableRow>
          {/* <TableRow>
            <StyledTableCell colSpan={1} />
            <StyledTableCell colSpan={2} />
          </TableRow>
          <TableRow>
            <StyledTableCell colSpan={1} />
            <StyledTableCell colSpan={2} />
          </TableRow>
          <TableRow>
            <StyledTableCell colSpan={9} />
          </TableRow> */}
        </TableBody>
      </Table>
    )
  );
}
