import React from 'react';
import { createRoot } from 'react-dom/client';

import './css/main.css'
//* Actually solves for our imports
import './js/metadata.js'

/* istanbul ignore next @preserve */
export const Start = (App) => {
    const container = document.getElementById('root');
    const root = createRoot(container);
    root.render(<App />);
}