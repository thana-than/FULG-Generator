import React from 'react';
import Render from './renderer.jsx';
import { gsap } from 'gsap';

export default function Twitch({ visibleSeconds, onNewCard }) {
    const renderRef = React.useRef();

    React.useEffect(() => {
        if (!renderRef.current)
            return;

        renderRef.current.style.visibility = 'hidden';
    }, []);

    async function onCardReady(cardParams) {
        if (!renderRef.current || !cardParams.cardID) //* Don't call if app just started
            return;

        if (onNewCard)
            onNewCard(cardParams);

        await gsap.to(renderRef.current, {
            scaleX: 1,
            scaleY: 1,
            duration: .1,
            ease: "linear",
            overwrite: true,
        });

        renderRef.current.style.visibility = 'visible';

        await gsap.to(renderRef.current, {
            scaleX: 0,
            scaleY: 0,
            delay: visibleSeconds,
            duration: .333,
            ease: "power2",
            overwrite: true,
        });
    }


    console.log("Render mounted")

    return (
        <div className={'main twitch'} ref={renderRef} >
            <Render onNewCard={onCardReady} rotateSpeed={0} distance={7.5} />
        </div>
    );
};