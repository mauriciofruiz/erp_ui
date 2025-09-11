import { Grid, Typography } from "@mui/material";

interface AuthLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title = ' ' }) => {
  return (
    <Grid
      container
      spacing={0}
      direction="column"
      alignItems="center"
      justifyContent="center"
      sx={{ minHeight: '100vh', backgroundColor: 'terceary.main', padding: 4 }}
    >
      <Grid
        item
        className='box-shadow'
        xs={3}
        sx={{
          backgroundColor: 'white',
          padding: 3,
          borderRadius: 2,
          width: { sm: 450 },
        }}
      >
        <Typography variant='h5' sx={{ mb: 1 }}>{ title }</Typography>
        { children }
      </Grid>
    </Grid>
  );
};
