import React from 'react';
import { renderToString } from 'react-dom/server';
import App from './src/App.jsx';
try {
  console.log(renderToString(React.createElement(App)));
} catch (e) {
  console.error("CRASH:", e);
}
