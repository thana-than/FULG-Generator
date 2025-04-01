import React from 'react';
import { createRoot } from 'react-dom/client';
import { Canvas, useFrame } from '@react-three/fiber';
import Button from './js/Button.jsx'
import { OrbitControls, Environment, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import Card from './js/Card.jsx';
import ImageExport from './js/ImageExport.jsx';
import { useThree } from '@react-three/fiber';
import './css/main.css'

//* Actually solves for our imports
import './js/metadata.js'

const creditLink = 'https://bsky.app/profile/than.pocketmoon.games';
const creditCopy = 'Made by Than';

const App = () => {
    const appCanvas = React.useRef();
    const orbitControls = React.useRef();
    const card = React.useRef();
    const startTime = React.useRef(null);
    const currentZoom = React.useRef(-1);
    const isDragging = React.useRef(false);
    const POLAR_RAD_MAX = 1
    const MAX_ROTATE_SPEED = -2


    const [cardKey, setCardKey] = React.useState(0);
    const [isCardReady, setIsCardReady] = React.useState(false);
    const [isCardAnimationComplete, setIsCardAnimationComplete] = React.useState(false);

    React.useEffect(() => {
        const handleTouchStart = () => {
            document.body.classList.add("no-hover");
        };

        window.addEventListener("touchstart", handleTouchStart, { once: true });

        return () => {
            window.removeEventListener("touchstart", handleTouchStart);
        };
    }, []);

    const refreshCard = () => {
        setIsCardReady(false);
        setIsCardAnimationComplete(false);
        setCardKey(prevKey => prevKey + 1);
    };

    const cardReady = () => {
        if (orbitControls.current) {
            orbitControls.current.reset();
            startTime.current = null;
        }
        setIsCardReady(true)
    }

    const cardAnimationComplete = () => {
        setIsCardAnimationComplete(true);
    }

    const ControlsUpdater = () => {
        useFrame((state) => {
            //* Controls that pause the orbit when we drag at all
            if (!orbitControls.current) return;

            if (isDragging.current)
                return;

            if (!startTime.current) {
                startTime.current = state.clock.elapsedTime;
            }

            const elapsed = state.clock.elapsedTime - startTime.current;
            const delay = 2;
            const duration = 1;

            if (elapsed < delay) {
                orbitControls.current.autoRotateSpeed = 0;
            }
            else {
                const progress = Math.min((elapsed - delay) / duration, 1);
                orbitControls.current.autoRotateSpeed = progress * MAX_ROTATE_SPEED;
            }
        })
    };

    const canvasData = React.useRef({ gl: null, scene: null });

    function CanvasData() {
        const { gl, scene } = useThree();
        React.useEffect(() => {
            canvasData.current = { gl, scene };
        }, [gl, scene]);
        return null;
    }

    function CopyLine() {
        return (<a href={creditLink} target={'_blank'} className={'copy'}>{creditCopy}</a>);
    }

    return (
        <div className={'main'}>
            <Canvas
                ref={appCanvas}
                camera={{ position: [0, 0, 10], fov: 25 }} // Adjust camera position
                gl={{ preserveDrawingBuffer: true, stencil: true, depth: true, powerPreference: 'high-performance', anisotrtophy: 2, samples: 4, antialias: true }}
            >
                <Environment preset="lobby" environmentIntensity={1} blur={.5} />
                <ambientLight intensity={1} />
                <Card key={cardKey} ref={card} onReady={cardReady} onAnimationComplete={cardAnimationComplete} />
                <CanvasData ref={canvasData} />
                <OrbitControls
                    onStart={() => {
                        if (currentZoom.current = -1)
                            currentZoom.current = orbitControls.current.getDistance();
                    }}
                    onEnd={() => {
                        //* If the zoom is the same at the end here, then the controls were a rotation not a zoom
                        const zoom = orbitControls.current.getDistance();
                        if (Math.abs(zoom - currentZoom.current) <= .01)
                            startTime.current = null;

                        currentZoom.current = zoom;
                    }}

                    ref={orbitControls}
                    makeDefault
                    enableZoom={true}
                    autoRotate={true}
                    enablePan={false}
                    maxPolarAngle={Math.PI - POLAR_RAD_MAX}
                    minPolarAngle={POLAR_RAD_MAX}
                    minDistance={4}
                    maxDistance={30}
                    mouseButtons={{
                        LEFT: THREE.MOUSE.ROTATE,
                        MIDDLE: THREE.MOUSE.DOLLY,
                        RIGHT: THREE.MOUSE.ROTATE
                    }}
                />
                <ControlsUpdater />

            </Canvas>

            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                gap: '.5em',
                bottom: '1em',
                width: '100%',
                position: 'absolute',
            }}>
                <Button label={"NEW CARD"} onClick={refreshCard} />
                <ImageExport isCardReady={isCardAnimationComplete} gl={canvasData.current?.gl} scene={canvasData.current?.scene} />
            </div>

            <div style={{
                textAlign: 'right',
                top: '.5em',
                marginLeft: '1em',
                marginRight: '1em',
                width: 'calc(100% - 2em)',
                position: 'absolute',
                paddingRight: '50em',
            }}>
                <CopyLine />
            </div>
        </div>
    );
};

/* istanbul ignore next @preserve */
export const startReact = () => {
    const container = document.getElementById('root');
    const root = createRoot(container);
    root.render(<App />);
}

startReact();