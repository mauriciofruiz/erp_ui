import { TableCell, TableFooter, TableRow } from '@mui/material';
import { GridSlotsComponentsProps } from '@mui/x-data-grid';

export function CustomFooterStatusComponent(
  props: NonNullable<GridSlotsComponentsProps['footer']>
) {
  const totalCantidad = (props.rows || []).reduce(
    (accumulator, row) => accumulator + parseFloat(row.quantity),
    0
  );

  const totalPeso = (props.rows || []).reduce((accumulator, row) => {
    // Si la fila no es un servicio, agregar su cantidad al acumulador
    if (!row.isService) {
      return accumulator + parseFloat(row.weight);
    }
    // Si la fila es un servicio, no agregar su cantidad al acumulador
    return accumulator;
  }, 0);
  const totalCantidadAprobada = (props.rows || []).reduce(
    (accumulator, row) => accumulator + parseFloat(row.quantityApproved),
    0
  );

  return props.rows && props.rows.length > 0 ? (
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
              width={'30%'}
            >
              RESUMEN{' '}
            </TableCell>
            <TableCell style={{ textAlign: 'left', fontSize: '12px' }}>
              Total Cantidad Solicitada: {totalCantidad}
            </TableCell>
            <TableCell style={{ textAlign: 'left', fontSize: '12px' }}>
              Total Peso Aprobado: {totalPeso}
            </TableCell>
            <TableCell style={{ textAlign: 'left', fontSize: '12px' }}>
              Total Cantidad Aprobada:{' '}
              {isNaN(totalCantidadAprobada) ? 0 : totalCantidadAprobada}
            </TableCell>
          </TableRow>
        </TableFooter>
      </table>
    </>
  ) : null;
}

export function totalCantidad(
  props: NonNullable<GridSlotsComponentsProps['footer']>
) {
  const totalCantidad = (props.rows || []).reduce(
    (accumulator, row) => accumulator + parseFloat(row.quantity),
    0
  );
  return totalCantidad;
}
