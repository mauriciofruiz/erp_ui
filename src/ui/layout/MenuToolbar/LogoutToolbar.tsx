'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Tooltip,
  IconButton,
} from '@mui/material';
import { useLoginAsync } from '@/hooks';
import { Info, Logout } from '@mui/icons-material';

type LogoutToolbarProps = {
  // types...
};

interface DialogConfirmationProps {
  open: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onLogout: () => Promise<void>;
}

const LogoutToolbar: React.FC<LogoutToolbarProps> = ({}) => {
  const { fetchLoginOut } = useLoginAsync();

  const [isOpen, setIsOpen] = useState(false);

  const onLogout = async () => {
    setIsOpen(false);
    await fetchLoginOut();
  };

  return (
    <>
      <DialogConfirmation
        open={isOpen}
        setIsOpen={setIsOpen}
        onLogout={onLogout}
      />
      <main style={{ 
        position: 'fixed',
        left: '10px',
        top: '194px',
        zIndex: 1001,
      }}>
        <Tooltip title={'Cerrar sesión'} placement="right">
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <IconButton
              onClick={() => setIsOpen(true)}
              sx={{
                width: 50,
                height: 50,
                borderRadius: 2,
                background: 'linear-gradient(45deg, #667eea, #764ba2)',
                boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #5a6fd8, #6a4190)',
                  boxShadow: '0 6px 25px rgba(102, 126, 234, 0.4)',
                  transform: 'translateY(-2px)',
                },
                '&:active': {
                  transform: 'translateY(0px)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              <Logout sx={{ color: '#ffffff', fontSize: 20 }} />
            </IconButton>
          </motion.div>
        </Tooltip>
      </main>
    </>
  );
};

const DialogConfirmation: React.FC<DialogConfirmationProps> = ({
  open,
  setIsOpen,
  onLogout,
}) => {
  return (
    <Dialog
      open={open}
      onClose={() => setIsOpen(false)}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      PaperProps={{
        sx: {
          borderRadius: 3,
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        },
      }}
    >
      <DialogTitle 
        id="alert-dialog-title" 
        sx={{ 
          textAlign: 'center',
          fontWeight: 600,
          color: '#475569',
          background: 'linear-gradient(45deg, #667eea, #764ba2)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        {'Cierre De Sesión'}
      </DialogTitle>
      <DialogContent>
        <Alert 
          severity="warning" 
          icon={<Info />}
          sx={{
            borderRadius: 2,
            backgroundColor: 'rgba(255, 193, 7, 0.1)',
            border: '1px solid rgba(255, 193, 7, 0.3)',
            '& .MuiAlert-icon': {
              color: '#f59e0b',
            },
            '& .MuiAlert-message': {
              color: '#92400e',
            },
          }}
        >
          {'¿Está seguro que desea cerrar sesión?'}
        </Alert>
      </DialogContent>
      <DialogActions sx={{ p: 3, gap: 1 }}>
        <Button 
          onClick={() => setIsOpen(false)} 
          variant="outlined"
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 500,
            borderColor: '#667eea',
            color: '#667eea',
            '&:hover': {
              borderColor: '#5a6fd8',
              backgroundColor: 'rgba(102, 126, 234, 0.1)',
            },
          }}
        >
          Cancelar
        </Button>
        <Button 
          onClick={onLogout} 
          variant="contained"
          autoFocus
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
            background: 'linear-gradient(45deg, #667eea, #764ba2)',
            boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)',
            '&:hover': {
              background: 'linear-gradient(45deg, #5a6fd8, #6a4190)',
              boxShadow: '0 6px 25px rgba(102, 126, 234, 0.4)',
              transform: 'translateY(-1px)',
            },
            '&:active': {
              transform: 'translateY(0px)',
            },
            transition: 'all 0.3s ease',
          }}
        >
          Aceptar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LogoutToolbar;
