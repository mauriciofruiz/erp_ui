import { Typography, Box } from '@mui/material';

export const FootBar = () => {
  return (
    <Box
      sx={{
        padding: '16px',
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '12px',
        textAlign: 'center',
      }}
    >
      <Typography 
        variant="body2" 
        sx={{
          color: 'rgba(255, 255, 255, 0.8)',
          fontSize: '0.8rem',
          fontWeight: 500,
          textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
        }}
      >
        Unnamed ERP
      </Typography>
      <Typography 
        variant="caption" 
        sx={{
          color: 'rgba(255, 255, 255, 0.6)',
          fontSize: '0.7rem',
          fontWeight: 400,
          textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
        }}
      >
        Sistema de Gestión Empresarial
      </Typography>
    </Box>
  );
};
