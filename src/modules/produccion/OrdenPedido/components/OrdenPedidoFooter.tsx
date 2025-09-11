import { setDecimalPlacesString } from '@/functions';
import { TableCell, TableFooter, TableRow } from '@mui/material';
import { GridRowsProp } from '@mui/x-data-grid';

interface FooterProps {
  rows: GridRowsProp;
  isApprovable: boolean;
}

export function OrdenPedidoFooter(props: FooterProps) {
  const { rows, isApprovable } = props;
  const totalCantidad = (rows || []).reduce(
    (accumulator, row) => accumulator + parseFloat(row.quantity),
    0
  );

  return rows && rows.length > 0 ? (
    <>
      <table>
        <TableFooter>
          <TableRow>
            <TableCell
              style={{
                fontWeight: 'bold',
                fontSize: '12px',
                textAlign: 'center',
              }}
              width={'60%'}
            >
              RESUMEN{' '}
            </TableCell>
            <TableCell style={{ textAlign: 'left', fontSize: '12px' }}>
              {isApprovable
                ? `Total Cantidad Aprobada: ${setDecimalPlacesString(
                    totalCantidad,
                    2
                  )}`
                : `Total Cantidad Solicitada: ${setDecimalPlacesString(
                    totalCantidad,
                    2
                  )}`}
            </TableCell>
          </TableRow>
        </TableFooter>
      </table>
    </>
  ) : null;
}
