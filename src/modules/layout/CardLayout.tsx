import { Cancel } from '@mui/icons-material';
import {
  Card,
  CardHeader,
  Typography,
  CardContent,
  Box,
  IconButton,
  Tooltip,
} from '@mui/material';
import React from 'react';

export type CardLayoutProps = {
  title: string;
  children: React.ReactNode;
  height?: string;
  createMode?: boolean;
  cancelFunction?: () => void;
  marginTop?: number;
  positionTitle?: 'center' | 'left' | 'right' | 'inherit' | 'justify';
  headerActions?: React.ReactNode;
};

export const CardLayout: React.FC<CardLayoutProps> = ({
  title,
  children,
  height = 'auto',
  createMode = false,
  cancelFunction = () => {},
  marginTop = '1%',
  positionTitle = 'center',
  headerActions: action = null,
}) => {
  return (
    <Card sx={{ height: { height }, mt: { marginTop } }}>
      {createMode && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            marginBottom: '10px',
          }}
        >
          <Tooltip title="Cancelar Creación">
            <IconButton
              onClick={cancelFunction}
            >
              <Cancel />
            </IconButton>
          </Tooltip>
        </Box>
      )}

      <CardHeader
        style={{ backgroundColor: '#4f5052' }}
        title={
          <Typography
            variant="h6"
            style={{ textAlign: positionTitle, color: '#fff' }}
          >
            {title}
          </Typography>
        }
        action={action}
      />

      <CardContent>{children}</CardContent>
    </Card>
  );
};
