import React from 'react';
import Render from './renderer.jsx';

export default function Twitch() {
    return (
        <div className={'main twitch'} >
            <Render rotateSpeed={4} />
        </div>
    );
};