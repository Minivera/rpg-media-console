import React from 'react';
import ReactDOM from 'react-dom/client';
import { Theme } from '@radix-ui/themes';

import '@radix-ui/themes/styles.css';

import { App } from './App';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Theme
      appearance="dark"
      accentColor="orange"
      grayColor="sage"
      radius="small"
    >
      <App />
    </Theme>
  </React.StrictMode>
);
