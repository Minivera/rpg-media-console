import React from 'react';
import ReactDOM from 'react-dom/client';
import { Container, Flex, Theme } from '@radix-ui/themes';

import '@radix-ui/themes/styles.css';

import { App } from './App';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Theme
      appearance="dark"
      accentColor="orange"
      grayColor="sage"
      radius="small"
      asChild
    >
      <Container minHeight="100vh" id="container">
        <Flex minHeight="100vh" direction="column">
          <App />
        </Flex>
      </Container>
    </Theme>
  </React.StrictMode>
);
