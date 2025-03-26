import React from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import { gsap } from 'gsap';
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

    React.useEffect(() => {
        if (cardGroup.current) {
            // Set initial scale
            cardGroup.current.scale.set(0.01, 0.01, 0.01);

            cardGroup.current.rotation.set(0, -Math.PI * 2, 0);

            gsap.to(cardGroup.current.rotation, {
                x: 0,
                y: 0,
                z: 0,
                duration: 0.5,
                ease: "linear" // Nice elastic effect
            })

            // Animate to full scale
            gsap.to(cardGroup.current.scale, {
                x: 1,
                y: 1,
                z: 1,
                duration: 1,
                ease: "back.out(1.7)" // Nice elastic effect
            });
        }
    }, []);

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