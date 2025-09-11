import { CircularProgress, Grid } from '@mui/material';

export const CheckingAuth = () => {
  return (
    // <div id="loading">
    //   <div className="loader loader-light loader-large" />
    // </div>
    <Grid
      container
      spacing={0}
      direction="column"
      alignItems="center"
      justifyContent="center"
      sx={{ minHeight: '100vh', backgroundColor: 'primary.main', padding: 4 }}
    >
      <Grid container direction="row" justifyContent="center">
        <CircularProgress color="warning" />
      </Grid>
    </Grid>
  );
};
