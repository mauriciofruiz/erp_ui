import { setCurrencyNumber } from "@/functions";
import { TableCell, TableFooter, TableRow } from "@mui/material";
import { GridSlotsComponentsProps } from "@mui/x-data-grid";

export function RetencionProveedorFooter(
    props: NonNullable<GridSlotsComponentsProps['footer']>
) {

    const totalCantidad = (props.rows || []).reduce(
        (accumulator, row) => accumulator + parseFloat(row.value),
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
                            width={'86%'}
                        >
                        </TableCell>
                        <TableCell style={{ textAlign: 'left', fontSize: '12px' }}>
                            TOTAL: {setCurrencyNumber(totalCantidad)}
                        </TableCell>
                    </TableRow>
                </TableFooter>
            </table>
        </>
    ) : null;
}
