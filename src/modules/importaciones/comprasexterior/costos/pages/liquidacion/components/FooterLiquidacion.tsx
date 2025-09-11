import { setCurrencyNumber } from '@/functions';
import { FormState, StyledTableCell, useFacturaProveedorAsync } from '@/hooks';
import {
  Grid,
  IconButton,
  InputAdornment,
  Table,
  TableBody,
  TableHead,
  TableRow,
} from '@mui/material';
import { GridValidRowModel } from '@mui/x-data-grid';
import { GridSlotsComponentsProps } from '@mui/x-data-grid';
import { AccordionOtrosGastos } from './AccordionOtrosGastos';
import { LabeledInputNumber } from '@/modules/layout';
import { SettingsOutlined } from '@mui/icons-material';
import { useEffect, useMemo, useState } from 'react';
import { OptionsDialog } from './OptionsDialog';
import { FacturaProveedorResumeInterface } from '@/types';

declare module '@mui/x-data-grid' {
  interface FooterPropsOverrides {
    formState: FormState;
    rows: readonly GridValidRowModel[];
    onInputNumberChange: (value: number, field: string) => void;
    setRows: React.Dispatch<React.SetStateAction<readonly GridValidRowModel[]>>;
    setFormState: React.Dispatch<React.SetStateAction<FormState>>;
    createMode: boolean;
    editMode: boolean;
    idFacturasAsignadas: number[];
    setIdFacturasAsignadas: React.Dispatch<React.SetStateAction<number[]>>;
  }
}

