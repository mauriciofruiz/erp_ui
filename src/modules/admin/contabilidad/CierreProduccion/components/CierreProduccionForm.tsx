import {
  FormState,
  StyledDatePicker,
  useAllowProduccion,
  useStyles,
} from '@/hooks';
import { Button, Grid } from '@mui/material';
import { TipoCostoEnum } from '@/enums';
import { Construction, Engineering, WaterDrop } from '@mui/icons-material';
import { parseISO } from 'date-fns';
import { useMemo } from 'react';

type CierreProduccionFormProps = {
  formState: FormState;
  onGenericChange: (value: any, field: string) => void;
};

export const CierreProduccionForm: React.FC<CierreProduccionFormProps> = ({
  formState,
  onGenericChange,
}) => {
  const styles = useStyles();

  const { produccionPeriodo } = useAllowProduccion();

  const fechaCierre: string = useMemo(() => {
    if (produccionPeriodo?.closingPeriodDate) {
      const closingDate = new Date(produccionPeriodo.closingPeriodDate);
      return closingDate.toISOString();
    }
    return '';
  }, [produccionPeriodo]);

  return (
    <>
      <Grid item xs={4}>
        <Button
          disabled={formState.costTypeId === TipoCostoEnum.MATERIA_PRIMA}
          onClick={() =>
            onGenericChange(TipoCostoEnum.MATERIA_PRIMA, 'costTypeId')
          }
          style={{ width: '100%', height: '25vh', flexDirection: 'column' }}
        >
          <Construction style={{ fontSize: '4rem' }} />
          <span>{'Cierre De Materia Prima'}</span>
        </Button>
      </Grid>
      <Grid item xs={4}>
        <Button
          disabled={formState.costTypeId === TipoCostoEnum.MANO_OBRA}
          onClick={() => onGenericChange(TipoCostoEnum.MANO_OBRA, 'costTypeId')}
          style={{ width: '100%', height: '25vh', flexDirection: 'column' }}
        >
          <Engineering style={{ fontSize: '4rem' }} />
          <span>{'Cierre De Mano De Obra'}</span>
        </Button>
      </Grid>
      <Grid item xs={4}>
        <Button
          disabled={formState.costTypeId === TipoCostoEnum.COSTOS_INDIRECTOS}
          onClick={() =>
            onGenericChange(TipoCostoEnum.COSTOS_INDIRECTOS, 'costTypeId')
          }
          style={{ width: '100%', height: '25vh', flexDirection: 'column' }}
        >
          <WaterDrop style={{ fontSize: '4rem' }} />
          <span>{'Cierre De Costos Indirectos'}</span>
        </Button>
      </Grid>
      <Grid item xs={4}>
        <StyledDatePicker
          label="Fecha Inicio"
          views={['year', 'month', 'day']}
          format="dd/MM/yyyy"
          minDate={new Date(fechaCierre)}
          maxDate={new Date()}
          value={
            typeof formState.startDate === 'string'
              ? parseISO(formState.startDate)
              : formState.startDate
          }
          onChange={(date) =>
            onGenericChange((date as Date).toISOString(), 'startDate')
          }
          slotProps={{
            textField: {
              className: styles.genericFieldStyle,
              sx: {
                minWidth: '100%',
              },
              InputProps: {
                className: styles.textWhiteStyle,
              },
              InputLabelProps: {
                className: styles.textGreenStyle,
                shrink: true,
              },
            },
          }}
        />
      </Grid>
      <Grid item xs={4}>
        <StyledDatePicker
          label="Fecha Fin"
          views={['year', 'month', 'day']}
          format="dd/MM/yyyy"
          maxDate={new Date()}
          value={
            typeof formState.endDate === 'string'
              ? parseISO(formState.endDate)
              : formState.endDate
          }
          onChange={(date) =>
            onGenericChange((date as Date).toISOString(), 'endDate')
          }
          slotProps={{
            textField: {
              className: styles.genericFieldStyle,
              sx: {
                minWidth: '100%',
              },
              InputProps: {
                className: styles.textWhiteStyle,
              },
              InputLabelProps: {
                className: styles.textGreenStyle,
                shrink: true,
              },
            },
          }}
        />
      </Grid>
    </>
  );
};
