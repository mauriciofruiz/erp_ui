'use client';
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AppDispatch, RootState } from '@/store';
import { useDispatch, useSelector } from 'react-redux';
import { Tooltip, IconButton } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { setHistoryMenu, setMenu } from '@/store/auth/authSlice';
import { ArrowBack } from '@mui/icons-material';

export type ReturnToolbarProps = {
  // types...
};

const ReturnToolbar: React.FC<ReturnToolbarProps> = ({}) => {
  const dispatch: AppDispatch = useDispatch();

  const { historyMenu } = useSelector((state: RootState) => state.auth);

  const navigate = useNavigate();

  const [disableButton, setDisableButton] = useState(false);

  const handleReturn = async () => {
    if (historyMenu.length >= 1) {
      const lastMenu = historyMenu[historyMenu.length - 1];
      const newHistoryMenu = historyMenu.slice(0, -1); // Create a new array without the last element
      dispatch(setHistoryMenu(newHistoryMenu));
      // Get the new last menu
      dispatch(setMenu(lastMenu));
      localStorage.setItem('activeMenu', JSON.stringify(lastMenu));
      localStorage.removeItem('state');
      navigate(lastMenu.menuUrl);
      window.scrollTo(0, 0);
    }
  };

  useEffect(() => {
    if (historyMenu.length >= 1) {
      setDisableButton(false);
    } else {
      setDisableButton(true);
    }
  }, [historyMenu]);

  return (
    <main style={{ 
      position: 'fixed',
      left: '10px',
      top: '134px',
      zIndex: 1001,
    }}>
      <Tooltip title={'Regresar'} placement="right">
        <motion.div
          whileHover={{ scale: disableButton ? 1 : 1.1 }}
          whileTap={{ scale: disableButton ? 1 : 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          <IconButton
            onClick={handleReturn}
            disabled={disableButton}
            sx={{
              width: 50,
              height: 50,
              borderRadius: 2,
              background: disableButton 
                ? 'linear-gradient(45deg, #cbd5e1, #94a3b8)' 
                : 'linear-gradient(45deg, #667eea, #764ba2)',
              boxShadow: disableButton 
                ? '0 2px 10px rgba(148, 163, 184, 0.2)' 
                : '0 4px 20px rgba(102, 126, 234, 0.3)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(10px)',
              '&:hover': {
                background: disableButton 
                  ? 'linear-gradient(45deg, #cbd5e1, #94a3b8)' 
                  : 'linear-gradient(45deg, #5a6fd8, #6a4190)',
                boxShadow: disableButton 
                  ? '0 2px 10px rgba(148, 163, 184, 0.2)' 
                  : '0 6px 25px rgba(102, 126, 234, 0.4)',
                transform: disableButton ? 'none' : 'translateY(-2px)',
              },
              '&:active': {
                transform: disableButton ? 'none' : 'translateY(0px)',
              },
              transition: 'all 0.3s ease',
              '&:disabled': {
                opacity: 0.5,
              },
            }}
          >
            <ArrowBack sx={{ 
              color: '#ffffff', 
              fontSize: 20,
              opacity: disableButton ? 0.5 : 1,
            }} />
          </IconButton>
        </motion.div>
      </Tooltip>
    </main>
  );
};

export default ReturnToolbar;
