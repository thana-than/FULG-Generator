import React from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import { gsap } from 'gsap';
import * as THREE from 'three';
import '../css/card.css'

export const CARD_RES_X = 630;
export const CARD_RES_Y = 880;

export const CARD_SIZE_MULT = .003;
export const CARD_SCALE_WIDTH = CARD_RES_X * CARD_SIZE_MULT;
export const CARD_SCALE_HEIGHT = CARD_RES_Y * CARD_SIZE_MULT;

export default function Card() {
    // Load textures
    const [cardFrameTexture, cardOutlineTexture, cardBackTexture] = useTexture([
        'assets/card_frame.png',
        'assets/card_outline.png',
        'assets/back.png'
    ]);

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

            <mesh renderOrder={0}>
                <planeGeometry args={[CARD_SCALE_WIDTH, CARD_SCALE_HEIGHT]} />
                <meshStandardMaterial map={cardFrameTexture} color={"#FFFF00"} transparent={true} side={THREE.FrontSide} />
            </mesh>
            <mesh renderOrder={1}>
                <planeGeometry args={[CARD_SCALE_WIDTH, CARD_SCALE_HEIGHT]} />
                <meshStandardMaterial map={cardOutlineTexture} color={'black'} transparent={true} side={THREE.FrontSide} />
            </mesh>
            {/* Back side (flipped) */}
            <mesh renderOrder={100} rotation={[0, Math.PI, 0]}>
                <planeGeometry args={[CARD_SCALE_WIDTH, CARD_SCALE_HEIGHT]} />
                <meshStandardMaterial map={cardBackTexture} transparent={true} side={THREE.FrontSide} />
            </mesh>
        </group>
    );
}