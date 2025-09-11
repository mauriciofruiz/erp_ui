import { FormState, useStyles } from '@/hooks';
import {
  BodegaGetInterface,
  DetalleListaEmpaqueTransferencia,
  ListaEmpaqueTransferencia,
} from '@/types';
import { AdsClick, ExpandMore } from '@mui/icons-material';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Collapse,
  Grid,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { formatDate } from '@/functions';

export type TransferenciaListasEmpaqueProps = {
  listasEmpaque: ListaEmpaqueTransferencia[];
  setWareHouseDestiny: React.Dispatch<
    React.SetStateAction<BodegaGetInterface[]>
  >;
  setFormState: React.Dispatch<React.SetStateAction<FormState>>;
  setSelectedContenedor: React.Dispatch<
    React.SetStateAction<DetalleListaEmpaqueTransferencia | undefined>
  >;
};

export const TransferenciaListasEmpaque = ({
  listasEmpaque,
  setWareHouseDestiny,
  setFormState,
  setSelectedContenedor,
}: TransferenciaListasEmpaqueProps) => {
  const styles = useStyles();

  const onSelectContenedor = (contenedor: DetalleListaEmpaqueTransferencia) => {
    setSelectedContenedor(contenedor);
    setFormState((prev) => ({
      ...prev,
      observation: contenedor.observation,
      warehouseDestination: null,
      packingListId: contenedor.packingListId,
      containerNumber: contenedor.containerNumber,
    }));
    setWareHouseDestiny(contenedor.warehouseList);
  };

  function Row(props: { row: ListaEmpaqueTransferencia }) {
    const { row } = props;
    const [open, setOpen] = useState(false);

    return (
      <>
        <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
          <TableCell>
            <IconButton
              aria-label="expand row"
              size="small"
              onClick={() => setOpen(!open)}
            >
              {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
            </IconButton>
          </TableCell>
          <TableCell component="th" scope="row">
            {row.packingListId}
          </TableCell>
          <TableCell>{row.openingImportCode}</TableCell>
          <TableCell>{formatDate(row.arrivalDate)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
            <Collapse in={open} timeout="auto" unmountOnExit>
              <Box sx={{ margin: 1 }}>
                <Typography variant="h6" gutterBottom component="div">
                  Contenedores
                </Typography>
                <Table size="small" aria-label="purchases">
                  <TableHead>
                    <TableRow>
                      <TableCell>N° Contenedor</TableCell>
                      <TableCell>Nombre Contenedor</TableCell>
                      <TableCell>Sucursal</TableCell>
                      <TableCell>Acción</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {row.details.map((detailRow) => (
                      <TableRow key={detailRow.containerNumber}>
                        <TableCell component="th" scope="row">
                          {detailRow.containerNumber}
                        </TableCell>
                        <TableCell>{detailRow.containerName}</TableCell>
                        <TableCell>{detailRow.branchName}</TableCell>
                        <TableCell>
                          <IconButton
                            onClick={() => onSelectContenedor(detailRow)}
                          >
                            <AdsClick />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            </Collapse>
          </TableCell>
        </TableRow>
      </>
    );
  }

  return (
    <Grid container spacing={2} alignItems="center" sx={{ mt: 1, mb: 2 }}>
      <Grid item xs={12}>
        <Accordion>
          <AccordionSummary
            expandIcon={<ExpandMore />}
            aria-controls="panel1a-content"
            id="panel1a-header"
          >
            <div
              style={{
                display: 'width',
                justifyContent: 'space-between',
                width: '100%',
              }}
            >
              <Typography sx={{ fontWeight: 'bold' }}>
                Listas De Empaque Disponibles
              </Typography>
            </div>
          </AccordionSummary>
          <AccordionDetails>
            {listasEmpaque.length === 0 ? (
              <Typography>No hay listas de empaque disponibles</Typography>
            ) : (
              <div className={styles.tableContainer}>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell />
                        <TableCell>N° Lista Empaque</TableCell>
                        <TableCell>Importación</TableCell>
                        <TableCell>Fecha Llegada</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {listasEmpaque.map((row) => (
                        <Row key={row.packingListId} row={row} />
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </div>
            )}
          </AccordionDetails>
        </Accordion>
      </Grid>
    </Grid>
  );
};
