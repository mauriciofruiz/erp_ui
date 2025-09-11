import React, { useEffect, useState } from 'react';
import { CardLayout } from '../layout';
import { StyledDatePicker, useAsientoAsync, useStyles } from '@/hooks';
import { useParams } from 'react-router-dom';
import { EntryDetailsType, EntryDtoInterface } from '@/types';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  Chip,
  Divider,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { parseISO } from 'date-fns';
import { Download, ExpandMore, OpenInBrowser } from '@mui/icons-material';
import { downloadPdf, setCurrencyNumber } from '@/functions';

type AsientoViewPageProps = {};

export const AsientoViewPage: React.FC<AsientoViewPageProps> = ({}) => {
  const styles = useStyles();

  const { entryId } = useParams<{ entryId: string }>();

  const [entryDto, setEntryDto] = useState<EntryDtoInterface>();

  const { fetchAsietoView, fetchDownloadPdf, fetchDownloadPdfMultidimension } =
    useAsientoAsync();

  const [isDetailed, setIsDetailed] = useState(false);

  const [entryDetails, setEntryDetails] = useState<EntryDetailsType[]>([]);

  const [groupedEntryDetails, setGroupedEntryDetails] = useState<
    EntryDetailsType[]
  >([]);

  const groupedEntryDetailsByAccount = (details: EntryDetailsType[]) => {
    const grouped: { [key: string]: EntryDetailsType } = {};

    details.forEach((entry: EntryDetailsType) => {
      const { accountNumber, branchName, debit, credit, ...rest } = entry;
      const key = `${accountNumber}_${branchName}`;

      if (!grouped[key]) {
        grouped[key] = {
          ...rest,
          accountNumber,
          branchName,
          debit: 0,
          credit: 0,
        };
      }

      grouped[key].debit += debit;
      grouped[key].credit += credit;
    });
    setGroupedEntryDetails(Object.values(grouped));
  };

  useEffect(() => {
    const getEntryAsync = async () => {
      const response = await fetchAsietoView(Number(entryId));

      if (response) {
        const asiento = response as EntryDtoInterface;
        setEntryDto(asiento);
        setEntryDetails(asiento.details);
        groupedEntryDetailsByAccount(asiento.details);
      }
    };
    getEntryAsync();
  }, [entryId]);

  useEffect(() => {
    if (entryDto && isDetailed) {
      setEntryDto({
        ...entryDto,
        details: entryDetails,
      });
    }
    if (entryDto && !isDetailed) {
      setEntryDto({
        ...entryDto,
        details: groupedEntryDetails,
      });
    }
  }, [isDetailed, entryDetails, groupedEntryDetails]);

  const handleDownloadClick = (id: number) => () => {
    if (isDetailed)
      fetchDownloadPdfMultidimension(id).then((response) => {
        downloadPdf(response, `asiento_contable_${id}.pdf`);
      });
    else
      fetchDownloadPdf(id).then((response) => {
        downloadPdf(response, `asiento_contable_${id}.pdf`);
      });
  };

  return (
    <>
      <CardLayout
        title={'ASIENTO CONTABLE N° ' + entryId}
        createMode={false}
        cancelFunction={() => {}}
      >
        <Grid item xs={12}>
          <Accordion sx={{ mb: 2 }}>
            <AccordionSummary
              expandIcon={<ExpandMore />}
              aria-controls="panel1a-content"
              id="panel1a-header"
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  width: '100%',
                }}
              >
                <Typography sx={{ fontWeight: 'bold' }}>
                  Información General
                </Typography>
              </div>
            </AccordionSummary>
            <Divider />
            <AccordionDetails>
              <Grid container spacing={2} alignItems="center" sx={{ mt: 1 }}>
                <Grid item xs={4}>
                  <StyledDatePicker
                    label="Fecha Contable"
                    disableOpenPicker
                    readOnly
                    format="dd/MM/yyyy"
                    value={
                      entryDto?.entry.accountingDate
                        ? parseISO(entryDto?.entry.accountingDate.toString())
                        : null
                    }
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
                    label="Tipo Asiento"
                    value={entryDto?.entry.entryType.toUpperCase()}
                    InputProps={{
                      readOnly: true,
                    }}
                    InputLabelProps={{
                      shrink: true,
                    }}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    label="Usuario Creación"
                    value={entryDto?.entry.userCreateName}
                    InputProps={{
                      readOnly: true,
                    }}
                    InputLabelProps={{
                      shrink: true,
                    }}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={4}>
                  <StyledDatePicker
                    label="Fecha Registro"
                    disableOpenPicker
                    readOnly
                    format="dd/MM/yyyy"
                    value={
                      entryDto?.entry.entryDate
                        ? parseISO(entryDto?.entry.entryDate.toString())
                        : null
                    }
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
                    label="Movimiento"
                    value={entryDto?.entry.movementType}
                    InputProps={{
                      readOnly: true,
                    }}
                    InputLabelProps={{
                      shrink: true,
                    }}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    label="Usuario Anulación"
                    value={entryDto?.entry.userCancelName}
                    InputProps={{
                      readOnly: true,
                    }}
                    InputLabelProps={{
                      shrink:
                        entryDto?.entry.userCancelName !== '' ? true : false,
                    }}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={4}>
                  <StyledDatePicker
                    label="Fecha Modificación"
                    disableOpenPicker
                    readOnly
                    format="dd/MM/yyyy"
                    value={
                      entryDto?.entry.modificationDate
                        ? parseISO(entryDto?.entry.modificationDate.toString())
                        : null
                    }
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
                          shrink:
                            entryDto?.entry.modificationDate !== null
                              ? true
                              : false,
                        },
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    label="Estado Asiento"
                    value={entryDto?.entry.entryState}
                    InputProps={{
                      readOnly: true,
                    }}
                    InputLabelProps={{
                      shrink: true,
                    }}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    label="Sucursal"
                    value={entryDto?.entry.branchName}
                    InputProps={{
                      readOnly: true,
                    }}
                    InputLabelProps={{
                      shrink: true,
                    }}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    label="Referencia"
                    value={entryDto?.entry.reference}
                    InputProps={{
                      readOnly: true,
                    }}
                    InputLabelProps={{
                      shrink: entryDto?.entry.reference !== '' ? true : false,
                    }}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    label="Observación"
                    value={entryDto?.entry.observation}
                    InputProps={{
                      readOnly: true,
                    }}
                    InputLabelProps={{
                      shrink: entryDto?.entry.observation !== '' ? true : false,
                    }}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={4}>
                  <Chip
                    label={
                      entryDto?.entry.anulated
                        ? 'Asiento Anulado'
                        : 'Asiento Activo'
                    }
                    color="primary"
                    style={{ width: '100%' }}
                  />
                </Grid>
                {entryDto?.entry.modificationReason !== '' &&
                entryDto?.entry.modificationReason !== null ? (
                  <Grid item xs={6}>
                    <TextField
                      label="Motivo Modificación"
                      value={entryDto?.entry.modificationReason}
                      InputProps={{
                        readOnly: true,
                      }}
                      InputLabelProps={{
                        shrink: true,
                      }}
                      fullWidth
                    />
                  </Grid>
                ) : null}
                {entryDto?.entry.cancellationReason !== '' &&
                entryDto?.entry.cancellationReason !== null ? (
                  <Grid item xs={6}>
                    <TextField
                      label="Motivo Anulación"
                      value={entryDto?.entry.cancellationReason}
                      InputProps={{
                        readOnly: true,
                      }}
                      InputLabelProps={{
                        shrink: true,
                      }}
                      fullWidth
                    />
                  </Grid>
                ) : null}
              </Grid>
            </AccordionDetails>
          </Accordion>
        </Grid>
        <Divider sx={{ mb: 3 }} />
        <TableContainer component={Paper}>
          {isDetailed ? (
            <Table
              size="small"
              sx={{ minWidth: 1800 }}
              aria-label="simple table"
            >
              <TableHead>
                <TableRow>
                  <TableCell>N° Cuenta</TableCell>
                  <TableCell>Nombre Cuenta</TableCell>
                  <TableCell>Sucursal</TableCell>
                  <TableCell>Debe</TableCell>
                  <TableCell>Haber</TableCell>
                  <TableCell>Inventario</TableCell>
                  <TableCell>Importación</TableCell>
                  <TableCell>Empleado</TableCell>
                  <TableCell>Cliente</TableCell>
                  <TableCell>Proveedor</TableCell>
                  <TableCell>Proyecto</TableCell>
                  <TableCell>Caja</TableCell>
                  <TableCell>Tarifa Impuesto</TableCell>
                  <TableCell>Retención</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {entryDto?.details.map((entryDetail, index) => (
                  <TableRow key={index}>
                    <TableCell>{entryDetail.accountNumber}</TableCell>
                    <TableCell>{entryDetail.account}</TableCell>
                    <TableCell>{entryDetail.branchName}</TableCell>
                    <TableCell style={{ textAlign: 'right' }}>
                      {entryDetail.debit.toFixed(2)}
                    </TableCell>
                    <TableCell style={{ textAlign: 'right' }}>
                      {entryDetail.credit.toFixed(2)}
                    </TableCell>
                    <TableCell>{entryDetail.inventory}</TableCell>
                    <TableCell>{entryDetail.importation}</TableCell>
                    <TableCell>{entryDetail.employee}</TableCell>
                    <TableCell>{entryDetail.client}</TableCell>
                    <TableCell>{entryDetail.provider}</TableCell>
                    <TableCell>{entryDetail.project}</TableCell>
                    <TableCell>{entryDetail.cash}</TableCell>
                    <TableCell>{entryDetail.tax}</TableCell>
                    <TableCell>{entryDetail.retention}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell
                    style={{
                      fontWeight: 'bold',
                      textAlign: 'right',
                      fontSize: 16,
                      color: '#851313',
                    }}
                    colSpan={3}
                  >
                    TOTAL{' '}
                  </TableCell>
                  <TableCell
                    style={{
                      fontWeight: 'bold',
                      textAlign: 'right',
                      fontSize: 16,
                      color: '#851313',
                    }}
                  >
                    {entryDto?.entry.totalDebit.toFixed(2)}
                  </TableCell>
                  <TableCell
                    style={{
                      fontWeight: 'bold',
                      textAlign: 'right',
                      fontSize: 16,
                      color: '#851313',
                    }}
                  >
                    {entryDto?.entry.totalAssets.toFixed(2)}
                  </TableCell>
                  <TableCell colSpan={7}>{''}</TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          ) : (
            <Table size="small" aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell>N° Cuenta</TableCell>
                  <TableCell>Nombre Cuenta</TableCell>
                  <TableCell>Sucursal</TableCell>
                  <TableCell>Debe</TableCell>
                  <TableCell>Haber</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {entryDto?.details.map((entryDetail, index) => (
                  <TableRow key={index}>
                    <TableCell>{entryDetail.accountNumber}</TableCell>
                    <TableCell>{entryDetail.account}</TableCell>
                    <TableCell>{entryDetail.branchName}</TableCell>
                    <TableCell style={{ textAlign: 'right' }}>
                      {entryDetail.debit.toFixed(2)}
                    </TableCell>
                    <TableCell style={{ textAlign: 'right' }}>
                      <div style={{ marginRight: '10px' }}>
                        {entryDetail.credit.toFixed(2)}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell
                    style={{
                      fontWeight: 'bold',
                      textAlign: 'right',
                      fontSize: 16,
                      color: '#851313',
                    }}
                    colSpan={3}
                  >
                    TOTAL{' '}
                  </TableCell>
                  <TableCell
                    style={{
                      fontWeight: 'bold',
                      textAlign: 'right',
                      fontSize: 16,
                      color: '#851313',
                    }}
                  >
                    {setCurrencyNumber(entryDto?.entry.totalDebit ?? 0)}
                  </TableCell>
                  <TableCell
                    style={{
                      fontWeight: 'bold',
                      textAlign: 'right',
                      fontSize: 16,
                      color: '#851313',
                    }}
                  >
                    <div style={{ marginRight: '10px' }}>
                      {setCurrencyNumber(entryDto?.entry.totalAssets ?? 0)}
                    </div>
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          )}
        </TableContainer>
        <Grid
          container
          direction="row"
          justifyContent="center"
          alignItems="center"
        >
          <Grid item>
            <Button
              startIcon={<OpenInBrowser />}
              sx={{ margin: 2 }}
              onClick={() => setIsDetailed((prev) => !prev)}
              style={{ width: '200px' }}
            >
              {isDetailed ? 'Asiento Agrupado' : 'Asiento Detallado'}
            </Button>
          </Grid>
          <Grid item>
            <Button
              startIcon={<Download />}
              sx={{ margin: 2 }}
              onClick={handleDownloadClick(entryDto?.entry.entryId as number)}
              style={{ width: '200px' }}
            >
              {'Descargar PDF'}
            </Button>
          </Grid>
        </Grid>
      </CardLayout>
    </>
  );
};
