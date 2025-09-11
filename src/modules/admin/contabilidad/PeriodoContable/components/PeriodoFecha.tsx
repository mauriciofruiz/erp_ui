import { FormState, StyledDatePicker, useStyles } from "@/hooks";
import { PaperComponent } from "@/modules/layout";
import { Send } from "@mui/icons-material";
import { Button, Dialog, DialogContent, DialogTitle, Grid } from "@mui/material";

export type PeriodoFechaProps = {
	open: boolean;
	setOpen: React.Dispatch<React.SetStateAction<boolean>>;
	formState: FormState
	onDateChange: (value: Date, name: string) => void
    onSubmit: (event: React.FormEvent<HTMLFormElement>) => Promise<void>
}

export const PeriodoFecha: React.FC<PeriodoFechaProps> = ({
    open,
    setOpen,
    formState,
    onDateChange,
    onSubmit
}) => {

    const styles = useStyles();

    return (
        <Dialog
			open={open}
			onClose={() => setOpen(false)}
			PaperComponent={PaperComponent}
			aria-labelledby="draggable-dialog-title"
			maxWidth="xs"
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
				Cambiar Fecha
			</DialogTitle>
			<DialogContent>
				<form onSubmit={onSubmit}>
					<Grid container spacing={2} alignItems="center" sx={{ mt: 1 }}>
						<Grid item xs={12}>
							<StyledDatePicker
								label="Fecha Inicio"
								views={['year', 'month', 'day']}
								format="dd/MM/yyyy"
								maxDate={new Date()}
								value={formState.newDatePeriod !== null ? formState.newDatePeriod : null}
								onChange={(value) =>
									onDateChange(value as Date, 'newDatePeriod')
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
											shrink: formState.newDatePeriod ? true : false,
										},
									},
								}}
							/>
						</Grid>
					</Grid>
					<Grid
						container
						direction="row"
						justifyContent="center"
						alignItems="center"
						sx={{ mt: 2 }}
					>
						<Button startIcon={<Send />} sx={{ margin: 2 }} type="submit">
							{'Guardar'}
						</Button>
					</Grid>
				</form>
			</DialogContent>
		</Dialog>
    )
}
