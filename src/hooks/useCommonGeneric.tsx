import { AddCircle, Search } from '@mui/icons-material';
import { Box, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
interface HeaderComponentsProps {
  navigatePath: string;
  firstButtonName: string;
  setOpen: (open: boolean) => void;
}
export const useCommonGeneric = () => {
  const navigate = useNavigate();

  const headerComponents = ({
    navigatePath,
    firstButtonName,
    setOpen,
  }: HeaderComponentsProps): React.ReactNode => (
    <Box sx={{ mt: 0.5 }}>
      <Button
        variant="contained"
        color="primary"
        sx={{ mr: 1, width: '200px' }}
        startIcon={<AddCircle />}
        onClick={() => {
          navigate(navigatePath);
        }}
      >
        {firstButtonName}
      </Button>
      <Button
        variant="contained"
        color="secondary"
        sx={{ width: '200px' }}
        startIcon={<Search />}
        onClick={() => setOpen(true)}
      >
        Búsqueda Avanzada
      </Button>
    </Box>
  );

  return { headerComponents };
};
