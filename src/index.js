import React from 'react';
import { createRoot } from 'react-dom/client';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Environment, useTexture } from '@react-three/drei';
import Card from './js/Card.jsx';

const App = () => {
    const POLAR_RAD_MAX = .1
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
                camera={{ position: [0, 0, 10], fov: 25 }} // Adjust camera position
            >
                <Environment preset="apartment" environmentIntensity={1} blur={.5} />
                <ambientLight intensity={1} />
                <Card />
                <OrbitControls
                    makeDefault
                    enableZoom={true}
                    autoRotate={true}
                    enablePan={false}
                    autoRotateSpeed={2}
                    maxPolarAngle={Math.PI - POLAR_RAD_MAX}
                    minPolarAngle={POLAR_RAD_MAX}
                    minDistance={4}
                    maxDistance={30}
                />
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