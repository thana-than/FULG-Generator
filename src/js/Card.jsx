import React from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import '../css/card.css'

export default function Card() {
    const CARD_SIZE_MULT = .03;
    const CARD_WIDTH = 63 * CARD_SIZE_MULT;
    const CARD_HEIGHT = 88 * CARD_SIZE_MULT;

    // Load textures (replace with your card background and character)
    const cardTexture = useTexture('assets/card.png');
    const cardBackTexture = useTexture('assets/back.png');
    const characterTexture = useTexture('assets/fulg_test.png');

    const cardGroup = React.useRef();

    return (
        <group ref={cardGroup}>
            {/* Front side */}
            <mesh position={[0, 0, 0.0001]}>
                <planeGeometry args={[CARD_WIDTH, CARD_HEIGHT]} />
                <meshStandardMaterial map={cardTexture} side={THREE.FrontSide} />
            </mesh>
            {/* Back side (flipped) */}
            <mesh position={[0, 0, -0.0001]} rotation={[0, Math.PI, 0]}>
                <planeGeometry args={[CARD_WIDTH, CARD_HEIGHT]} />
                <meshStandardMaterial map={cardBackTexture} side={THREE.FrontSide} />
            </mesh>
        </group>
    );
}