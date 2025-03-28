import React from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import { gsap } from 'gsap';
import * as THREE from 'three';
import '../css/card.css'
import GenerateCard from './generator.js';
import GenerateCharacter from './CharacterImageGenerator.jsx'
import GenerateBackground from './BackgroundImageGenerator.jsx';
import BGSphere from './BGSphere.jsx';

export const CARD_RES_X = 630;
export const CARD_RES_Y = 880;

export const CARD_SIZE_MULT = .003;
export const CARD_SCALE_WIDTH = CARD_RES_X * CARD_SIZE_MULT;
export const CARD_SCALE_HEIGHT = CARD_RES_Y * CARD_SIZE_MULT;

export default function Card() {
    // Load textures
    const [cardFrameTexture, cardOutlineTexture, cardBackLogoTexture, cardBackOutlineTexture, cardBackBGTexture, cardMaskTexture] = useTexture([
        'assets/card_frame.png',
        'assets/card_outline.png',
        'assets/card_back_logo.png',
        'assets/card_back_lines.png',
        'assets/card_back_bg.png',
        'assets/card_mask.png'
    ]);

    const cardGroup = React.useRef();
    const cardFace = React.useRef();
    const cardBack = React.useRef();


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
                ease: "linear"
            })

            // Animate to full scale
            gsap.to(cardGroup.current.scale, {
                x: 1,
                y: 1,
                z: 1,
                duration: 1,
                ease: "back.out(1.7)"
            });
        }
    }, []);

    return (
        <>
            <group ref={cardGroup}>

                {/* Mask plane - this will define the visible area */}
                <mesh renderOrder={-10000}>
                    <planeGeometry args={[CARD_SCALE_WIDTH, CARD_SCALE_HEIGHT]} />
                    <meshStandardMaterial
                        map={cardMaskTexture}
                        alphaTest={0.5}
                        transparent={true}
                        colorWrite={false}
                        depthWrite={false}
                        depthTest={false}
                        stencilWrite={true}
                        stencilRef={1}
                        stencilFunc={THREE.AlwaysStencilFunc}
                        stencilZPass={THREE.ReplaceStencilOp}
                    />
                </mesh>

                {/* Front side */}
                <group ref={cardFace}>
                    <GenerateBackground />
                    <mesh renderOrder={0} depthWrite={false}>
                        <planeGeometry args={[CARD_SCALE_WIDTH, CARD_SCALE_HEIGHT]} />
                        <meshStandardMaterial map={cardFrameTexture} color={"#FFFF00"} transparent={true} side={THREE.FrontSide} />
                    </mesh>
                    <mesh renderOrder={1} depthWrite={false}>
                        <planeGeometry args={[CARD_SCALE_WIDTH, CARD_SCALE_HEIGHT]} />
                        <meshStandardMaterial map={cardOutlineTexture} color={'black'} transparent={true} side={THREE.FrontSide} />
                    </mesh>
                    <GenerateCharacter />
                </group>

                <mesh renderOrder={90} rotation={[0, Math.PI, 0]}>
                    <planeGeometry args={[CARD_SCALE_WIDTH, CARD_SCALE_HEIGHT]} />
                    <meshStandardMaterial
                        map={cardMaskTexture}
                        alphaTest={0.5}
                        transparent={true}
                        colorWrite={false}
                        depthWrite={false}
                        depthTest={false}
                        stencilWrite={true}
                        stencilRef={2}
                        stencilFunc={THREE.AlwaysStencilFunc}
                        stencilZPass={THREE.ReplaceStencilOp}
                        side={THREE.FrontSide}
                    />
                </mesh>

                {/* Back side (flipped) */}
                <group ref={cardBack}>
                    <mesh renderOrder={100} rotation={[0, Math.PI, 0]}>
                        <planeGeometry args={[CARD_SCALE_WIDTH, CARD_SCALE_HEIGHT]} />
                        <meshStandardMaterial map={cardBackLogoTexture} transparent={true} side={THREE.FrontSide} />
                    </mesh>
                    <mesh renderOrder={99} position={[0, 0, .03]} rotation={[0, Math.PI, 0]}>
                        <planeGeometry args={[CARD_SCALE_WIDTH, CARD_SCALE_HEIGHT]} />
                        <meshStandardMaterial map={cardBackOutlineTexture} transparent={true} side={THREE.FrontSide}
                            depthWrite={true}
                            depthTest={false}
                            stencilWrite={true}
                            stencilRef={2}
                            stencilFunc={THREE.EqualStencilFunc}
                            stencilFail={THREE.KeepStencilOp}
                            stencilZPass={THREE.KeepStencilOp} />
                    </mesh>
                    <mesh renderOrder={98} position={[0, 0, .04]} rotation={[0, Math.PI, 0]}>
                        <planeGeometry args={[CARD_SCALE_WIDTH, CARD_SCALE_HEIGHT]} />
                        <meshStandardMaterial map={cardBackOutlineTexture} transparent={true} side={THREE.FrontSide}
                            depthWrite={true}
                            depthTest={false}
                            stencilWrite={true}
                            stencilRef={2}
                            stencilFunc={THREE.EqualStencilFunc}
                            stencilFail={THREE.KeepStencilOp}
                            stencilZPass={THREE.KeepStencilOp} />
                    </mesh>

                    <mesh renderOrder={96} position={[0, 0, .05]} rotation={[0, Math.PI, 0]}>
                        <planeGeometry args={[cardBackBGTexture.image.width * CARD_SIZE_MULT, cardBackBGTexture.image.height * CARD_SIZE_MULT]} />
                        <meshStandardMaterial map={cardBackBGTexture} transparent={true} side={THREE.FrontSide}
                            depthWrite={true}
                            depthTest={false}
                            stencilWrite={true}
                            stencilRef={2}
                            stencilFunc={THREE.EqualStencilFunc}
                            stencilFail={THREE.KeepStencilOp}
                            stencilZPass={THREE.KeepStencilOp} />
                    </mesh>
                </group>
            </group>

            <BGSphere color={0x292929} renderOrder={95} stencilRef={2} />
        </>
    );
}