export function FooterLiquidacion(
  props: NonNullable<GridSlotsComponentsProps['footer']>
) {
  const form = useMemo(() => props.formState || {}, [props.formState]);

  const rows = useMemo(() => props.rows || [], [props.rows]);

  const onInputNumberChange = useMemo(
    () => props.onInputNumberChange || (() => {}),
    [props.onInputNumberChange]
  );

  const setRows = props.setRows ?? (() => {});

  const setFormState = props.setFormState ?? (() => {});

  const createMode = props.createMode ?? false;

  const editMode = props.editMode ?? false;

  const [open, setOpen] = useState(false);

  const [fieldName, setFieldName] = useState('');

  const { fetchFacturasForLiquidacion } = useFacturaProveedorAsync();

  const [facturasList, setFacturasList] = useState<
    FacturaProveedorResumeInterface[]
  >([]);

  const idFacturasAsignadas = props.idFacturasAsignadas || [];

  const setIdFacturasAsignadas = props.setIdFacturasAsignadas || (() => {});

  useEffect(() => {
    if (rows.length > 0) {
      fetchFacturasForLiquidacion(form.importOpeningId)
        .then((response) => {
          setFacturasList(response as FacturaProveedorResumeInterface[]);
        })
        .catch((error) => {
          console.error('Error fetching facturas for liquidacion:', error);
        });
    }
  }, [rows.length, form.importOpeningId]);

  return (
    rows &&
    rows.length > 0 && (
      <>
        <OptionsDialog
          open={open}
          setOpen={setOpen}
          facturasList={facturasList}
          setFormState={setFormState}
          fieldName={fieldName}
          idFacturasAsignadas={idFacturasAsignadas}
          setIdFacturasAsignadas={setIdFacturasAsignadas}
        />
        <Grid container spacing={2} alignItems="center" sx={{ mt: 1, mb: 2 }}>
          <Grid item xs={12}>
            <AccordionOtrosGastos
              rows={rows}
              formState={form}
              setRows={setRows}
              setFormState={setFormState}
              createMode={createMode}
              editMode={editMode}
            />
          </Grid>
        </Grid>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
          }}
        >
          <Table
            style={{ marginRight: '2%', flex: '1 0 45%', minWidth: '300px' }}
          >
            <TableHead>
              <TableRow>
                <StyledTableCell textAlign="center" colSpan={4}>
                  <div>Otros Gastos</div>
                </StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <StyledTableCell
                  textAlign="left"
                  fontWeight="bold"
                  width={'10%'}
                  colSpan={1}
                >
                  <div>Transporte Flete</div>
                </StyledTableCell>
                <StyledTableCell textAlign="right" width={'9%'} colSpan={0.5}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <LabeledInputNumber
                      inputNumberProps={{
                        onChange: (value) =>
                          onInputNumberChange(
                            value as number,
                            'freightTransportOtherExpenses'
                          ),
                        value: form.freightTransportOtherExpenses,
                        min: 0,
                        defaultValue: 0,
                        controls: false,
                        precision: 2,
                        prefix: '$',
                        readOnly: !createMode && !editMode,
                        onFocus: (e: any) => e.target.select(),
                      }}
                    />
                    <div>
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => {
                            setFieldName('freightTransportOtherExpenses');
                            setOpen(true);
                          }}
                        >
                          <SettingsOutlined />
                        </IconButton>
                      </InputAdornment>
                    </div>
                  </div>
                </StyledTableCell>
                <StyledTableCell
                  textAlign="left"
                  fontWeight="bold"
                  width={'10%'}
                  colSpan={1}
                >
                  <div>Agente</div>
                </StyledTableCell>
                <StyledTableCell textAlign="right" width={'9%'} colSpan={0.5}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <LabeledInputNumber
                      inputNumberProps={{
                        onChange: (value) =>
                          onInputNumberChange(
                            value as number,
                            'agentOtherExpenses'
                          ),
                        value: form.agentOtherExpenses,
                        min: 0,
                        defaultValue: 0,
                        controls: false,
                        precision: 2,
                        readOnly: !createMode && !editMode,
                        prefix: '$',
                        onFocus: (e: any) => e.target.select(),
                      }}
                    />
                    <div>
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => {
                            setFieldName('agentOtherExpenses');
                            setOpen(true);
                          }}
                        >
                          <SettingsOutlined />
                        </IconButton>
                      </InputAdornment>
                    </div>
                  </div>
                </StyledTableCell>
              </TableRow>
              <TableRow>
                <StyledTableCell
                  textAlign="left"
                  fontWeight="bold"
                  width={'10%'}
                  colSpan={1}
                >
                  <div>Estibaje</div>
                </StyledTableCell>
                <StyledTableCell textAlign="right" width={'9%'} colSpan={0.5}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <LabeledInputNumber
                      inputNumberProps={{
                        onChange: (value) =>
                          onInputNumberChange(
                            value as number,
                            'stowageOtherExpenses'
                          ),
                        value: form.stowageOtherExpenses,
                        min: 0,
                        defaultValue: 0,
                        controls: false,
                        precision: 2,
                        readOnly: !createMode && !editMode,
                        prefix: '$',
                        onFocus: (e: any) => e.target.select(),
                      }}
                    />
                    <div>
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => {
                            setFieldName('stowageOtherExpenses');
                            setOpen(true);
                          }}
                        >
                          <SettingsOutlined />
                        </IconButton>
                      </InputAdornment>
                    </div>
                  </div>
                </StyledTableCell>
                <StyledTableCell
                  textAlign="left"
                  fontWeight="bold"
                  width={'10%'}
                  colSpan={1}
                >
                  <div>ISD</div>
                </StyledTableCell>
                <StyledTableCell textAlign="right" width={'9%'} colSpan={0.5}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <LabeledInputNumber
                      inputNumberProps={{
                        onChange: (value) =>
                          onInputNumberChange(
                            value as number,
                            'isdOtherExpenses'
                          ),
                        value: form.isdOtherExpenses,
                        min: 0,
                        defaultValue: 0,
                        controls: false,
                        precision: 2,
                        readOnly: !createMode && !editMode,
                        prefix: '$',
                        onFocus: (e: any) => e.target.select(),
                      }}
                    />
                    <div>
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => {
                            setFieldName('isdOtherExpenses');
                            setOpen(true);
                          }}
                        >
                          <SettingsOutlined />
                        </IconButton>
                      </InputAdornment>
                    </div>
                  </div>
                </StyledTableCell>
              </TableRow>
              <TableRow>
                <StyledTableCell
                  textAlign="left"
                  fontWeight="bold"
                  width={'10%'}
                  colSpan={1}
                >
                  <div>Bodegaje</div>
                </StyledTableCell>
                <StyledTableCell textAlign="right" width={'9%'} colSpan={0.5}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <LabeledInputNumber
                      inputNumberProps={{
                        onChange: (value) =>
                          onInputNumberChange(
                            value as number,
                            'warehousingOtherExpenses'
                          ),
                        value: form.warehousingOtherExpenses,
                        min: 0,
                        defaultValue: 0,
                        controls: false,
                        precision: 2,
                        readOnly: !createMode && !editMode,
                        prefix: '$',
                        onFocus: (e: any) => e.target.select(),
                      }}
                    />
                    <div>
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => {
                            setFieldName('warehousingOtherExpenses');
                            setOpen(true);
                          }}
                        >
                          <SettingsOutlined />
                        </IconButton>
                      </InputAdornment>
                    </div>
                  </div>
                </StyledTableCell>
                <StyledTableCell
                  textAlign="left"
                  fontWeight="bold"
                  width={'10%'}
                  colSpan={1}
                >
                  <div>Poliza</div>
                </StyledTableCell>
                <StyledTableCell textAlign="right" width={'9%'} colSpan={0.5}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <LabeledInputNumber
                      inputNumberProps={{
                        onChange: (value) =>
                          onInputNumberChange(
                            value as number,
                            'policyOtherExpenses'
                          ),
                        value: form.policyOtherExpenses,
                        min: 0,
                        defaultValue: 0,
                        controls: false,
                        precision: 2,
                        readOnly: !createMode && !editMode,
                        prefix: '$',
                        onFocus: (e: any) => e.target.select(),
                      }}
                    />
                    <div>
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => {
                            setFieldName('policyOtherExpenses');
                            setOpen(true);
                          }}
                        >
                          <SettingsOutlined />
                        </IconButton>
                      </InputAdornment>
                    </div>
                  </div>
                </StyledTableCell>
              </TableRow>
              <TableRow>
                <StyledTableCell
                  textAlign="left"
                  fontWeight="bold"
                  width={'10%'}
                  colSpan={1}
                >
                  <div>Gastos Locales</div>
                </StyledTableCell>
                <StyledTableCell textAlign="right" width={'9%'} colSpan={0.5}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <LabeledInputNumber
                      inputNumberProps={{
                        onChange: (value) =>
                          onInputNumberChange(
                            value as number,
                            'localExpensesOtherExpenses'
                          ),
                        value: form.localExpensesOtherExpenses,
                        min: 0,
                        defaultValue: 0,
                        controls: false,
                        precision: 2,
                        readOnly: !createMode && !editMode,
                        prefix: '$',
                        onFocus: (e: any) => e.target.select(),
                      }}
                    />
                    <div>
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => {
                            setFieldName('localExpensesOtherExpenses');
                            setOpen(true);
                          }}
                        >
                          <SettingsOutlined />
                        </IconButton>
                      </InputAdornment>
                    </div>
                  </div>
                </StyledTableCell>
                <StyledTableCell
                  textAlign="left"
                  fontWeight="bold"
                  width={'10%'}
                  colSpan={1}
                >
                  <div>Transporte Terrestre</div>
                </StyledTableCell>
                <StyledTableCell textAlign="right" width={'9%'} colSpan={0.5}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <LabeledInputNumber
                      inputNumberProps={{
                        onChange: (value) =>
                          onInputNumberChange(
                            value as number,
                            'landTransportOtherExpenses'
                          ),
                        value: form.landTransportOtherExpenses,
                        min: 0,
                        defaultValue: 0,
                        controls: false,
                        precision: 2,
                        readOnly: !createMode && !editMode,
                        prefix: '$',
                        onFocus: (e: any) => e.target.select(),
                      }}
                    />
                    <div>
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => {
                            setFieldName('landTransportOtherExpenses');
                            setOpen(true);
                          }}
                        >
                          <SettingsOutlined />
                        </IconButton>
                      </InputAdornment>
                    </div>
                  </div>
                </StyledTableCell>
              </TableRow>
              <TableRow>
                <StyledTableCell
                  textAlign="left"
                  fontWeight="bold"
                  width={'10%'}
                  colSpan={1}
                >
                  <div>Custodia</div>
                </StyledTableCell>
                <StyledTableCell textAlign="right" width={'9%'} colSpan={0.5}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <LabeledInputNumber
                      inputNumberProps={{
                        onChange: (value) =>
                          onInputNumberChange(
                            value as number,
                            'custodyOtherExpenses'
                          ),
                        value: form.custodyOtherExpenses,
                        min: 0,
                        defaultValue: 0,
                        controls: false,
                        precision: 2,
                        readOnly: !createMode && !editMode,
                        prefix: '$',
                        onFocus: (e: any) => e.target.select(),
                      }}
                    />
                    <div>
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => {
                            setFieldName('custodyOtherExpenses');
                            setOpen(true);
                          }}
                        >
                          <SettingsOutlined />
                        </IconButton>
                      </InputAdornment>
                    </div>
                  </div>
                </StyledTableCell>
                <StyledTableCell
                  textAlign="left"
                  fontWeight="bold"
                  width={'10%'}
                  colSpan={1}
                >
                  <div>Visto Bueno</div>
                </StyledTableCell>
                <StyledTableCell textAlign="right" width={'9%'} colSpan={0.5}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <LabeledInputNumber
                      inputNumberProps={{
                        onChange: (value) =>
                          onInputNumberChange(
                            value as number,
                            'goodViewOtherExpenses'
                          ),
                        value: form.goodViewOtherExpenses,
                        min: 0,
                        defaultValue: 0,
                        controls: false,
                        precision: 2,
                        readOnly: !createMode && !editMode,
                        prefix: '$',
                        onFocus: (e: any) => e.target.select(),
                      }}
                    />
                    <div>
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => {
                            setFieldName('goodViewOtherExpenses');
                            setOpen(true);
                          }}
                        >
                          <SettingsOutlined />
                        </IconButton>
                      </InputAdornment>
                    </div>
                  </div>
                </StyledTableCell>
              </TableRow>
              <TableRow>
                <StyledTableCell
                  textAlign="left"
                  fontWeight="bold"
                  width={'10%'}
                  colSpan={1}
                >
                  <div>Exoneración</div>
                </StyledTableCell>
                <StyledTableCell textAlign="right" width={'9%'} colSpan={0.5}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <LabeledInputNumber
                      inputNumberProps={{
                        onChange: (value) =>
                          onInputNumberChange(
                            value as number,
                            'exonerationOtherExpenses'
                          ),
                        value: form.exonerationOtherExpenses,
                        min: 0,
                        defaultValue: 0,
                        controls: false,
                        precision: 2,
                        readOnly: !createMode && !editMode,
                        prefix: '$',
                        onFocus: (e: any) => e.target.select(),
                      }}
                    />
                    <div>
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => {
                            setFieldName('exonerationOtherExpenses');
                            setOpen(true);
                          }}
                        >
                          <SettingsOutlined />
                        </IconButton>
                      </InputAdornment>
                    </div>
                  </div>
                </StyledTableCell>
                <StyledTableCell
                  textAlign="left"
                  fontWeight="bold"
                  width={'10%'}
                  colSpan={1}
                >
                  <div>Otros Gastos</div>
                </StyledTableCell>
                <StyledTableCell textAlign="right" width={'9%'} colSpan={0.5}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <LabeledInputNumber
                      inputNumberProps={{
                        onChange: (value) =>
                          onInputNumberChange(
                            value as number,
                            'otherOtherExpenses'
                          ),
                        value: form.otherOtherExpenses,
                        min: 0,
                        defaultValue: 0,
                        controls: false,
                        precision: 2,
                        readOnly: !createMode && !editMode,
                        prefix: '$',
                        onFocus: (e: any) => e.target.select(),
                      }}
                    />
                    <div>
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => {
                            setFieldName('otherOtherExpenses');
                            setOpen(true);
                          }}
                        >
                          <SettingsOutlined />
                        </IconButton>
                      </InputAdornment>
                    </div>
                  </div>
                </StyledTableCell>
              </TableRow>
            </TableBody>
          </Table>
          <Table
            style={{ marginLeft: '2%', flex: '1 0 45%', minWidth: '300px' }}
          >
            <TableBody>
              <TableRow>
                <StyledTableCell
                  textAlign="left"
                  fontWeight="bold"
                  width={'10%'}
                  colSpan={1}
                >
                  <div>Total Factura</div>
                </StyledTableCell>
                <StyledTableCell textAlign="right" width={'9%'} colSpan={0.5}>
                  <div>{setCurrencyNumber(form.totalInvoice)}</div>
                </StyledTableCell>
              </TableRow>
              <TableRow>
                <StyledTableCell
                  textAlign="left"
                  fontWeight="bold"
                  width={'10%'}
                  colSpan={1}
                >
                  <div>Valor Aplicación</div>
                </StyledTableCell>
                <StyledTableCell textAlign="right" width={'9%'} colSpan={0.5}>
                  <div>{setCurrencyNumber(form.applicationValue)}</div>
                </StyledTableCell>
              </TableRow>
              <TableRow>
                <StyledTableCell
                  textAlign="left"
                  fontWeight="bold"
                  width={'10%'}
                  colSpan={1}
                >
                  <div>Fodinfa</div>
                </StyledTableCell>
                <StyledTableCell textAlign="right" width={'9%'} colSpan={0.5}>
                  <div>{setCurrencyNumber(form.fodinfa)}</div>
                </StyledTableCell>
              </TableRow>
              <TableRow>
                <StyledTableCell
                  textAlign="left"
                  fontWeight="bold"
                  width={'10%'}
                  colSpan={1}
                >
                  <div>Advalorem</div>
                </StyledTableCell>
                <StyledTableCell textAlign="right" width={'9%'} colSpan={0.5}>
                  <div>{setCurrencyNumber(form.adValorem)}</div>
                </StyledTableCell>
              </TableRow>
              <TableRow>
                <StyledTableCell
                  textAlign="left"
                  fontWeight="bold"
                  width={'10%'}
                  colSpan={1}
                >
                  <div>Otros Gastos</div>
                </StyledTableCell>
                <StyledTableCell textAlign="right" width={'9%'} colSpan={0.5}>
                  <div>{setCurrencyNumber(form.otherExpenses)}</div>
                </StyledTableCell>
              </TableRow>
              <TableRow>
                <StyledTableCell
                  textAlign="left"
                  fontWeight="bold"
                  width={'10%'}
                  colSpan={1}
                >
                  <div>Total Importación</div>
                </StyledTableCell>
                <StyledTableCell textAlign="right" width={'9%'} colSpan={0.5}>
                  <div>{setCurrencyNumber(form.totalImport)}</div>
                </StyledTableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </>
    )
  );
}
