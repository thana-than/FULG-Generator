import React from 'react';
import { createRoot } from 'react-dom/client';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, useTexture } from '@react-three/drei';
import { gsap } from 'gsap';
import * as THREE from 'three';
import Card from './js/Card.jsx';
import ImageExport from './js/ImageExport.jsx';
import Generate from './js/generator.js';

//* Actually solves for our imports
import './js/metadata.js'

const App = () => {
    const appCanvas = React.useRef();
    const orbitControls = React.useRef();
    const startTime = React.useRef(null);
    const currentZoom = React.useRef(-1);
    const isDragging = React.useRef(false);

    const POLAR_RAD_MAX = .1
    const MAX_ROTATE_SPEED = 2

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

    React.useEffect(() => {
        GenerateCharacter();
    });

    const GenerateCharacter = () => {
        return Generate();
    }

    return (
        <div style={{
            padding: 0,
            top: 0,
            left: 0,
            position: 'absolute',
            width: '100%', height: '100%',
            background: 'rgb(0,212,255)',
            background: 'radial-gradient(circle, rgba(0,212,255,1) 7%, rgba(25,25,205,1) 35%, rgba(2,0,36,1) 100%)'
        }}>
            <Canvas
                ref={appCanvas}
                camera={{ position: [0, 0, 10], fov: 25 }} // Adjust camera position
                gl={{ preserveDrawingBuffer: true }}
            >
                <Environment preset="apartment" environmentIntensity={1} blur={.5} />
                <ambientLight intensity={1} />
                <Card />
                <ImageExport />
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

/* istanbul ignore next @preserve */
export const startReact = () => {
    const container = document.getElementById('root');
    const root = createRoot(container);
    root.render(<App />);
}

startReact();