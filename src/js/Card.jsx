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
import { hsvToRgb, rgbToHex } from './colorutil.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { extend } from '@react-three/fiber'
extend({ TextGeometry })


export const CARD_RES_X = 630;
export const CARD_RES_Y = 880;

export const CARD_SIZE_MULT = .003;
export const CARD_SCALE_WIDTH = CARD_RES_X * CARD_SIZE_MULT;
export const CARD_SCALE_HEIGHT = CARD_RES_Y * CARD_SIZE_MULT;
const CARD_FRAME_Z = .02;

export default function Card() {
    // Load textures
    const [cardFrameTexture, cardOutlineTexture, cardBackLogoTexture, cardBackOutlineTexture, cardBackBGTexture, cardMaskTexture, cardGradientTexture] = useTexture([
        'assets/card_frame.png',
        'assets/card_outline.png',
        'assets/card_back_logo.png',
        'assets/card_back_lines.png',
        'assets/card_back_bg.png',
        'assets/card_mask.png',
        'assets/card_gradient.png'
    ]);

    const fontLoader = new FontLoader();
    //const font_griffy = fontLoader.parse(require('../fonts/Griffy_Regular.json'));
    const font_berlinSans = fontLoader.parse(require('../fonts/Berlin Sans.json'));
    const font_batty = fontLoader.parse(require('../fonts/Batty.json'));

    const cardGroup = React.useRef();
    const cardFace = React.useRef();
    const cardBack = React.useRef();
    const color = getRandomColor();
    const textColor = 0xffffff;

    function getRandomColor() {
        const rgb = hsvToRgb(Math.random(), 1, .4);
        const hex = rgbToHex(rgb[0], rgb[1], rgb[2]);
        return hex;
    }

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

    function FrameBox({ position, size }) {
        return (
            <mesh renderOrder={99} depthWrite={false} position={position} >
                <boxGeometry args={size} />
                <meshBasicMaterial
                    color={color}
                    transparent={true}
                    colorWrite={true}
                    depthWrite={false}
                    depthTest={false}
                    stencilWrite={true}
                    stencilRef={1}
                    stencilFunc={THREE.EqualStencilFunc}
                    stencilZPass={THREE.ReplaceStencilOp}
                    side={THREE.BackSide}
                />
            </mesh>
        );
    }

    function Text({ text, font, position, size }) {
        const textOptions = {
            font: font,
            size: size * CARD_SIZE_MULT,
            depth: 0,
            curveSegments: 12,
        }

        return (
            <mesh renderOrder={1000} position={position}>
                <textGeometry args={[text, textOptions]} />
                <meshBasicMaterial color={textColor}
                    transparent={true}
                    colorWrite={true}
                    depthWrite={false}
                    depthTest={false}
                    stencilWrite={true}
                    stencilRef={1}
                    stencilFunc={THREE.EqualStencilFunc}
                    stencilZPass={THREE.ReplaceStencilOp}
                    side={THREE.BackSide} />
            </mesh>
        )
    }

    return (
        <>
            <group ref={cardGroup} scale={[0, 0, 0]}>

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
                    {/* <FrameBox position={[0, CARD_SCALE_HEIGHT / 2, 0]} size={[1000, .5, CARD_FRAME_Z * 2]} />
                    <FrameBox position={[0, -CARD_SCALE_HEIGHT / 2, 0]} size={[1000, 1, CARD_FRAME_Z * 2]} />
                    <FrameBox position={[CARD_SCALE_WIDTH / 2, 0, 0]} size={[.1, 1000, CARD_FRAME_Z * 2]} />
                    <FrameBox position={[-CARD_SCALE_WIDTH / 2, 0, 0]} size={[.1, 1000, CARD_FRAME_Z * 2]} /> */}

                    <mesh renderOrder={100}>
                        <planeGeometry args={[CARD_SCALE_WIDTH, CARD_SCALE_HEIGHT]} />
                        <meshStandardMaterial map={cardOutlineTexture} color={color} transparent={true} opacity={.66} side={THREE.FrontSide} />
                    </mesh>
                    <Text text={"This is the Name of the Guy"} font={font_berlinSans} position={[-CARD_SCALE_WIDTH / 2 + .085, CARD_SCALE_HEIGHT / 2 - .185, .01]} size={33} />
                    <Text text={"\"And this is a quote!\nWow!\nYippee!\""} font={font_batty} position={[-CARD_SCALE_WIDTH / 2 + .1, -CARD_SCALE_HEIGHT / 2 + .33, .01]} size={33} />
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
                    <mesh renderOrder={99} position={[0, 0, .02]} rotation={[0, Math.PI, 0]}>
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
                    <mesh renderOrder={98} position={[0, 0, .03]} rotation={[0, Math.PI, 0]}>
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