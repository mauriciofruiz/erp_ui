import React from 'react';
import { GridRowsProp } from '@mui/x-data-grid';
import { setDecimalPlacesString } from '@/functions';

declare module '@mui/x-data-grid' {
  interface FooterPropsOverrides {
    rows: GridRowsProp;
  }
}

interface CustomFooterStatusComponentProps {
  rows: GridRowsProp;
}

export const CustomFooterStatusComponent: React.FC<CustomFooterStatusComponentProps> = ({ rows }) => {
  const totalCantidad = React.useMemo(() => 
    rows.reduce(
      (accumulator, row) => accumulator + parseFloat(row.quantity),
      0
    ), [rows]
  );

  const totalPeso = React.useMemo(() => 
    rows.reduce(
      (accumulator, row) => accumulator + parseFloat(row.weight),
      0
    ), [rows]
  );

  const totalCantidadAprobada = React.useMemo(() => 
    rows
      .filter((row) => row.state !== false)
      .reduce(
        (accumulator, row) => accumulator + parseFloat(row.quantityApproved),
        0
      ), [rows]
  );

  if (rows.length === 0) return null;

  return (
    <table>
      <tfoot>
        <tr>
          <td
            style={{
              fontWeight: 'bold',
              fontSize: '12px',
              textAlign: 'center',
            }}
            width={'400px'}
          >
            RESUMEN{' '}
          </td>
          <td style={{ textAlign: 'left', fontSize: '12px' }}>
            Total Cantidad Solicitada:{' '}
            {setDecimalPlacesString(totalCantidad, 0)}
          </td>
          <td style={{ textAlign: 'left', fontSize: '12px' }}>
            Total Peso Aprobado: {setDecimalPlacesString(totalPeso, 4)}
          </td>
          <td style={{ textAlign: 'left', fontSize: '12px' }}>
            Total Cantidad Aprobada:{' '}
            {setDecimalPlacesString(totalCantidadAprobada, 0)}
          </td>
        </tr>
      </tfoot>
    </table>
  );
};
