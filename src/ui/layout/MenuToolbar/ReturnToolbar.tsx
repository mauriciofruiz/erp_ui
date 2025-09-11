'use client';
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AppDispatch, RootState } from '@/store';
import { useDispatch, useSelector } from 'react-redux';
import { Tooltip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { setHistoryMenu, setMenu } from '@/store/auth/authSlice';

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
    <main style={{ position: 'relative' }}>
      <div>
        <div
          style={{
            position: 'absolute',
            top: '64px',
            left: '-60px',
            bottom: 0,
            width: '100px',
            backgroundColor: '#4f5052',
            clipPath: 'circle(30px at 40px 40px)',
          }}
        />
        <Tooltip title={'Regresar'}>
          <motion.button
            whileHover={{ scale: 1.4 }}
            whileTap={{ scale: 0.9 }}
            className="button-sidebar-return"
            onClick={handleReturn}
            disabled={disableButton}
          >
            <svg
              viewBox="0 0 1024 1024"
              xmlns="http://www.w3.org/2000/svg"
              fill="#000000"
            >
              <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
              <g
                id="SVGRepo_tracerCarrier"
                strokeLinecap="round"
                strokeLinejoin="round"
              ></g>
              <g id="SVGRepo_iconCarrier">
                <path
                  fill="#ffffff"
                  d="M224 480h640a32 32 0 1 1 0 64H224a32 32 0 0 1 0-64z"
                ></path>
                <path
                  fill="#ffffff"
                  d="m237.248 512 265.408 265.344a32 32 0 0 1-45.312 45.312l-288-288a32 32 0 0 1 0-45.312l288-288a32 32 0 1 1 45.312 45.312L237.248 512z"
                ></path>
              </g>
            </svg>
          </motion.button>
        </Tooltip>
      </div>
    </main>
  );
};

export default ReturnToolbar;
