import React from 'react';
import { createRoot } from 'react-dom/client';
import { Canvas, useFrame } from '@react-three/fiber';
import Button from './Button.jsx'
import { OrbitControls, Environment, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import Card from './Card.jsx';
import { useThree } from '@react-three/fiber';
import '../css/main.css'

//* Actually solves for our imports
import './metadata.js'

export default function Render({ onCardReadyStateChanged, onCanvasDataChanged, onNewCard, rotateSpeed = 2, distance = 10 }) {
    const appCanvas = React.useRef();
    const orbitControls = React.useRef();
    const card = React.useRef();
    const startTime = React.useRef(null);
    const currentZoom = React.useRef(-1);
    const isDragging = React.useRef(false);
    const POLAR_RAD_MAX = 1


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

    React.useEffect(() => {
        window.refreshCard = refreshCard;
    }, []);

    function CanvasData() {
        const { gl, scene } = useThree();
        React.useEffect(() => {
            if (onCanvasDataChanged) {
                onCanvasDataChanged({ gl, scene });
            }
        }, [gl, scene]);
        return null;
    }

    React.useEffect(() => {
        if (orbitControls.current) {
            const isMobile = "ontouchstart" in window || navigator.maxTouchPoints > 0;
            orbitControls.current.rotateSpeed = isMobile ? 1.66 : 1.0;
        }
    }, [orbitControls.current]);

    const refreshCard = (customID) => {
        setIsCardReady(false);
        setIsCardAnimationComplete(false);
        if (onCardReadyStateChanged)
            onCardReadyStateChanged(false)

        if (customID)
            setCardKey(customID);
        else
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
        if (onCardReadyStateChanged)
            onCardReadyStateChanged(true)
        setIsCardAnimationComplete(true);
    }

    const Loading = () => {
        return <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            width: '100%',
            position: 'absolute',
        }}><div className="loader"></div></div>;
    };

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
                orbitControls.current.autoRotateSpeed = progress * rotateSpeed;
            }
        })
    };

    function handleNewCard(cardParams) {
        if (onNewCard)
            onNewCard(cardParams);
    }

    return (
        <div className={'renderer'}>
            {!isCardReady && <Loading />}
            <Canvas
                ref={appCanvas}
                camera={{ position: [0, 0, distance], fov: 25 }} // Adjust camera position
                gl={{ preserveDrawingBuffer: true, stencil: true, depth: true, powerPreference: 'high-performance', anisotrtophy: 2, samples: 4, antialias: true }}
            >
                <Environment preset="lobby" environmentIntensity={1} blur={.5} />
                <ambientLight intensity={1} />
                <Card key={cardKey} cardID={cardKey} ref={card} onReady={cardReady} onCardCreated={handleNewCard} onAnimationComplete={cardAnimationComplete} />
                <CanvasData />
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
        </div>
    );
};