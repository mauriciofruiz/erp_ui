import { setCurrencyNumber } from '@/functions';
import { FormState, useStyles } from '@/hooks';
import { PaperComponent } from '@/modules/layout';
import { FacturaProveedorResumeInterface } from '@/types';
import { AdsClick } from '@mui/icons-material';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';

interface OptionsDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  facturasList: FacturaProveedorResumeInterface[];
  setFormState: React.Dispatch<React.SetStateAction<FormState>>;
  fieldName: string;
  idFacturasAsignadas: number[];
  setIdFacturasAsignadas: React.Dispatch<React.SetStateAction<number[]>>;
}

export const OptionsDialog = (props: OptionsDialogProps) => {
  const {
    open,
    setOpen,
    facturasList,
    setFormState,
    fieldName,
    idFacturasAsignadas,
    setIdFacturasAsignadas,
  } = props;

  const styles = useStyles();

  const onDialogClick = (factura: FacturaProveedorResumeInterface) => {
    const idFacturasAsignadasTemp: number[] = idFacturasAsignadas;

    const idFacturasAsignadasNew = idFacturasAsignadasTemp
      ? Array.from(new Set([...idFacturasAsignadasTemp, factura.id]))
      : [factura.id];

    setFormState((prev) => ({
      ...prev,
      [fieldName]: factura.subtotal,
    }));
    setIdFacturasAsignadas(idFacturasAsignadasNew);
    setOpen(false);
  };

  return (
    <Dialog
      open={open}
      onClose={() => setOpen(false)}
      PaperComponent={PaperComponent}
      aria-labelledby="draggable-dialog-title"
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          position: 'fixed',
          top: 0,
        },
      }}
    >
      <DialogTitle
        style={{
          cursor: 'move',
          textAlign: 'center',
        }}
        id="draggable-dialog-title"
        sx={{ mt: 2 }}
      >
        FACTURAS DISPONIBLES
      </DialogTitle>
      <DialogContent>
        <div className={styles.tableContainer}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>N° Factura</TableCell>
                  <TableCell>Proveedor</TableCell>
                  <TableCell>Memo</TableCell>
                  <TableCell>Subtotal</TableCell>
                  <TableCell>Asignar</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {facturasList.length > 0 &&
                  facturasList.map(
                    (
                      factura: FacturaProveedorResumeInterface,
                      index: number
                    ) => (
                      <TableRow key={index}>
                        <TableCell>{factura.invoicenumber}</TableCell>
                        <TableCell>{factura.providername}</TableCell>
                        <TableCell>{factura.memo}</TableCell>
                        <TableCell>
                          {setCurrencyNumber(factura.subtotal)}
                        </TableCell>
                        <TableCell>
                          <div className={styles.iconContainer}>
                            <IconButton onClick={() => onDialogClick(factura)}>
                              <AdsClick />
                            </IconButton>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  )}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      </DialogContent>
    </Dialog>
  );
};
