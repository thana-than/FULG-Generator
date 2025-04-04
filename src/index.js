import React from 'react';
import { createRoot } from 'react-dom/client';
import Core from './js/Core.jsx'
import Twitch from './js/Twitch.jsx'

import './css/main.css'
//* Actually solves for our imports
import './js/metadata.js'

const App = () => {
    if (process.env.TWITCH === 'true') {
        return (<Twitch />)
    }

    return (<Core />)
};

/* istanbul ignore next @preserve */
export const startReact = () => {
    const container = document.getElementById('root');
    const root = createRoot(container);
    root.render(<App />);
}

startReact();