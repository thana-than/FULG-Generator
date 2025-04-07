import React from 'react';
import Render from './renderer.jsx';
import { gsap } from 'gsap';

export default function Twitch() {
    const renderRef = React.useRef();

    React.useEffect(() => {
        if (!renderRef.current)
            return;

        renderRef.current.style.visibility = 'hidden';
    }, []);

    async function onCardReady() {
        if (!renderRef.current)
            return;

        renderRef.current.style.visibility = 'visible';
        await gsap.to(renderRef.current, {
            scaleX: 1,
            scaleY: 1,
            scaleZ: 1,
            duration: .1,
            ease: "linear",
            overwrite: true,
        });

        await gsap.to(renderRef.current, {
            scaleX: 0,
            scaleY: 0,
            scaleZ: 0,
            delay: 5,
            duration: 1,
            ease: "power2",
            overwrite: true,
        });
    }

    return (
        <div className={'main twitch'} ref={renderRef} >
            <Render onNewCard={onCardReady} rotateSpeed={0} distance={7.5} />
        </div>
    );
};