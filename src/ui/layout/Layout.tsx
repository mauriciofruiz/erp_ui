import { useState } from 'react';
import { Container, Box, useTheme, useMediaQuery } from '@mui/material';
import { TopBar } from './TopBar';
import { LogoutToolbar, MenuToolbar, ReturnToolbar } from './MenuToolbar';

export const Layout = (props: any) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleMenuToggle = (isOpen: boolean) => {
    setIsMenuOpen(isOpen);
  };

  // Calculate responsive margins and widths
  const getContentMargin = () => {
    if (isMobile) {
      return isMenuOpen ? '280px' : '60px';
    }
    return isMenuOpen ? '280px' : '60px';
  };

  const getContentMaxWidth = () => {
    if (isMobile) {
      return isMenuOpen ? 'calc(100vw - 300px)' : 'calc(100vw - 80px)';
    }
    return isMenuOpen ? 'calc(100vw - 300px)' : 'calc(100vw - 80px)';
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden', // Prevent horizontal scroll
      }}
    >
      <TopBar />
      <Box
        sx={{
          display: 'flex',
          flex: 1,
          marginTop: '62px',
          position: 'relative',
          transition: 'margin-left 0.3s ease-in-out', // Smooth transition
          marginLeft: getContentMargin(),
        }}
      >
        <MenuToolbar onMenuToggle={handleMenuToggle} />
        {!isMenuOpen && <ReturnToolbar />}
        {!isMenuOpen && <LogoutToolbar />}
        
        {/* Main Content Area */}
        <Box
          sx={{
            flex: 1,
            py: 3,
            px: 2,
            transition: 'all 0.3s ease-in-out', // Smooth transition
            minWidth: 0, // Prevent flex item from overflowing
          }}
        >
          <Container 
            maxWidth={false}
            sx={{ 
              maxWidth: getContentMaxWidth(),
              margin: 0,
              padding: 0,
            }}
          >
            <Box
              sx={{
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: 3,
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                minHeight: 'calc(100vh - 100px)',
                p: 3,
                transition: 'all 0.3s ease-in-out', // Smooth transition
              }}
            >
              {props.children}
            </Box>
          </Container>
        </Box>
      </Box>
    </Box>
  );
};
