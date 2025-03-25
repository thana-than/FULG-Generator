import React from 'react';
import { createRoot } from 'react-dom/client';
import Card from './js/Card.jsx';

const App = () => (
    <Card />
);

/* istanbul ignore next @preserve */
export const startReact = () => {
    const container = document.getElementById('root');
    const root = createRoot(container);
    root.render(<App />);
}

startReact();