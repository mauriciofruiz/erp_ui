import { TableCell, TableFooter, TableRow } from "@mui/material";
import { GridRowsProp } from "@mui/x-data-grid";

interface FooterProps {
    rowsUnidadesProd: GridRowsProp;
}

export function CustomFooterStatusComponent(
    props: FooterProps
) {
    
    const totalCantidad = (props.rowsUnidadesProd || []).reduce(
        (accumulator, row) =>  accumulator + parseFloat(row.quantity),0
    );
    
    const totaCostoU = (props.rowsUnidadesProd || []).reduce(
        (accumulator, row) => accumulator + parseFloat(row.unitPrice),0
    );

    const totalCost = (props.rowsUnidadesProd || []).reduce(
        (accumulator, row) => accumulator + parseFloat(row.totalCost),0
    );

    return props.rowsUnidadesProd && props.rowsUnidadesProd.length > 0 ? (
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
                            Total Cantidad: {totalCantidad}
                        </TableCell>
                        <TableCell style={{ textAlign: 'left', fontSize: '12px' }}>
                            Total Costo Unitario: {totaCostoU.toFixed(2)}
                        </TableCell>
                        <TableCell style={{ textAlign: 'left', fontSize: '12px' }}>
                            Total Costo: {totalCost.toFixed(2)}
                        </TableCell>
                    </TableRow>
                </TableFooter>
            </table>
        </>

    ) : null;
}
