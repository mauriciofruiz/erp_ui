import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from '@/store';
import { BrowserRouter } from 'react-router-dom';
import { Front } from './Front';
import { CustomThemeProvider } from './ui';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <CustomThemeProvider>
          <Front />
        </CustomThemeProvider>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);
