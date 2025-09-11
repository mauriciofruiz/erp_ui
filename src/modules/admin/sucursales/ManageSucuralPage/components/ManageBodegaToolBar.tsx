import { FormState } from "@/hooks";
import { Add } from "@mui/icons-material";
import { Button } from "@mui/material";
import { GridRowModes, GridRowModesModel, GridRowsProp, GridToolbarContainer } from "@mui/x-data-grid";
import { randomId } from "@mui/x-data-grid-generator";

interface BodegaToolbarProps {
    setRows: (newRows: (oldRows: GridRowsProp) => GridRowsProp) => void;
    setRowModesModel: (
        newModel: (oldModel: GridRowModesModel) => GridRowModesModel
    ) => void;
    createMode: boolean;
    editMode: boolean;
    addButtonRef: React.RefObject<HTMLButtonElement>;
    // rows: GridRowsProp;
    formState: FormState;
}

export function ManageBodegaToolBar(props: BodegaToolbarProps) {
    const {
        setRows,
        setRowModesModel,
        createMode,
        editMode,
        addButtonRef,
        // rows,
        formState
    } = props;

    const handleClick = () => {
        const id = randomId();
        setRows((oldRows) => [
            ...oldRows,
            {
                id,
                branchId: formState.branchId &&  formState.branchId !== null ? formState.branchId : null,
                warehouseId: null,
                warehouseCode: '',
                warehouseName: '',               
                warehouseSequence: 0,
                warehouseTypeId: '',
            },
        ]);

        setRowModesModel((oldModel) => ({
            ...oldModel,
            [id]: { mode: GridRowModes.Edit, fieldToFocus: 'warehouseTypeId' },
        }));
    };


    return (
        <GridToolbarContainer
            style={{
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
            }}
        >
            <Button
                id="addButonProduct"
                ref={addButtonRef}
                color="primary"
                startIcon={<Add />}
                onClick={handleClick}
                disabled={!createMode && !editMode}
                sx={{ mb: 2, mt: 1, marginLeft: '10px', mr: 1 }}
            >
                Agregar Bodega
            </Button>
        </GridToolbarContainer>
    );
}