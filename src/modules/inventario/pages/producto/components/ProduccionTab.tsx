import { TabPanel } from '@/functions';
import { FormState } from '@/hooks';
import { FormControlLabel, Grid, Switch } from '@mui/material';

type ProduccionTabProps = {
  formState: FormState;
  tabIndex: number;
  value: number;
  createMode: boolean;
  editMode: boolean;
  onBooleanChange: (
    event: React.ChangeEvent<HTMLInputElement>,
    name: string,
    index?: number,
    listName?: string
  ) => void;
};
const ProduccionTab: React.FC<ProduccionTabProps> = ({
  formState,
  tabIndex,
  createMode,
  value,
  editMode,
  onBooleanChange,
}) => {
  return (
    <TabPanel value={tabIndex} index={value}>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={6} container justifyContent="center" alignItems="center">
          <FormControlLabel
            control={
              <Switch
                disabled={!createMode && !editMode}
                checked={formState.productRawMaterial}
                onChange={(event) =>
                  onBooleanChange(event, 'productRawMaterial')
                }
              />
            }
            label={
              formState.productRawMaterial
                ? 'Es Materia Prima'
                : 'No Es Materia Prima'
            }
          />
        </Grid>
        <Grid item xs={6} container justifyContent="center" alignItems="center">
          <FormControlLabel
            control={
              <Switch
                disabled={!createMode && !editMode}
                checked={formState.isProduction}
                onChange={(event) => onBooleanChange(event, 'isProduction')}
              />
            }
            label={
              formState.isProduction
                ? 'Es Producto De Producción'
                : 'No Es Producto De Producción'
            }
          />
        </Grid>
      </Grid>
    </TabPanel>
  );
};

export default ProduccionTab;
