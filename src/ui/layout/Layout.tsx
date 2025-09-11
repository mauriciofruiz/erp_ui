import { Container } from '@mui/material';
import { TopBar } from './TopBar';
import { LogoutToolbar, MenuToolbar, ReturnToolbar } from './MenuToolbar';

export const Layout = (props: any) => {
  return (
    <>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
        }}
      >
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1,
          }}
        >
          <TopBar />
        </div>
        <div
          style={{
            display: 'flex',
            flex: 1,
            marginTop: '62px',
            position: 'relative',
          }}
        >
          <MenuToolbar />
          <ReturnToolbar />
          <LogoutToolbar />
          <Container style={{ maxWidth: 'calc(100vw - 5%)' }}>
            {props.children}
          </Container>
        </div>
      </div>
    </>
  );
};
