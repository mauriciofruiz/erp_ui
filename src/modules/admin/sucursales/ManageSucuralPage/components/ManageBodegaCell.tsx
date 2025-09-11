import { TipoBodegaEnum } from "@/enums";
import { BodegaGetInterface } from "@/types";
import { FormControl, MenuItem, Select, SelectChangeEvent } from "@mui/material";
import { GridRenderEditCellParams, GridRowsProp, useGridApiContext } from "@mui/x-data-grid";
import { useCallback } from "react";

interface BodegaCellProps {
    params: GridRenderEditCellParams;
    onAutocompleteChange: (
        event: SelectChangeEvent<any>,
        newValue: BodegaGetInterface,
        params: GridRenderEditCellParams
    ) => void;
    rows: GridRowsProp;
}

export function ManageBodegaCell(props: BodegaCellProps) {
    const { params, onAutocompleteChange } = props;

    const tipoBodegas = Object.keys(TipoBodegaEnum)
        .filter((key): key is keyof typeof TipoBodegaEnum =>
            isNaN(Number(key))
        )
        .map((key) => ({ label: key.replace(/_/g, ' '), value: TipoBodegaEnum[key] }));

    const apiRef = useGridApiContext();

    const handleChange = useCallback(async (event: SelectChangeEvent<any>, newValue: any) => {
        if (newValue === null) return;
        event.stopPropagation();
        apiRef.current.setEditCellValue({
            id: params.id,
            field: params.field,
            value: newValue.props.value,
        });
        onAutocompleteChange(event, newValue, params);
    },
        [params.id, params.field]
    );


    return (
        <FormControl fullWidth>
            <Select
                labelId="state-label"
                id="state-select"
                onChange={handleChange}
                fullWidth
            >
                {tipoBodegas.map((bodega) => (
                    <MenuItem
                        key={bodega.value}
                        value={parseInt(bodega.value?.toString() || '')}
                    >
                        {bodega.label}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
}