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
} from '@mui/material';
import { useLoginAsync } from '@/hooks';
import { Info } from '@mui/icons-material';

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
      <main style={{ position: 'relative' }}>
        <div>
          <div
            style={{
              position: 'absolute',
              top: '128px',
              left: '-60px',
              bottom: 0,
              width: '100px',
              backgroundColor: '#4f5052',
              clipPath: 'circle(30px at 40px 40px)',
            }}
          />
          <Tooltip title={'Cerrar sesión'}>
            <motion.button
              whileHover={{ scale: 1.4 }}
              whileTap={{ scale: 0.9 }}
              className="button-sidebar-logout"
              onClick={() => setIsOpen(true)}
            >
              <svg
                width="27"
                height="27"
                viewBox="0 0 23 23"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                <g
                  id="SVGRepo_tracerCarrier"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                ></g>
                <g id="SVGRepo_iconCarrier">
                  <path
                    d="M15 12L2 12M2 12L5.5 9M2 12L5.5 15"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                    fill="transparent"
                    stroke="#ffffff"
                    strokeLinecap="round"
                  ></path>
                  <path
                    d="M9.00195 7C9.01406 4.82497 9.11051 3.64706 9.87889 2.87868C10.7576 2 12.1718 2 15.0002 2L16.0002 2C18.8286 2 20.2429 2 21.1215 2.87868C22.0002 3.75736 22.0002 5.17157 22.0002 8L22.0002 16C22.0002 18.8284 22.0002 20.2426 21.1215 21.1213C20.3531 21.8897 19.1752 21.9862 17 21.9983M9.00195 17C9.01406 19.175 9.11051 20.3529 9.87889 21.1213C10.5202 21.7626 11.4467 21.9359 13 21.9827"
                    strokeWidth="1.5"
                    stroke="#ffffff"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  ></path>
                </g>
              </svg>
            </motion.button>
          </Tooltip>
        </div>
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
    >
      <DialogTitle id="alert-dialog-title" sx={{ textAlign: 'center' }}>
        {'Cierre De Sesión'}
      </DialogTitle>
      <DialogContent>
        <Alert severity="warning" icon={<Info />}>
          {'¿Está seguro que desea cerrar sesión?'}
        </Alert>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setIsOpen(false)} color="primary">
          Cancelar
        </Button>
        <Button onClick={onLogout} color="primary" autoFocus>
          Aceptar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LogoutToolbar;
