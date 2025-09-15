import React from 'react';
import { Tooltip, IconButton } from '@mui/material';
import { motion } from 'framer-motion';
import { Menu } from '@mui/icons-material';

const Path = (props: any) => (
  <motion.path
    fill="transparent"
    strokeWidth="2.5"
    stroke="#ffffff"
    strokeLinecap="round"
    {...props}
  />
);

export const MenuToggle = ({ toggle }: any) => (
  <Tooltip title={'Menú'} placement="right">
    <motion.div
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      <IconButton
        onClick={toggle}
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
        <svg width="20" height="20" viewBox="0 0 23 23">
          <Path
            variants={{
              closed: { d: 'M 2 2.5 L 20 2.5' },
              open: { d: 'M 3 16.5 L 17 2.5' },
            }}
          />
          <Path
            d="M 2 9.423 L 20 9.423"
            variants={{
              closed: { opacity: 1 },
              open: { opacity: 0 },
            }}
            transition={{ duration: 0.1 }}
          />
          <Path
            variants={{
              closed: { d: 'M 2 16.346 L 20 16.346' },
              open: { d: 'M 3 2.5 L 17 16.346' },
            }}
          />
        </svg>
      </IconButton>
    </motion.div>
  </Tooltip>
);
