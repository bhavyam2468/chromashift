import React from 'react';
import { renderToString } from 'react-dom/server';
import App from './src/App.jsx';

try {
  const html = renderToString(React.createElement(App));
  console.log('SUCCESS');
} catch (e) {
  console.error('CRASH:', e.message, e.stack);
}
